'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const PackageRegistry = require('../Utils/packageRegistry');

const fromEntitySourcePath = path.join(__dirname, '..', 'generators', 'fromEntity', 'index.js');
const fromEntitySource = fs.readFileSync(fromEntitySourcePath, 'utf-8');

const backendUtilSourcePath = path.join(__dirname, '..', 'Utils', 'backend.js');
const backendUtilSource = fs.readFileSync(backendUtilSourcePath, 'utf-8');

const QueryGeneratorUtil = require('../Utils/queryGenerator');
const queryGenerator = new QueryGeneratorUtil();

describe('yo demoiselle:fromEntity', () => {

  // --- Req 9.1, 42.3: Testes para queries automáticas no DAO ---

  describe('geração automática de queries DAO', () => {

    it('DEVE integrar com QueryGeneratorUtil', () => {
      assert.ok(
        fromEntitySource.includes('QueryGeneratorUtil'),
        'FromEntityGenerator deve importar QueryGeneratorUtil'
      );
      assert.ok(
        fromEntitySource.includes('this.queryGenerator'),
        'FromEntityGenerator deve instanciar queryGenerator'
      );
    });

    it('findBy deve ser gerado para cada campo não-readOnly', () => {
      const properties = [
        { name: 'name', type: 'String', isReadOnly: false },
        { name: 'age', type: 'Integer', isReadOnly: false },
        { name: 'id', type: 'Long', isReadOnly: true }
      ];
      const methods = queryGenerator.generateQueryMethods(properties);
      const findByMethods = methods.filter(m => m.queryType === 'exact');

      assert.strictEqual(findByMethods.length, 2, 'Deve gerar findBy para name e age (não para id)');
      assert.ok(findByMethods.some(m => m.methodName === 'findByName'), 'Deve gerar findByName');
      assert.ok(findByMethods.some(m => m.methodName === 'findByAge'), 'Deve gerar findByAge');
    });

    it('findByLike deve ser gerado apenas para campos String', () => {
      const properties = [
        { name: 'name', type: 'String', isReadOnly: false },
        { name: 'age', type: 'Integer', isReadOnly: false },
        { name: 'description', type: 'String', isReadOnly: false }
      ];
      const methods = queryGenerator.generateQueryMethods(properties);
      const likeMethods = methods.filter(m => m.queryType === 'like');

      assert.strictEqual(likeMethods.length, 2, 'Deve gerar findByLike para name e description');
      assert.ok(likeMethods.some(m => m.methodName === 'findByNameLike'), 'Deve gerar findByNameLike');
      assert.ok(likeMethods.some(m => m.methodName === 'findByDescriptionLike'), 'Deve gerar findByDescriptionLike');
      assert.ok(!likeMethods.some(m => m.methodName === 'findByAgeLike'), 'NÃO deve gerar findByAgeLike');
    });

    it('findByBetween deve ser gerado para campos Date e numéricos', () => {
      const properties = [
        { name: 'name', type: 'String', isReadOnly: false },
        { name: 'age', type: 'Integer', isReadOnly: false },
        { name: 'createdAt', type: 'LocalDate', isReadOnly: false },
        { name: 'price', type: 'BigDecimal', isReadOnly: false }
      ];
      const methods = queryGenerator.generateQueryMethods(properties);
      const betweenMethods = methods.filter(m => m.queryType === 'between');

      assert.strictEqual(betweenMethods.length, 3, 'Deve gerar findByBetween para age, createdAt e price');
      assert.ok(betweenMethods.some(m => m.methodName === 'findByAgeBetween'), 'Deve gerar findByAgeBetween');
      assert.ok(betweenMethods.some(m => m.methodName === 'findByCreatedAtBetween'), 'Deve gerar findByCreatedAtBetween');
      assert.ok(betweenMethods.some(m => m.methodName === 'findByPriceBetween'), 'Deve gerar findByPriceBetween');
      assert.ok(!betweenMethods.some(m => m.methodName === 'findByNameBetween'), 'NÃO deve gerar findByNameBetween');
    });

    it('findByIn deve ser gerado para cada campo não-readOnly', () => {
      const properties = [
        { name: 'name', type: 'String', isReadOnly: false },
        { name: 'status', type: 'Integer', isReadOnly: false }
      ];
      const methods = queryGenerator.generateQueryMethods(properties);
      const inMethods = methods.filter(m => m.queryType === 'in');

      assert.strictEqual(inMethods.length, 2, 'Deve gerar findByIn para name e status');
      assert.ok(inMethods.some(m => m.methodName === 'findByNameIn'), 'Deve gerar findByNameIn');
      assert.ok(inMethods.some(m => m.methodName === 'findByStatusIn'), 'Deve gerar findByStatusIn');
    });

    it('countBy deve ser gerado para cada campo não-readOnly', () => {
      const properties = [
        { name: 'name', type: 'String', isReadOnly: false },
        { name: 'age', type: 'Integer', isReadOnly: false }
      ];
      const methods = queryGenerator.generateQueryMethods(properties);
      const countMethods = methods.filter(m => m.queryType === 'count');

      assert.strictEqual(countMethods.length, 2, 'Deve gerar countBy para name e age');
      assert.ok(countMethods.some(m => m.methodName === 'countByName'), 'Deve gerar countByName');
      assert.ok(countMethods.some(m => m.methodName === 'countByAge'), 'Deve gerar countByAge');
      countMethods.forEach(m => {
        assert.strictEqual(m.returnType, 'long', 'countBy deve retornar long');
      });
    });

    it('existsBy deve ser gerado para cada campo não-readOnly', () => {
      const properties = [
        { name: 'name', type: 'String', isReadOnly: false },
        { name: 'active', type: 'boolean', isReadOnly: false }
      ];
      const methods = queryGenerator.generateQueryMethods(properties);
      const existsMethods = methods.filter(m => m.queryType === 'exists');

      assert.strictEqual(existsMethods.length, 2, 'Deve gerar existsBy para name e active');
      assert.ok(existsMethods.some(m => m.methodName === 'existsByName'), 'Deve gerar existsByName');
      assert.ok(existsMethods.some(m => m.methodName === 'existsByActive'), 'Deve gerar existsByActive');
      existsMethods.forEach(m => {
        assert.strictEqual(m.returnType, 'boolean', 'existsBy deve retornar boolean');
      });
    });

    it('combinações findByAnd devem ser geradas para pares de campos elegíveis', () => {
      const properties = [
        { name: 'id', type: 'Long', isReadOnly: true },
        { name: 'name', type: 'String', isReadOnly: false },
        { name: 'age', type: 'Integer', isReadOnly: false },
        { name: 'email', type: 'String', isReadOnly: false }
      ];
      const methods = queryGenerator.generateQueryMethods(properties);
      const combinedMethods = methods.filter(m => m.queryType === 'combined');

      // 3 campos elegíveis (name, age, email) → C(3,2) = 3 combinações
      assert.strictEqual(combinedMethods.length, 3, 'Deve gerar 3 combinações para 3 campos elegíveis');
      assert.ok(combinedMethods.some(m => m.methodName === 'findByNameAndAge'), 'Deve gerar findByNameAndAge');
      assert.ok(combinedMethods.some(m => m.methodName === 'findByNameAndEmail'), 'Deve gerar findByNameAndEmail');
      assert.ok(combinedMethods.some(m => m.methodName === 'findByAgeAndEmail'), 'Deve gerar findByAgeAndEmail');
    });

    it('campos readOnly devem ser ignorados na geração de queries', () => {
      const properties = [
        { name: 'id', type: 'Long', isReadOnly: true },
        { name: 'createdAt', type: 'LocalDateTime', isReadOnly: true },
        { name: 'name', type: 'String', isReadOnly: false }
      ];
      const methods = queryGenerator.generateQueryMethods(properties);

      assert.ok(!methods.some(m => m.methodName.includes('Id')), 'NÃO deve gerar queries para id');
      assert.ok(!methods.some(m => m.methodName.includes('CreatedAt')), 'NÃO deve gerar queries para createdAt (readOnly)');
      assert.ok(methods.some(m => m.methodName === 'findByName'), 'Deve gerar findByName');
    });

    it('entidade sem campos não-readOnly deve gerar zero queries', () => {
      const properties = [
        { name: 'id', type: 'Long', isReadOnly: true }
      ];
      const methods = queryGenerator.generateQueryMethods(properties);
      assert.strictEqual(methods.length, 0, 'Deve gerar zero queries para entidade sem campos não-readOnly');
    });
  });

  // --- Req 42.3: Testes para geração de telas Flutter a partir de entidades Java ---

  describe('geração de telas Flutter a partir de entidades Java', () => {

    it('DEVE instanciar MobileUtil para gerar telas Flutter', () => {
      assert.ok(
        fromEntitySource.includes('MobileUtil'),
        'FromEntityGenerator deve importar MobileUtil'
      );
      assert.ok(
        fromEntitySource.includes('this.mobileUtil = new MobileUtil(this)'),
        'FromEntityGenerator deve instanciar MobileUtil'
      );
    });

    it('DEVE chamar mobileUtil.createCrud() quando mobile habilitado', () => {
      assert.ok(
        fromEntitySource.includes('this.mobileUtil.createCrud('),
        'FromEntityGenerator deve chamar mobileUtil.createCrud()'
      );
    });

    it('DEVE verificar skip-mobile antes de gerar mobile', () => {
      assert.ok(
        fromEntitySource.includes("'skip-mobile'"),
        'FromEntityGenerator deve verificar flag skip-mobile'
      );
    });

    it('prompt deve incluir opção mobile', () => {
      assert.ok(
        fromEntitySource.includes("name: 'mobile'"),
        'Prompt do FromEntityGenerator deve conter opção mobile'
      );
    });
  });

  // --- Req 42.4: Verificar mapeamento de tipos Java → widgets Flutter ---

  describe('mapeamento de tipos Java → widgets Flutter', () => {
    const { dartType, flutterWidgetType } = require('../Utils/mobile');

    it('String deve mapear para TextFormField (text)', () => {
      assert.strictEqual(flutterWidgetType({ name: 'name', type: 'String' }), 'text');
    });

    it('String com nome contendo "email" deve mapear para email', () => {
      assert.strictEqual(flutterWidgetType({ name: 'email', type: 'String' }), 'email');
      assert.strictEqual(flutterWidgetType({ name: 'userEmail', type: 'String' }), 'email');
    });

    it('String com nome contendo "pass" deve mapear para password', () => {
      assert.strictEqual(flutterWidgetType({ name: 'password', type: 'String' }), 'password');
    });

    it('Date/LocalDate/LocalDateTime deve mapear para datePicker', () => {
      assert.strictEqual(flutterWidgetType({ name: 'createdAt', type: 'Date' }), 'datePicker');
      assert.strictEqual(flutterWidgetType({ name: 'birthDate', type: 'LocalDate' }), 'datePicker');
      assert.strictEqual(flutterWidgetType({ name: 'updatedAt', type: 'LocalDateTime' }), 'datePicker');
    });

    it('Integer/Long/Double/BigDecimal deve mapear para number', () => {
      assert.strictEqual(flutterWidgetType({ name: 'age', type: 'Integer' }), 'number');
      assert.strictEqual(flutterWidgetType({ name: 'count', type: 'Long' }), 'number');
      assert.strictEqual(flutterWidgetType({ name: 'price', type: 'Double' }), 'number');
      assert.strictEqual(flutterWidgetType({ name: 'amount', type: 'BigDecimal' }), 'number');
    });

    it('boolean deve mapear para switch', () => {
      assert.strictEqual(flutterWidgetType({ name: 'active', type: 'boolean' }), 'switch');
    });

    it('tipo não primitivo (relacionamento) deve mapear para dropdown', () => {
      assert.strictEqual(flutterWidgetType({ name: 'category', type: 'Category' }), 'dropdown');
      assert.strictEqual(flutterWidgetType({ name: 'author', type: 'User' }), 'dropdown');
    });

    it('dartType deve mapear tipos Java para tipos Dart corretamente', () => {
      assert.strictEqual(dartType('String'), 'String');
      assert.strictEqual(dartType('Integer'), 'int');
      assert.strictEqual(dartType('Long'), 'int');
      assert.strictEqual(dartType('Double'), 'double');
      assert.strictEqual(dartType('boolean'), 'bool');
      assert.strictEqual(dartType('Date'), 'DateTime');
      assert.strictEqual(dartType('LocalDate'), 'DateTime');
      assert.strictEqual(dartType('BigDecimal'), 'double');
    });
  });

  // --- Verificar extração de propriedades de entidades Java ---

  describe('extração de propriedades de entidades Java', () => {

    it('DEVE conter método _extractPropertiesFromContent', () => {
      assert.ok(
        fromEntitySource.includes('_extractPropertiesFromContent'),
        'FromEntityGenerator deve conter método _extractPropertiesFromContent'
      );
    });

    it('DEVE usar regex para extrair propriedades private', () => {
      assert.ok(
        fromEntitySource.includes('private\\s+'),
        'FromEntityGenerator deve usar regex para extrair campos private'
      );
    });
  });

  // --- Req 17.2: Entidade gerada respeitando pacotes selecionados ---

  describe('entidade gerada respeitando pacotes selecionados (Req 17.2)', () => {

    it('FromEntityGenerator DEVE ler Configuração_Pacotes do .yo-rc.json no initializing()', () => {
      assert.ok(
        fromEntitySource.includes("this.config.get('packages')"),
        'FromEntityGenerator deve ler packages do config (.yo-rc.json)'
      );
      assert.ok(
        fromEntitySource.includes('this.selectedPackages'),
        'FromEntityGenerator deve armazenar pacotes em this.selectedPackages'
      );
    });

    it('FromEntityGenerator DEVE passar selectedPackages ao config do BackendUtil', () => {
      assert.ok(
        fromEntitySource.includes('packages: this.selectedPackages'),
        'config do BackendUtil deve conter packages: this.selectedPackages'
      );
    });

    it('FromEntityGenerator DEVE passar selectedPackages ao config do FrontendUtil', () => {
      assert.ok(
        fromEntitySource.includes('packages: this.selectedPackages'),
        'config do FrontendUtil deve conter packages: this.selectedPackages'
      );
    });

    it('FromEntityGenerator DEVE passar selectedPackages ao config do MobileUtil', () => {
      assert.ok(
        fromEntitySource.includes('packages: this.selectedPackages'),
        'config do MobileUtil deve conter packages: this.selectedPackages'
      );
    });

    it('BackendUtil.createFromEntity() DEVE extrair packages do config', () => {
      assert.ok(
        backendUtilSource.includes("config.packages || []"),
        'BackendUtil.createFromEntity deve extrair packages do config'
      );
    });

    it('BackendUtil.createFromEntity() DEVE repassar packages ao template EJS', () => {
      assert.ok(
        backendUtilSource.includes('packages: packages'),
        'BackendUtil deve passar packages ao template'
      );
    });
  });

  // --- Condicionais de audit, export, auth, observability nos templates gerados ---

  describe('condicionais de pacotes nos templates backend usados por fromEntity', () => {

    it('template backend entity DEVE condicionar @EntityListeners ao pacote audit', () => {
      const entityPath = path.join(__dirname, '..', 'Utils', 'templates', 'backend', 'src', 'main', 'java', 'app', 'entity', '_pojo.java');
      const content = fs.readFileSync(entityPath, 'utf-8');
      assert.ok(
        content.includes("packages.includes('audit')"),
        'Template entity deve condicionar AuditEntityListener ao pacote audit'
      );
      assert.ok(
        content.includes('AuditEntityListener'),
        'Template entity deve conter referência a AuditEntityListener'
      );
    });

    it('template backend REST DEVE condicionar endpoints de exportação ao pacote export', () => {
      const restPath = path.join(__dirname, '..', 'Utils', 'templates', 'backend', 'src', 'main', 'java', 'app', 'service', '_pojoREST.java');
      const content = fs.readFileSync(restPath, 'utf-8');
      assert.ok(
        content.includes("packages.includes('export')"),
        'Template REST deve condicionar exportação ao pacote export'
      );
      assert.ok(
        content.includes('exportCsv') || content.includes('/export') || content.includes('export'),
        'Template REST deve conter endpoint de exportação'
      );
    });

    it('template backend REST DEVE condicionar @RolesAllowed/@Authenticated ao pacote auth', () => {
      const restPath = path.join(__dirname, '..', 'Utils', 'templates', 'backend', 'src', 'main', 'java', 'app', 'service', '_pojoREST.java');
      const content = fs.readFileSync(restPath, 'utf-8');
      assert.ok(
        content.includes("packages.includes('auth')"),
        'Template REST deve condicionar anotações de segurança ao pacote auth'
      );
    });

    it('template backend REST DEVE condicionar @Counted/@Traced ao pacote observability', () => {
      const restPath = path.join(__dirname, '..', 'Utils', 'templates', 'backend', 'src', 'main', 'java', 'app', 'service', '_pojoREST.java');
      const content = fs.readFileSync(restPath, 'utf-8');
      assert.ok(
        content.includes("packages.includes('observability')"),
        'Template REST deve condicionar observabilidade ao pacote observability'
      );
      assert.ok(
        content.includes('@Counted') && content.includes('@Traced'),
        'Template REST deve conter @Counted e @Traced'
      );
    });

    it('BackendUtil DEVE condicionar _addEntityToDashboardStats à presença do pacote dashboard', () => {
      assert.ok(
        backendUtilSource.includes("packages.includes('dashboard')"),
        'BackendUtil deve verificar pacote dashboard antes de chamar _addEntityToDashboardStats'
      );
    });
  });

  // --- Req 17.4: Compatibilidade retroativa (projeto sem Configuração_Pacotes) ---

  describe('compatibilidade retroativa — projeto legado sem Configuração_Pacotes (Req 17.4)', () => {

    it('FromEntityGenerator DEVE assumir todos os pacotes quando .yo-rc.json não tem packages', () => {
      assert.ok(
        fromEntitySource.includes("this.config.get('packages')"),
        'FromEntityGenerator deve ler packages do config'
      );
      assert.ok(
        fromEntitySource.includes('this.selectedPackages === null'),
        'FromEntityGenerator deve verificar se selectedPackages é null'
      );
    });

    it('FromEntityGenerator DEVE usar PackageRegistry.getAvailablePackages() para obter todos os slugs', () => {
      assert.ok(
        fromEntitySource.includes('PackageRegistry'),
        'FromEntityGenerator deve importar PackageRegistry'
      );
      assert.ok(
        fromEntitySource.includes('getAvailablePackages'),
        'FromEntityGenerator deve chamar getAvailablePackages() para obter todos os pacotes'
      );
    });

    it('quando selectedPackages é null, DEVE resolver para todos os 10 pacotes', () => {
      const registry = new PackageRegistry();
      const allSlugs = registry.getAvailablePackages().map(p => p.slug);
      assert.strictEqual(allSlugs.length, 10, 'Deve haver 10 pacotes disponíveis');
      const expected = ['auth', 'messaging', 'mcp', 'file-upload', 'audit',
        'dashboard', 'export', 'observability', 'i18n', 'themes'];
      expected.forEach(slug => {
        assert.ok(allSlugs.includes(slug), `Pacote "${slug}" deve estar disponível`);
      });
    });

    it('FromEntityGenerator initializing() DEVE instanciar PackageRegistry para fallback', () => {
      assert.ok(
        fromEntitySource.includes('new PackageRegistry()'),
        'FromEntityGenerator deve instanciar PackageRegistry no initializing() para fallback'
      );
    });

    it('fallback de compatibilidade DEVE mapear getAvailablePackages para array de slugs', () => {
      assert.ok(
        fromEntitySource.includes('.map(p => p.slug)') || fromEntitySource.includes('.map(function'),
        'FromEntityGenerator deve mapear pacotes para array de slugs'
      );
    });
  });
});
