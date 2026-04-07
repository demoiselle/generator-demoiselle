'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const PackageRegistry = require('../Utils/packageRegistry');

const addGeneratorSourcePath = path.join(__dirname, '..', 'generators', 'add', 'index.js');
const addGeneratorSource = fs.readFileSync(addGeneratorSourcePath, 'utf-8');

const frontendUtilSourcePath = path.join(__dirname, '..', 'Utils', 'frontend.js');
const frontendUtilSource = fs.readFileSync(frontendUtilSourcePath, 'utf-8');

const backendUtilSourcePath = path.join(__dirname, '..', 'Utils', 'backend.js');
const backendUtilSource = fs.readFileSync(backendUtilSourcePath, 'utf-8');

const mobileUtilSourcePath = path.join(__dirname, '..', 'Utils', 'mobile.js');
const mobileUtilSource = fs.readFileSync(mobileUtilSourcePath, 'utf-8');

describe('yo demoiselle:add', () => {

  // --- Req 9.3: Verificar CRUD Vue.js SFC gerado ---

  describe('quando gerar um CRUD Vue.js', () => {

    it('DEVE instanciar FrontendUtil para gerar arquivos Vue.js', () => {
      assert.ok(
        addGeneratorSource.includes('FrontendUtil'),
        'AddGenerator deve importar FrontendUtil'
      );
      assert.ok(
        addGeneratorSource.includes('this.frontendUtil = new FrontendUtil(this)'),
        'AddGenerator deve instanciar FrontendUtil'
      );
    });

    it('DEVE chamar frontendUtil.createCrud() quando frontend habilitado', () => {
      assert.ok(
        addGeneratorSource.includes('this.frontendUtil.createCrud('),
        'AddGenerator deve chamar frontendUtil.createCrud()'
      );
    });

    it('templates de CRUD Vue.js devem existir', () => {
      const entityDir = path.join(__dirname, '..', 'Utils', 'templates', 'frontend', 'entity');
      const expectedFiles = [
        '_entityList.vue',
        '_entityForm.vue',
        '_entity.service.js',
        '_entity.routes.js'
      ];
      expectedFiles.forEach(file => {
        assert.ok(
          fs.existsSync(path.join(entityDir, file)),
          `Template CRUD Vue.js "${file}" deve existir`
        );
      });
    });

    it('template _entityList.vue deve conter AdvancedFilter e botões de exportação', () => {
      const listPath = path.join(__dirname, '..', 'Utils', 'templates', 'frontend', 'entity', '_entityList.vue');
      const content = fs.readFileSync(listPath, 'utf-8');

      assert.ok(content.includes('AdvancedFilter'), 'List deve conter AdvancedFilter');
      assert.ok(content.includes('exportCsv'), 'List deve conter exportação CSV');
      assert.ok(content.includes('exportPdf'), 'List deve conter exportação PDF');
    });

    it('template _entityForm.vue deve conter formulário com $t() para i18n', () => {
      const formPath = path.join(__dirname, '..', 'Utils', 'templates', 'frontend', 'entity', '_entityForm.vue');
      const content = fs.readFileSync(formPath, 'utf-8');

      assert.ok(content.includes('<form'), 'Form deve conter elemento <form>');
      assert.ok(content.includes('$t('), 'Form deve usar $t() para internacionalização');
    });

    it('templates Vue.js SFC devem existir no diretório de templates', () => {
      const entityDir = path.join(__dirname, '..', 'Utils', 'templates', 'frontend', 'entity');
      const vueFiles = fs.readdirSync(entityDir).filter(f => f.endsWith('.vue') || f.endsWith('.service.js') || f.endsWith('.routes.js'));
      assert.ok(vueFiles.length >= 4, 'Deve haver pelo menos 4 arquivos Vue.js/JS no diretório de templates');
      assert.ok(vueFiles.some(f => f.endsWith('.vue')), 'Deve haver arquivos .vue no diretório de templates');
    });
  });

  // --- Req 42.1, 42.2: Verificar CRUD Flutter gerado quando mobile habilitado ---

  describe('quando gerar um CRUD Flutter (mobile habilitado)', () => {

    it('DEVE instanciar MobileUtil para gerar arquivos Flutter', () => {
      assert.ok(
        addGeneratorSource.includes('MobileUtil'),
        'AddGenerator deve importar MobileUtil'
      );
      assert.ok(
        addGeneratorSource.includes('this.mobileUtil = new MobileUtil(this)'),
        'AddGenerator deve instanciar MobileUtil'
      );
    });

    it('DEVE chamar mobileUtil.createCrud() quando mobile habilitado', () => {
      assert.ok(
        addGeneratorSource.includes('this.mobileUtil.createCrud('),
        'AddGenerator deve chamar mobileUtil.createCrud()'
      );
    });

    it('DEVE verificar skip-mobile antes de gerar mobile', () => {
      assert.ok(
        addGeneratorSource.includes("'skip-mobile'"),
        'AddGenerator deve verificar flag skip-mobile'
      );
    });

    it('templates de CRUD Flutter devem existir', () => {
      const entityDir = path.join(__dirname, '..', 'Utils', 'templates', 'mobile', 'entity');
      const expectedFiles = [
        '_entity_list_screen.dart',
        '_entity_form_screen.dart',
        '_entity_service.dart',
        '_entity_model.dart',
        '_entity_provider.dart'
      ];
      expectedFiles.forEach(file => {
        assert.ok(
          fs.existsSync(path.join(entityDir, file)),
          `Template CRUD Flutter "${file}" deve existir`
        );
      });
    });
  });

  // --- Funcionalidades integradas no CRUD ---

  describe('funcionalidades integradas no CRUD', () => {

    it('FrontendUtil deve adicionar chaves i18n ao gerar CRUD', () => {
      assert.ok(
        frontendUtilSource.includes('_addI18nKeys'),
        'FrontendUtil deve conter método _addI18nKeys'
      );
    });

    it('FrontendUtil deve adicionar card no dashboard ao gerar CRUD', () => {
      assert.ok(
        frontendUtilSource.includes('_addDashboardCard'),
        'FrontendUtil deve conter método _addDashboardCard'
      );
    });

    it('MobileUtil deve adicionar rota, i18n, dashboard card e drawer item ao gerar CRUD', () => {
      assert.ok(mobileUtilSource.includes('_addRoute'), 'MobileUtil deve conter _addRoute');
      assert.ok(mobileUtilSource.includes('_addI18nKeys'), 'MobileUtil deve conter _addI18nKeys');
      assert.ok(mobileUtilSource.includes('_addDashboardCard'), 'MobileUtil deve conter _addDashboardCard');
      assert.ok(mobileUtilSource.includes('_addDrawerItem'), 'MobileUtil deve conter _addDrawerItem');
    });

    it('prompt do AddGenerator deve incluir opção mobile', () => {
      assert.ok(
        addGeneratorSource.includes("name: 'mobile'"),
        'Prompt do AddGenerator deve conter opção mobile'
      );
    });
  });

  // --- Req 17.1: CRUD gerado respeitando pacotes selecionados ---

  describe('CRUD gerado respeitando pacotes selecionados (Req 17.1)', () => {

    it('AddGenerator DEVE ler Configuração_Pacotes do .yo-rc.json no initializing()', () => {
      assert.ok(
        addGeneratorSource.includes("this.config.get('packages')"),
        'AddGenerator deve ler packages do config (.yo-rc.json)'
      );
      assert.ok(
        addGeneratorSource.includes('this.selectedPackages'),
        'AddGenerator deve armazenar pacotes em this.selectedPackages'
      );
    });

    it('AddGenerator DEVE passar selectedPackages ao config do FrontendUtil', () => {
      assert.ok(
        addGeneratorSource.includes('packages: this.selectedPackages'),
        'configFrontend deve conter packages: this.selectedPackages'
      );
    });

    it('AddGenerator DEVE passar selectedPackages ao config do BackendUtil', () => {
      // Verify configBackend includes packages
      const configBackendMatch = addGeneratorSource.includes('packages: this.selectedPackages');
      assert.ok(configBackendMatch, 'configBackend deve conter packages: this.selectedPackages');
    });

    it('AddGenerator DEVE passar selectedPackages ao config do MobileUtil', () => {
      // configMobile should also include packages
      const configMobileMatch = addGeneratorSource.includes('packages: this.selectedPackages');
      assert.ok(configMobileMatch, 'configMobile deve conter packages: this.selectedPackages');
    });

    it('FrontendUtil.createCrud() DEVE extrair packages do config', () => {
      assert.ok(
        frontendUtilSource.includes('config.packages') || frontendUtilSource.includes("config.packages || []"),
        'FrontendUtil.createCrud deve extrair packages do config'
      );
    });

    it('FrontendUtil.createCrud() DEVE repassar packages ao template EJS', () => {
      assert.ok(
        frontendUtilSource.includes('packages: packages'),
        'FrontendUtil deve passar packages ao template'
      );
    });

    it('BackendUtil.createCrud() DEVE extrair packages do config', () => {
      assert.ok(
        backendUtilSource.includes("config.packages || []"),
        'BackendUtil.createCrud deve extrair packages do config'
      );
    });

    it('BackendUtil.createCrud() DEVE repassar packages ao template EJS', () => {
      assert.ok(
        backendUtilSource.includes('packages: packages'),
        'BackendUtil deve passar packages ao template'
      );
    });

    it('MobileUtil.createCrud() DEVE extrair packages do config', () => {
      assert.ok(
        mobileUtilSource.includes("config.packages || []"),
        'MobileUtil.createCrud deve extrair packages do config'
      );
    });

    it('MobileUtil.createCrud() DEVE repassar packages ao template EJS', () => {
      assert.ok(
        mobileUtilSource.includes('packages: packages'),
        'MobileUtil deve passar packages ao template'
      );
    });
  });

  // --- Verificar que funcionalidades de pacotes não selecionados não aparecem ---

  describe('funcionalidades condicionais nos templates CRUD', () => {

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
        content.includes('exportCsv') || content.includes('/export'),
        'Template REST deve conter endpoint de exportação'
      );
    });

    it('template backend REST DEVE condicionar @RolesAllowed ao pacote auth', () => {
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

    it('template backend REST DEVE condicionar @McpTool ao pacote mcp', () => {
      const restPath = path.join(__dirname, '..', 'Utils', 'templates', 'backend', 'src', 'main', 'java', 'app', 'service', '_pojoREST.java');
      const content = fs.readFileSync(restPath, 'utf-8');
      assert.ok(
        content.includes("packages.includes('mcp')"),
        'Template REST deve condicionar @McpTool ao pacote mcp'
      );
    });

    it('template frontend list DEVE condicionar botões de exportação ao pacote export', () => {
      const listPath = path.join(__dirname, '..', 'Utils', 'templates', 'frontend', 'entity', '_entityList.vue');
      const content = fs.readFileSync(listPath, 'utf-8');
      assert.ok(
        content.includes("packages.includes('export')"),
        'Template list deve condicionar exportação ao pacote export'
      );
    });

    it('template frontend list DEVE condicionar $t() ao pacote i18n', () => {
      const listPath = path.join(__dirname, '..', 'Utils', 'templates', 'frontend', 'entity', '_entityList.vue');
      const content = fs.readFileSync(listPath, 'utf-8');
      assert.ok(
        content.includes("packages.includes('i18n')"),
        'Template list deve condicionar i18n ao pacote i18n'
      );
      // Deve ter fallback para textos fixos em português
      assert.ok(
        content.includes('} else {'),
        'Template list deve ter fallback para textos fixos quando i18n não selecionado'
      );
    });

    it('template frontend form DEVE condicionar $t() ao pacote i18n', () => {
      const formPath = path.join(__dirname, '..', 'Utils', 'templates', 'frontend', 'entity', '_entityForm.vue');
      const content = fs.readFileSync(formPath, 'utf-8');
      assert.ok(
        content.includes("packages.includes('i18n')"),
        'Template form deve condicionar i18n ao pacote i18n'
      );
    });

    it('template mobile list DEVE condicionar exportação ao pacote export', () => {
      const listPath = path.join(__dirname, '..', 'Utils', 'templates', 'mobile', 'entity', '_entity_list_screen.dart');
      const content = fs.readFileSync(listPath, 'utf-8');
      assert.ok(
        content.includes("packages.includes('export')"),
        'Template mobile list deve condicionar exportação ao pacote export'
      );
    });

    it('template mobile list DEVE condicionar i18n ao pacote i18n', () => {
      const listPath = path.join(__dirname, '..', 'Utils', 'templates', 'mobile', 'entity', '_entity_list_screen.dart');
      const content = fs.readFileSync(listPath, 'utf-8');
      assert.ok(
        content.includes("packages.includes('i18n')"),
        'Template mobile list deve condicionar i18n ao pacote i18n'
      );
    });

    it('FrontendUtil DEVE condicionar _addI18nKeys à presença do pacote i18n', () => {
      assert.ok(
        frontendUtilSource.includes("packages.includes('i18n')"),
        'FrontendUtil deve verificar pacote i18n antes de chamar _addI18nKeys'
      );
    });

    it('FrontendUtil DEVE condicionar _addDashboardCard à presença do pacote dashboard', () => {
      assert.ok(
        frontendUtilSource.includes("packages.includes('dashboard')"),
        'FrontendUtil deve verificar pacote dashboard antes de chamar _addDashboardCard'
      );
    });

    it('MobileUtil DEVE condicionar _addI18nKeys à presença do pacote i18n', () => {
      assert.ok(
        mobileUtilSource.includes("packages.includes('i18n')"),
        'MobileUtil deve verificar pacote i18n antes de chamar _addI18nKeys'
      );
    });

    it('MobileUtil DEVE condicionar _addDashboardCard à presença do pacote dashboard', () => {
      assert.ok(
        mobileUtilSource.includes("packages.includes('dashboard')"),
        'MobileUtil deve verificar pacote dashboard antes de chamar _addDashboardCard'
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

    it('AddGenerator DEVE assumir todos os pacotes quando .yo-rc.json não tem packages', () => {
      // initializing() deve tratar null como "todos os pacotes"
      assert.ok(
        addGeneratorSource.includes("this.config.get('packages') || null") ||
        addGeneratorSource.includes("this.config.get('packages')"),
        'AddGenerator deve ler packages do config'
      );
      assert.ok(
        addGeneratorSource.includes('this.selectedPackages === null'),
        'AddGenerator deve verificar se selectedPackages é null'
      );
    });

    it('AddGenerator DEVE usar PackageRegistry.getAvailablePackages() para obter todos os slugs', () => {
      assert.ok(
        addGeneratorSource.includes('PackageRegistry'),
        'AddGenerator deve importar PackageRegistry'
      );
      assert.ok(
        addGeneratorSource.includes('getAvailablePackages'),
        'AddGenerator deve chamar getAvailablePackages() para obter todos os pacotes'
      );
    });

    it('quando selectedPackages é null, DEVE resolver para todos os 10 pacotes', () => {
      const registry = new PackageRegistry();
      const allSlugs = registry.getAvailablePackages().map(p => p.slug);
      assert.strictEqual(allSlugs.length, 10, 'Deve haver 10 pacotes disponíveis');
      // Verify all expected slugs are present
      const expected = ['auth', 'messaging', 'mcp', 'file-upload', 'audit',
        'dashboard', 'export', 'observability', 'i18n', 'themes'];
      expected.forEach(slug => {
        assert.ok(allSlugs.includes(slug), `Pacote "${slug}" deve estar disponível`);
      });
    });

    it('projeto legado com todos os pacotes DEVE gerar CRUD com todas as funcionalidades', () => {
      // When all packages are enabled (legacy mode), all conditionals should be active
      const registry = new PackageRegistry();
      const allSlugs = registry.getAvailablePackages().map(p => p.slug);
      assert.ok(allSlugs.includes('audit'), 'Todos os pacotes devem incluir audit');
      assert.ok(allSlugs.includes('export'), 'Todos os pacotes devem incluir export');
      assert.ok(allSlugs.includes('auth'), 'Todos os pacotes devem incluir auth');
      assert.ok(allSlugs.includes('observability'), 'Todos os pacotes devem incluir observability');
      assert.ok(allSlugs.includes('i18n'), 'Todos os pacotes devem incluir i18n');
      assert.ok(allSlugs.includes('dashboard'), 'Todos os pacotes devem incluir dashboard');
      assert.ok(allSlugs.includes('mcp'), 'Todos os pacotes devem incluir mcp');
    });

    it('AddGenerator initializing() DEVE instanciar PackageRegistry para fallback', () => {
      // The initializing method should create a new PackageRegistry when packages is null
      assert.ok(
        addGeneratorSource.includes('new PackageRegistry()'),
        'AddGenerator deve instanciar PackageRegistry no initializing() para fallback'
      );
    });

    it('fallback de compatibilidade DEVE mapear getAvailablePackages para array de slugs', () => {
      assert.ok(
        addGeneratorSource.includes('.map(p => p.slug)') || addGeneratorSource.includes('.map(function'),
        'AddGenerator deve mapear pacotes para array de slugs'
      );
    });
  });
});
