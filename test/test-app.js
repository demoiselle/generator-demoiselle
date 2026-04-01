'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

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
      // The generator may reference "ng new" in comments (e.g., "Substitui a geração via ng new")
      // but must not call it as an active command
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

  // --- Funcionalidades base: auth, dashboard, i18n, temas, notificações, upload, auditoria ---

  describe('funcionalidades base do projeto gerado', () => {

    it('template base frontend deve conter arquivos de autenticação', () => {
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
        assert.ok(
          fs.existsSync(path.join(baseFrontendDir, file)),
          `Arquivo de auth "${file}" deve existir no template base frontend`
        );
      });
    });

    it('template base frontend deve conter DashboardView', () => {
      const dashboardPath = path.join(__dirname, '..', 'Utils', 'templates', 'base', 'frontend', 'src', 'views', 'DashboardView.vue');
      assert.ok(fs.existsSync(dashboardPath), 'DashboardView.vue deve existir');
      const content = fs.readFileSync(dashboardPath, 'utf-8');
      assert.ok(content.includes('dashboard'), 'DashboardView deve conter referência a dashboard');
      assert.ok(content.includes('ENTITY_DASHBOARD_CARDS'), 'DashboardView deve conter marcador para cards de entidades');
    });

    it('template base frontend deve conter sistema de i18n', () => {
      const i18nDir = path.join(__dirname, '..', 'Utils', 'templates', 'base', 'frontend', 'src', 'i18n');
      assert.ok(fs.existsSync(path.join(i18nDir, 'index.js')), 'i18n/index.js deve existir');
      assert.ok(fs.existsSync(path.join(i18nDir, 'pt-BR.json')), 'i18n/pt-BR.json deve existir');
      assert.ok(fs.existsSync(path.join(i18nDir, 'en.json')), 'i18n/en.json deve existir');
    });

    it('template base frontend deve conter sistema de temas', () => {
      const stylesDir = path.join(__dirname, '..', 'Utils', 'templates', 'base', 'frontend', 'src', 'styles');
      assert.ok(fs.existsSync(path.join(stylesDir, 'variables.css')), 'styles/variables.css deve existir');
      assert.ok(fs.existsSync(path.join(stylesDir, 'theme-light.css')), 'styles/theme-light.css deve existir');
      assert.ok(fs.existsSync(path.join(stylesDir, 'theme-dark.css')), 'styles/theme-dark.css deve existir');
    });

    it('template base frontend deve conter componentes de notificações e upload', () => {
      const componentsDir = path.join(__dirname, '..', 'Utils', 'templates', 'base', 'frontend', 'src', 'components');
      assert.ok(fs.existsSync(path.join(componentsDir, 'NotificationBell.vue')), 'NotificationBell.vue deve existir');
      assert.ok(fs.existsSync(path.join(componentsDir, 'FileUpload.vue')), 'FileUpload.vue deve existir');
      assert.ok(fs.existsSync(path.join(componentsDir, 'ThemeToggle.vue')), 'ThemeToggle.vue deve existir');
      assert.ok(fs.existsSync(path.join(componentsDir, 'LanguageSelector.vue')), 'LanguageSelector.vue deve existir');
    });

    it('template base frontend deve conter tela de auditoria', () => {
      const auditPath = path.join(__dirname, '..', 'Utils', 'templates', 'base', 'frontend', 'src', 'views', 'AuditView.vue');
      assert.ok(fs.existsSync(auditPath), 'AuditView.vue deve existir');
    });

    it('template base mobile deve conter arquivos de autenticação Flutter', () => {
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
        assert.ok(
          fs.existsSync(path.join(baseMobileDir, file)),
          `Arquivo de auth mobile "${file}" deve existir no template base mobile`
        );
      });
    });

    it('template base mobile deve conter dashboard, auditoria e notificações', () => {
      const baseMobileDir = path.join(__dirname, '..', 'Utils', 'templates', 'base', 'mobile', 'lib');
      const files = [
        'screens/dashboard_screen.dart',
        'screens/audit_screen.dart',
        'screens/notifications_screen.dart',
        'screens/settings_screen.dart'
      ];
      files.forEach(file => {
        assert.ok(
          fs.existsSync(path.join(baseMobileDir, file)),
          `Arquivo mobile "${file}" deve existir no template base mobile`
        );
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
});
