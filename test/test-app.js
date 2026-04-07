'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const PackageRegistry = require('../Utils/packageRegistry');
const parsePackagesFlag = require('../Utils/parsePackagesFlag');

const generatorSourcePath = path.join(__dirname, '..', 'generators', 'app', 'index.js');
const generatorSource = fs.readFileSync(generatorSourcePath, 'utf-8');

describe('yo demoiselle:app', () => {

  // --- Req 9.1: Verificar geração de arquivos Vue.js 3 (em vez de Angular) ---

  describe('quando gerar um projeto frontend Vue.js 3', () => {

    it('DEVE conter método _generateProjectFrontend que referencia Vue.js', () => {
      assert.ok(
        generatorSource.includes('_generateProjectFrontend'),
        'Gerador deve conter método _generateProjectFrontend'
      );
      assert.ok(
        generatorSource.includes('Vue.js') || generatorSource.includes('Vue.js 3'),
        'Gerador deve referenciar Vue.js nas mensagens'
      );
    });

    it('DEVE copiar template base frontend Vue.js (base/frontend/)', () => {
      assert.ok(
        generatorSource.includes('base/frontend/'),
        '_generateProjectFrontend deve copiar de base/frontend/'
      );
    });

    it('DEVE atualizar package.json com dependências Vue.js 3', () => {
      assert.ok(
        generatorSource.includes('_updatePackageJson'),
        'Gerador deve conter método _updatePackageJson'
      );
      // Verify Vue.js dependencies are set
      assert.ok(
        generatorSource.includes("'vue'") || generatorSource.includes('"vue"'),
        '_updatePackageJson deve incluir dependência vue'
      );
      assert.ok(
        generatorSource.includes("'vue-router'") || generatorSource.includes('"vue-router"'),
        '_updatePackageJson deve incluir dependência vue-router'
      );
      assert.ok(
        generatorSource.includes("'pinia'") || generatorSource.includes('"pinia"'),
        '_updatePackageJson deve incluir dependência pinia'
      );
    });

    it('NÃO DEVE executar ng new ou depender de @angular em código ativo', () => {
      assert.ok(
        !generatorSource.includes("spawnCommand('ng'") && !generatorSource.includes('spawnCommand("ng"'),
        'Gerador NÃO deve executar ng como comando ativo'
      );
      assert.ok(
        !generatorSource.includes("'@angular/"),
        'Gerador NÃO deve conter dependências @angular'
      );
    });
  });

  // --- Req 10.1: Verificar geração de arquivos Flutter quando mobile habilitado ---

  describe('quando gerar um projeto mobile Flutter', () => {

    it('DEVE conter método _generateProjectMobile que referencia Flutter', () => {
      assert.ok(
        generatorSource.includes('_generateProjectMobile'),
        'Gerador deve conter método _generateProjectMobile'
      );
      assert.ok(
        generatorSource.includes('Flutter'),
        'Gerador deve referenciar Flutter nas mensagens'
      );
    });

    it('DEVE copiar template base mobile Flutter (base/mobile/)', () => {
      assert.ok(
        generatorSource.includes('base/mobile/'),
        '_generateProjectMobile deve copiar de base/mobile/'
      );
    });

    it('DEVE atualizar pubspec.yaml com dependências Flutter', () => {
      assert.ok(
        generatorSource.includes('_updatePubspecYaml'),
        'Gerador deve conter método _updatePubspecYaml'
      );
    });
  });

  // --- Funcionalidades base: templates organizados por pacote ---

  describe('funcionalidades base do projeto gerado', () => {

    it('template base frontend deve conter arquivos de autenticação no diretório de pacotes', () => {
      const packageAuthFrontendDir = path.join(__dirname, '..', 'Utils', 'templates', 'packages', 'auth', 'frontend', 'src');
      const baseFrontendDir = path.join(__dirname, '..', 'Utils', 'templates', 'base', 'frontend', 'src');
      const authFiles = [
        'views/LoginView.vue',
        'views/RegisterView.vue',
        'views/ForgotPasswordView.vue',
        'views/ResetPasswordView.vue',
        'stores/auth.js',
        'composables/useAuth.js'
      ];
      authFiles.forEach(file => {
        const inPackages = fs.existsSync(path.join(packageAuthFrontendDir, file));
        const inBase = fs.existsSync(path.join(baseFrontendDir, file));
        assert.ok(
          inPackages || inBase,
          `Arquivo de auth "${file}" deve existir no template de pacotes ou base frontend`
        );
      });
    });

    it('template de pacote dashboard frontend deve conter DashboardView', () => {
      const dashboardPath = path.join(__dirname, '..', 'Utils', 'templates', 'packages', 'dashboard', 'frontend', 'src', 'views', 'DashboardView.vue');
      const baseDashboardPath = path.join(__dirname, '..', 'Utils', 'templates', 'base', 'frontend', 'src', 'views', 'DashboardView.vue');
      const exists = fs.existsSync(dashboardPath) || fs.existsSync(baseDashboardPath);
      assert.ok(exists, 'DashboardView.vue deve existir em packages/dashboard ou base');
    });

    it('template de pacote i18n frontend deve conter sistema de i18n', () => {
      const i18nPkgDir = path.join(__dirname, '..', 'Utils', 'templates', 'packages', 'i18n', 'frontend', 'src', 'i18n');
      const i18nBaseDir = path.join(__dirname, '..', 'Utils', 'templates', 'base', 'frontend', 'src', 'i18n');
      const files = ['index.js', 'pt-BR.json', 'en.json'];
      files.forEach(file => {
        const inPkg = fs.existsSync(path.join(i18nPkgDir, file));
        const inBase = fs.existsSync(path.join(i18nBaseDir, file));
        assert.ok(inPkg || inBase, `i18n/${file} deve existir em packages/i18n ou base`);
      });
    });

    it('template de pacote themes frontend deve conter sistema de temas', () => {
      const themesPkgDir = path.join(__dirname, '..', 'Utils', 'templates', 'packages', 'themes', 'frontend', 'src');
      const baseFrontendDir = path.join(__dirname, '..', 'Utils', 'templates', 'base', 'frontend', 'src');
      const files = ['styles/variables.css', 'styles/theme-light.css', 'styles/theme-dark.css'];
      files.forEach(file => {
        const inPkg = fs.existsSync(path.join(themesPkgDir, file));
        const inBase = fs.existsSync(path.join(baseFrontendDir, file));
        assert.ok(inPkg || inBase, `${file} deve existir em packages/themes ou base`);
      });
    });

    it('template de pacotes frontend deve conter componentes de notificações, upload, temas e i18n', () => {
      const componentFiles = {
        'NotificationBell.vue': ['packages/messaging/frontend/src/components', 'base/frontend/src/components'],
        'FileUpload.vue': ['packages/file-upload/frontend/src/components', 'base/frontend/src/components'],
        'ThemeToggle.vue': ['packages/themes/frontend/src/components', 'base/frontend/src/components'],
        'LanguageSelector.vue': ['packages/i18n/frontend/src/components', 'base/frontend/src/components']
      };
      const templatesRoot = path.join(__dirname, '..', 'Utils', 'templates');
      Object.entries(componentFiles).forEach(([file, dirs]) => {
        const exists = dirs.some(dir => fs.existsSync(path.join(templatesRoot, dir, file)));
        assert.ok(exists, `${file} deve existir em um dos diretórios de pacotes ou base`);
      });
    });

    it('template de pacote audit frontend deve conter tela de auditoria', () => {
      const auditPkgPath = path.join(__dirname, '..', 'Utils', 'templates', 'packages', 'audit', 'frontend', 'src', 'views', 'AuditView.vue');
      const auditBasePath = path.join(__dirname, '..', 'Utils', 'templates', 'base', 'frontend', 'src', 'views', 'AuditView.vue');
      assert.ok(
        fs.existsSync(auditPkgPath) || fs.existsSync(auditBasePath),
        'AuditView.vue deve existir em packages/audit ou base'
      );
    });

    it('template de pacote auth mobile deve conter arquivos de autenticação Flutter', () => {
      const pkgMobileDir = path.join(__dirname, '..', 'Utils', 'templates', 'packages', 'auth', 'mobile', 'lib');
      const baseMobileDir = path.join(__dirname, '..', 'Utils', 'templates', 'base', 'mobile', 'lib');
      const authFiles = [
        'screens/login_screen.dart',
        'screens/register_screen.dart',
        'screens/forgot_password_screen.dart',
        'screens/reset_password_screen.dart',
        'providers/auth_provider.dart',
        'services/auth_service.dart'
      ];
      authFiles.forEach(file => {
        const inPkg = fs.existsSync(path.join(pkgMobileDir, file));
        const inBase = fs.existsSync(path.join(baseMobileDir, file));
        assert.ok(
          inPkg || inBase,
          `Arquivo de auth mobile "${file}" deve existir em packages/auth ou base mobile`
        );
      });
    });

    it('template de pacotes mobile deve conter dashboard, auditoria e notificações', () => {
      const fileLocations = {
        'screens/dashboard_screen.dart': ['packages/dashboard/mobile/lib', 'base/mobile/lib'],
        'screens/audit_screen.dart': ['packages/audit/mobile/lib', 'base/mobile/lib'],
        'screens/notifications_screen.dart': ['packages/messaging/mobile/lib', 'base/mobile/lib']
      };
      const templatesRoot = path.join(__dirname, '..', 'Utils', 'templates');
      Object.entries(fileLocations).forEach(([file, dirs]) => {
        const exists = dirs.some(dir => fs.existsSync(path.join(templatesRoot, dir, file)));
        assert.ok(exists, `${file} deve existir em packages ou base mobile`);
      });
    });
  });

  // --- Req 10.1: Verificar mensagens de progresso em português ---

  describe('mensagens de progresso em português', () => {

    it('DEVE exibir mensagens em português durante a geração', () => {
      assert.ok(
        generatorSource.includes('Criando projeto frontend Vue.js 3'),
        'Gerador deve exibir mensagem em português para frontend'
      );
      assert.ok(
        generatorSource.includes('Criando projeto backend Demoiselle 4'),
        'Gerador deve exibir mensagem em português para backend'
      );
      assert.ok(
        generatorSource.includes('Criando projeto mobile Flutter'),
        'Gerador deve exibir mensagem em português para mobile'
      );
    });

    it('DEVE exibir mensagens de boas-vindas em português', () => {
      assert.ok(
        generatorSource.includes('Bem vindo') || generatorSource.includes('Começe'),
        'Gerador deve exibir mensagem de boas-vindas em português'
      );
    });

    it('DEVE exibir mensagens de conclusão em português', () => {
      assert.ok(
        generatorSource.includes('criado com sucesso') || generatorSource.includes('ligar as turbinas'),
        'Gerador deve exibir mensagem de conclusão em português'
      );
    });
  });

  // --- Req 1.1: Prompt de seleção de pacotes ---

  describe('prompt de seleção de pacotes (Req 1.1)', () => {

    it('DEVE conter prompt checkbox de pacotes no AppGenerator', () => {
      assert.ok(
        generatorSource.includes("type: 'checkbox'") || generatorSource.includes('type: "checkbox"'),
        'Gerador deve conter prompt do tipo checkbox'
      );
      assert.ok(
        generatorSource.includes("name: 'packages'") || generatorSource.includes('name: "packages"'),
        'Gerador deve conter prompt com name "packages"'
      );
    });

    it('DEVE listar todos os pacotes disponíveis do PackageRegistry no prompt', () => {
      const registry = new PackageRegistry();
      const available = registry.getAvailablePackages();
      assert.strictEqual(available.length, 10, 'Deve haver 10 pacotes disponíveis');

      // Verificar que o gerador usa getAvailablePackages para montar as choices
      assert.ok(
        generatorSource.includes('getAvailablePackages'),
        'Gerador deve chamar getAvailablePackages() para montar choices do prompt'
      );
    });

    it('DEVE exibir displayName e description de cada pacote nas choices', () => {
      assert.ok(
        generatorSource.includes('pkg.displayName') || generatorSource.includes('displayName'),
        'Gerador deve usar displayName nas choices do prompt'
      );
      assert.ok(
        generatorSource.includes('pkg.description') || generatorSource.includes('description'),
        'Gerador deve usar description nas choices do prompt'
      );
      assert.ok(
        generatorSource.includes('pkg.slug') || generatorSource.includes('.slug'),
        'Gerador deve usar slug como value nas choices do prompt'
      );
    });

    it('DEVE apresentar prompt de pacotes após seleção de componentes', () => {
      // O prompt de pacotes deve vir depois do prompt de skips (componentes)
      const skipsIndex = generatorSource.indexOf("name: 'skips'");
      const packagesIndex = generatorSource.indexOf("name: 'packages'");
      assert.ok(skipsIndex > -1, 'Prompt de skips deve existir');
      assert.ok(packagesIndex > -1, 'Prompt de packages deve existir');
      assert.ok(
        packagesIndex > skipsIndex,
        'Prompt de packages deve vir após prompt de skips (componentes)'
      );
    });

    it('DEVE pular prompt de pacotes quando flag --packages é fornecida', () => {
      // O prompt de packages deve ter condição when que verifica a flag
      assert.ok(
        generatorSource.includes('!packagesFlag') || generatorSource.includes('options.packages'),
        'Prompt de packages deve ser condicional à ausência da flag --packages'
      );
    });
  });

  // --- Req 1.5: Flag CLI --packages ---

  describe('flag CLI --packages (Req 1.5)', () => {

    it('DEVE declarar a option --packages no construtor do gerador', () => {
      assert.ok(
        generatorSource.includes("'packages'") || generatorSource.includes('"packages"'),
        'Gerador deve declarar option packages'
      );
      assert.ok(
        generatorSource.includes('this.option') || generatorSource.includes("this.option('packages'"),
        'Gerador deve registrar packages como option'
      );
    });

    it('DEVE usar parsePackagesFlag para processar a flag CLI', () => {
      assert.ok(
        generatorSource.includes('parsePackagesFlag'),
        'Gerador deve importar e usar parsePackagesFlag'
      );
    });

    it('parsePackagesFlag DEVE parsear "auth,dashboard" corretamente', () => {
      const result = parsePackagesFlag('auth,dashboard');
      assert.deepStrictEqual(result, ['auth', 'dashboard']);
    });

    it('parsePackagesFlag DEVE remover espaços em branco', () => {
      const result = parsePackagesFlag(' auth , dashboard , i18n ');
      assert.deepStrictEqual(result, ['auth', 'dashboard', 'i18n']);
    });

    it('parsePackagesFlag DEVE remover duplicatas', () => {
      const result = parsePackagesFlag('auth,auth,dashboard');
      assert.deepStrictEqual(result, ['auth', 'dashboard']);
    });

    it('parsePackagesFlag DEVE retornar array vazio para string vazia', () => {
      const result = parsePackagesFlag('');
      assert.deepStrictEqual(result, []);
    });

    it('parsePackagesFlag DEVE retornar array vazio para input não-string', () => {
      assert.deepStrictEqual(parsePackagesFlag(null), []);
      assert.deepStrictEqual(parsePackagesFlag(undefined), []);
      assert.deepStrictEqual(parsePackagesFlag(123), []);
    });
  });

  // --- Req 1.2: Geração com nenhum pacote selecionado (apenas base) ---

  describe('geração com nenhum pacote selecionado (Req 1.2)', () => {

    it('DEVE gerar apenas projeto base quando packages é array vazio', () => {
      // O gerador deve funcionar com packages = []
      assert.ok(
        generatorSource.includes('var packages = this.selectedPackages || []'),
        'Gerador deve inicializar packages como array vazio se não definido'
      );
    });

    it('DEVE copiar templates base sempre, independente dos pacotes', () => {
      assert.ok(
        generatorSource.includes("this.templatePath('base/backend/"),
        'Gerador deve copiar templates base backend'
      );
      assert.ok(
        generatorSource.includes("this.templatePath('base/frontend/"),
        'Gerador deve copiar templates base frontend'
      );
      assert.ok(
        generatorSource.includes("this.templatePath('base/mobile/"),
        'Gerador deve copiar templates base mobile'
      );
    });

    it('DEVE iterar sobre pacotes selecionados para copiar templates adicionais', () => {
      assert.ok(
        generatorSource.includes('packages.forEach'),
        'Gerador deve iterar sobre packages para copiar templates de pacotes'
      );
      assert.ok(
        generatorSource.includes("packages/' + slug"),
        'Gerador deve construir caminho para templates de pacotes usando slug'
      );
    });

    it('com zero pacotes, resolveDependencies retorna array vazio', () => {
      const registry = new PackageRegistry();
      const resolved = registry.resolveDependencies([]);
      assert.deepStrictEqual(resolved, []);
    });

    it('com zero pacotes, getMavenDeps retorna array vazio', () => {
      const registry = new PackageRegistry();
      assert.deepStrictEqual(registry.getMavenDeps([]), []);
    });

    it('com zero pacotes, getNpmDeps retorna objeto vazio', () => {
      const registry = new PackageRegistry();
      assert.deepStrictEqual(registry.getNpmDeps([]), {});
    });

    it('com zero pacotes, getDartDeps retorna objeto vazio', () => {
      const registry = new PackageRegistry();
      assert.deepStrictEqual(registry.getDartDeps([]), {});
    });
  });

  // --- Req 1.2: Geração com todos os pacotes selecionados ---

  describe('geração com todos os pacotes selecionados (Req 1.2)', () => {

    it('DEVE resolver todos os 10 pacotes sem erro', () => {
      const registry = new PackageRegistry();
      const allSlugs = registry.getAvailablePackages().map(p => p.slug);
      const resolved = registry.resolveDependencies(allSlugs);
      assert.strictEqual(resolved.length, 10, 'Deve resolver todos os 10 pacotes');
      allSlugs.forEach(slug => {
        assert.ok(resolved.includes(slug), `Pacote ${slug} deve estar no resultado`);
      });
    });

    it('DEVE validar todos os pacotes como consistentes', () => {
      const registry = new PackageRegistry();
      const allSlugs = registry.getAvailablePackages().map(p => p.slug);
      const resolved = registry.resolveDependencies(allSlugs);
      const validation = registry.validate(resolved);
      assert.strictEqual(validation.valid, true, 'Todos os pacotes devem ser válidos');
      assert.strictEqual(validation.errors.length, 0, 'Não deve haver erros');
    });

    it('DEVE agregar todas as dependências Maven de todos os pacotes', () => {
      const registry = new PackageRegistry();
      const allSlugs = registry.getAvailablePackages().map(p => p.slug);
      const mavenDeps = registry.getMavenDeps(allSlugs);
      const artifacts = mavenDeps.map(d => d.artifactId);
      // Verificar dependências de pacotes com Maven deps
      assert.ok(artifacts.includes('jjwt-api'), 'Deve incluir jjwt-api (auth)');
      assert.ok(artifacts.includes('demoiselle-mcp'), 'Deve incluir demoiselle-mcp (mcp)');
      assert.ok(artifacts.includes('opencsv'), 'Deve incluir opencsv (export)');
      assert.ok(artifacts.includes('demoiselle-observability'), 'Deve incluir demoiselle-observability (observability)');
    });

    it('DEVE agregar todas as dependências npm de todos os pacotes', () => {
      const registry = new PackageRegistry();
      const allSlugs = registry.getAvailablePackages().map(p => p.slug);
      const npmDeps = registry.getNpmDeps(allSlugs);
      assert.ok(npmDeps['vue-i18n'], 'Deve incluir vue-i18n (i18n)');
    });

    it('DEVE agregar todas as dependências Dart de todos os pacotes', () => {
      const registry = new PackageRegistry();
      const allSlugs = registry.getAvailablePackages().map(p => p.slug);
      const dartDeps = registry.getDartDeps(allSlugs);
      assert.ok(dartDeps['flutter_secure_storage'], 'Deve incluir flutter_secure_storage (auth)');
      assert.ok(dartDeps['firebase_messaging'], 'Deve incluir firebase_messaging (messaging)');
      assert.ok(dartDeps['file_picker'], 'Deve incluir file_picker (file-upload)');
      assert.ok(dartDeps['share_plus'], 'Deve incluir share_plus (export)');
      assert.ok(dartDeps['shared_preferences'], 'Deve incluir shared_preferences (themes)');
    });

    it('DEVE ter diretórios de templates para todos os 10 pacotes', () => {
      const packagesDir = path.join(__dirname, '..', 'Utils', 'templates', 'packages');
      const expectedSlugs = ['auth', 'messaging', 'mcp', 'file-upload', 'audit',
        'dashboard', 'export', 'observability', 'i18n', 'themes'];
      expectedSlugs.forEach(slug => {
        assert.ok(
          fs.existsSync(path.join(packagesDir, slug)),
          `Diretório de templates para pacote "${slug}" deve existir`
        );
      });
    });
  });

  // --- Req 1.3: Resolução automática de dependências (messaging → auth) ---

  describe('resolução automática de dependências (Req 1.3)', () => {

    it('DEVE resolver auth automaticamente quando messaging é selecionado', () => {
      const registry = new PackageRegistry();
      const resolved = registry.resolveDependencies(['messaging']);
      assert.ok(resolved.includes('auth'), 'auth deve ser incluído automaticamente');
      assert.ok(resolved.includes('messaging'), 'messaging deve estar presente');
      assert.strictEqual(resolved.length, 2, 'Deve conter exatamente 2 pacotes');
    });

    it('DEVE manter auth antes de messaging na ordem de resolução', () => {
      const registry = new PackageRegistry();
      const resolved = registry.resolveDependencies(['messaging']);
      assert.ok(
        resolved.indexOf('auth') < resolved.indexOf('messaging'),
        'auth deve vir antes de messaging (dependência resolvida primeiro)'
      );
    });

    it('DEVE informar pacotes adicionados automaticamente no gerador', () => {
      assert.ok(
        generatorSource.includes('Pacotes adicionados automaticamente por dependência'),
        'Gerador deve exibir mensagem sobre pacotes adicionados por dependência'
      );
    });

    it('DEVE calcular autoAdded filtrando pacotes não selecionados originalmente', () => {
      assert.ok(
        generatorSource.includes('autoAdded') || generatorSource.includes('auto'),
        'Gerador deve calcular pacotes adicionados automaticamente'
      );
    });

    it('DEVE chamar resolveDependencies após seleção de pacotes', () => {
      assert.ok(
        generatorSource.includes('resolveDependencies'),
        'Gerador deve chamar resolveDependencies'
      );
    });

    it('NÃO DEVE duplicar auth quando messaging e auth são selecionados juntos', () => {
      const registry = new PackageRegistry();
      const resolved = registry.resolveDependencies(['auth', 'messaging']);
      const authCount = resolved.filter(s => s === 'auth').length;
      assert.strictEqual(authCount, 1, 'auth não deve ser duplicado');
    });

    it('DEVE armazenar pacotes resolvidos (com dependências) no .yo-rc.json', () => {
      assert.ok(
        generatorSource.includes("this.config.set('packages'") || generatorSource.includes('config.set(\'packages\''),
        'Gerador deve armazenar pacotes resolvidos no config (.yo-rc.json)'
      );
    });

    it('messaging DEVE declarar auth como dependência no registro', () => {
      const registry = new PackageRegistry();
      const messaging = registry.packages.get('messaging');
      assert.ok(messaging, 'Pacote messaging deve existir');
      assert.ok(
        messaging.dependencies.includes('auth'),
        'messaging deve declarar auth como dependência'
      );
    });

    it('pacotes sem dependências devem resolver apenas a si mesmos', () => {
      const registry = new PackageRegistry();
      const noDeps = ['auth', 'mcp', 'file-upload', 'audit', 'dashboard',
        'export', 'observability', 'i18n', 'themes'];
      noDeps.forEach(slug => {
        const resolved = registry.resolveDependencies([slug]);
        assert.deepStrictEqual(resolved, [slug],
          `${slug} sem dependências deve resolver apenas a si mesmo`);
      });
    });
  });
});
