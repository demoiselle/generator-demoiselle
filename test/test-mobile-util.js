'use strict';

const assert = require('assert');
const fc = require('fast-check');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

const { dartType, flutterWidgetType, isPrimitive } = require('../Utils/mobile.js');

// --- Paths ---
const mobileBasePath = path.join(__dirname, '..', 'Utils', 'templates', 'base', 'mobile');
const authMobilePath = path.join(__dirname, '..', 'Utils', 'templates', 'packages', 'auth', 'mobile');
const themesMobilePath = path.join(__dirname, '..', 'Utils', 'templates', 'packages', 'themes', 'mobile');
const i18nMobilePath = path.join(__dirname, '..', 'Utils', 'templates', 'packages', 'i18n', 'mobile');
const pubspecTemplatePath = path.join(mobileBasePath, 'pubspec.yaml');
const pubspecTemplate = fs.readFileSync(pubspecTemplatePath, 'utf-8');

const PackageRegistry = require('../Utils/packageRegistry');
const mobileRegistry = new PackageRegistry();
const allMobilePackages = mobileRegistry.getAvailablePackages().map(p => p.slug);
const allDartDeps = mobileRegistry.getDartDeps(allMobilePackages);

// Base-only dart deps (no optional packages selected)
const baseDartDeps = {};

// --- Arbitraries ---

const projectArb = fc.stringMatching(/^[a-z][a-z0-9]{1,10}$/).map(lower => ({
  lower,
  capital: lower.charAt(0).toUpperCase() + lower.slice(1)
}));

// ============================================================
// Existing unit tests
// ============================================================

describe('MobileUtil helper functions', function () {

    describe('dartType', function () {
        it('should map String to Dart String', function () {
            assert.strictEqual(dartType('String'), 'String');
            assert.strictEqual(dartType('string'), 'String');
        });

        it('should map Integer and int to Dart int', function () {
            assert.strictEqual(dartType('Integer'), 'int');
            assert.strictEqual(dartType('int'), 'int');
        });

        it('should map Long to Dart int', function () {
            assert.strictEqual(dartType('Long'), 'int');
        });

        it('should map Double and float to Dart double', function () {
            assert.strictEqual(dartType('Double'), 'double');
            assert.strictEqual(dartType('float'), 'double');
        });

        it('should map BigDecimal to Dart double', function () {
            assert.strictEqual(dartType('BigDecimal'), 'double');
        });

        it('should map boolean to Dart bool', function () {
            assert.strictEqual(dartType('boolean'), 'bool');
        });

        it('should map Date types to Dart DateTime', function () {
            assert.strictEqual(dartType('Date'), 'DateTime');
            assert.strictEqual(dartType('LocalDate'), 'DateTime');
            assert.strictEqual(dartType('LocalDateTime'), 'DateTime');
        });

        it('should return the type as-is for unknown/relationship types', function () {
            assert.strictEqual(dartType('Category'), 'Category');
            assert.strictEqual(dartType('Order'), 'Order');
        });

        it('should handle null/undefined gracefully', function () {
            assert.strictEqual(dartType(''), '');
            assert.strictEqual(dartType(undefined), undefined);
        });
    });

    describe('flutterWidgetType', function () {
        it('should return email for fields with email in name', function () {
            assert.strictEqual(flutterWidgetType({ name: 'email', type: 'String' }), 'email');
            assert.strictEqual(flutterWidgetType({ name: 'userEmail', type: 'String' }), 'email');
            assert.strictEqual(flutterWidgetType({ name: 'mail', type: 'String' }), 'email');
        });

        it('should return password for fields with pass in name', function () {
            assert.strictEqual(flutterWidgetType({ name: 'password', type: 'String' }), 'password');
            assert.strictEqual(flutterWidgetType({ name: 'passphrase', type: 'String' }), 'password');
        });

        it('should return datePicker for Date types', function () {
            assert.strictEqual(flutterWidgetType({ name: 'createdAt', type: 'Date' }), 'datePicker');
            assert.strictEqual(flutterWidgetType({ name: 'birthDate', type: 'LocalDate' }), 'datePicker');
            assert.strictEqual(flutterWidgetType({ name: 'updatedAt', type: 'LocalDateTime' }), 'datePicker');
        });

        it('should return number for numeric types', function () {
            assert.strictEqual(flutterWidgetType({ name: 'age', type: 'Integer' }), 'number');
            assert.strictEqual(flutterWidgetType({ name: 'count', type: 'Long' }), 'number');
            assert.strictEqual(flutterWidgetType({ name: 'price', type: 'Double' }), 'number');
            assert.strictEqual(flutterWidgetType({ name: 'amount', type: 'BigDecimal' }), 'number');
        });

        it('should return switch for boolean type', function () {
            assert.strictEqual(flutterWidgetType({ name: 'active', type: 'boolean' }), 'switch');
        });

        it('should return dropdown for non-primitive relationship types', function () {
            assert.strictEqual(flutterWidgetType({ name: 'category', type: 'Category' }), 'dropdown');
            assert.strictEqual(flutterWidgetType({ name: 'author', type: 'User' }), 'dropdown');
        });

        it('should return text for plain String fields', function () {
            assert.strictEqual(flutterWidgetType({ name: 'name', type: 'String' }), 'text');
            assert.strictEqual(flutterWidgetType({ name: 'description', type: 'String' }), 'text');
        });
    });

    describe('isPrimitive', function () {
        it('should return true for known Java types', function () {
            const primitiveTypes = [
                'String', 'Integer', 'int', 'Long', 'Double', 'float',
                'boolean', 'Date', 'LocalDate', 'LocalDateTime',
                'BigDecimal', 'uuid', 'short', 'number'
            ];
            primitiveTypes.forEach(function (type) {
                assert.strictEqual(isPrimitive({ name: 'x', type: type }), true, type + ' should be primitive');
            });
        });

        it('should return false for relationship/custom types', function () {
            assert.strictEqual(isPrimitive({ name: 'x', type: 'Category' }), false);
            assert.strictEqual(isPrimitive({ name: 'x', type: 'User' }), false);
            assert.strictEqual(isPrimitive({ name: 'x', type: 'Order' }), false);
        });
    });

    describe('MobileUtil class', function () {
        it('should export the MobileUtil class as default', function () {
            const MobileUtil = require('../Utils/mobile.js');
            assert.strictEqual(typeof MobileUtil, 'function');
            assert.strictEqual(typeof MobileUtil.prototype.createCrud, 'function');
            assert.strictEqual(typeof MobileUtil.prototype.createScreen, 'function');
            assert.strictEqual(typeof MobileUtil.prototype.createService, 'function');
            assert.strictEqual(typeof MobileUtil.prototype.createModel, 'function');
            assert.strictEqual(typeof MobileUtil.prototype._addRoute, 'function');
            assert.strictEqual(typeof MobileUtil.prototype._addI18nKeys, 'function');
            assert.strictEqual(typeof MobileUtil.prototype._addDashboardCard, 'function');
            assert.strictEqual(typeof MobileUtil.prototype._addDrawerItem, 'function');
        });
    });
});

// ============================================================
// Property-based tests
// ============================================================


/**
 * **Validates: Requirements 25.2**
 *
 * Property 22: Dependências Flutter no pubspec.yaml
 *
 * For any valid project name, the generated pubspec.yaml must contain all
 * required Flutter dependencies: dio, flutter_riverpod, go_router,
 * flutter_secure_storage, intl, firebase_messaging, file_picker,
 * image_picker, share_plus, shared_preferences.
 */
describe('Property 22: Dependências Flutter no pubspec.yaml', function () {

  it('pubspec.yaml deve conter todas as dependências Flutter obrigatórias para qualquer projeto válido', function () {
    this.timeout(30000);

    const requiredDeps = [
      'dio',
      'flutter_riverpod',
      'go_router',
      'flutter_secure_storage',
      'intl',
      'firebase_messaging',
      'file_picker',
      'image_picker',
      'share_plus',
      'shared_preferences'
    ];

    fc.assert(
      fc.property(projectArb, (project) => {
        const rendered = ejs.render(pubspecTemplate, { project, dartDeps: allDartDeps });

        // Each required dependency must appear as a key in the YAML
        requiredDeps.forEach(dep => {
          const depRegex = new RegExp('^\\s+' + dep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ':', 'm');
          assert.ok(
            depRegex.test(rendered),
            `pubspec.yaml deve conter a dependência "${dep}"`
          );
        });

        // Verify project name interpolation in the name field
        assert.ok(
          rendered.includes('name: ' + project.lower),
          `pubspec.yaml "name" deve conter o nome do projeto: ${project.lower}`
        );

        // Verify flutter SDK dependency is present
        assert.ok(
          rendered.includes('flutter:'),
          'pubspec.yaml deve conter dependência do Flutter SDK'
        );

        // Verify flutter_localizations SDK dependency is present
        assert.ok(
          rendered.includes('flutter_localizations:'),
          'pubspec.yaml deve conter dependência do flutter_localizations'
        );
      }),
      { numRuns: 100 }
    );
  });
});


/**
 * **Validates: Requirements 26.1, 26.2, 26.3, 26.4, 27.1, 27.2, 28.1, 28.2**
 *
 * Property 24: Completude do sistema de autenticação mobile
 *
 * Verifies that all auth-related files exist and contain the expected content:
 * - login_screen.dart: email/password fields, form validation, authProvider usage
 * - register_screen.dart: name/email/password/confirm fields
 * - forgot_password_screen.dart and reset_password_screen.dart exist
 * - auth_provider.dart: login/logout/refreshToken, uses flutter_secure_storage
 * - auth_service.dart: login/register/forgotPassword/resetPassword methods
 */
describe('Property 24: Completude do sistema de autenticação mobile', function () {

  const authFiles = {
    'login_screen.dart': path.join(authMobilePath, 'lib', 'screens', 'login_screen.dart'),
    'register_screen.dart': path.join(authMobilePath, 'lib', 'screens', 'register_screen.dart'),
    'forgot_password_screen.dart': path.join(authMobilePath, 'lib', 'screens', 'forgot_password_screen.dart'),
    'reset_password_screen.dart': path.join(authMobilePath, 'lib', 'screens', 'reset_password_screen.dart'),
    'auth_provider.dart': path.join(authMobilePath, 'lib', 'providers', 'auth_provider.dart'),
    'auth_service.dart': path.join(authMobilePath, 'lib', 'services', 'auth_service.dart'),
  };

  it('todos os arquivos de autenticação mobile devem existir', function () {
    Object.entries(authFiles).forEach(([name, filePath]) => {
      assert.ok(
        fs.existsSync(filePath),
        `Arquivo de autenticação "${name}" deve existir em ${filePath}`
      );
    });
  });

  it('login_screen.dart deve conter campos de email e senha, validação de formulário e uso do authProvider', function () {
    const content = fs.readFileSync(authFiles['login_screen.dart'], 'utf-8');

    // Email field
    assert.ok(
      content.includes('_emailController') && content.includes('TextInputType.emailAddress'),
      'login_screen.dart deve conter campo de email com TextInputType.emailAddress'
    );

    // Password field
    assert.ok(
      content.includes('_passwordController') && content.includes('obscureText'),
      'login_screen.dart deve conter campo de senha com obscureText'
    );

    // Form validation
    assert.ok(
      content.includes('_formKey') && content.includes('GlobalKey<FormState>'),
      'login_screen.dart deve conter validação de formulário com GlobalKey<FormState>'
    );

    // authProvider usage
    assert.ok(
      content.includes('authProvider'),
      'login_screen.dart deve usar authProvider'
    );

    // AppLocalizations usage
    assert.ok(
      content.includes('AppLocalizations'),
      'login_screen.dart deve usar AppLocalizations para i18n'
    );
  });

  it('register_screen.dart deve conter campos de nome, email, senha e confirmação', function () {
    const content = fs.readFileSync(authFiles['register_screen.dart'], 'utf-8');

    // Name field
    assert.ok(
      content.includes('_nameController'),
      'register_screen.dart deve conter campo de nome'
    );

    // Email field
    assert.ok(
      content.includes('_emailController'),
      'register_screen.dart deve conter campo de email'
    );

    // Password field
    assert.ok(
      content.includes('_passwordController'),
      'register_screen.dart deve conter campo de senha'
    );

    // Confirm password field
    assert.ok(
      content.includes('_confirmPasswordController'),
      'register_screen.dart deve conter campo de confirmação de senha'
    );

    // Form validation
    assert.ok(
      content.includes('GlobalKey<FormState>'),
      'register_screen.dart deve conter validação de formulário'
    );
  });

  it('auth_provider.dart deve conter login, logout, refreshToken e usar flutter_secure_storage', function () {
    const content = fs.readFileSync(authFiles['auth_provider.dart'], 'utf-8');

    // login method
    assert.ok(
      content.includes('login('),
      'auth_provider.dart deve conter método login'
    );

    // logout method
    assert.ok(
      content.includes('logout('),
      'auth_provider.dart deve conter método logout'
    );

    // refreshToken method
    assert.ok(
      content.includes('refreshToken('),
      'auth_provider.dart deve conter método refreshToken'
    );

    // flutter_secure_storage usage
    assert.ok(
      content.includes('flutter_secure_storage') || content.includes('FlutterSecureStorage'),
      'auth_provider.dart deve usar flutter_secure_storage'
    );

    // Riverpod provider
    assert.ok(
      content.includes('StateNotifierProvider') || content.includes('StateNotifier'),
      'auth_provider.dart deve usar Riverpod StateNotifier'
    );
  });

  it('auth_service.dart deve conter métodos login, register, forgotPassword e resetPassword', function () {
    const content = fs.readFileSync(authFiles['auth_service.dart'], 'utf-8');

    // login method
    assert.ok(
      content.includes('login('),
      'auth_service.dart deve conter método login'
    );

    // register method
    assert.ok(
      content.includes('register('),
      'auth_service.dart deve conter método register'
    );

    // forgotPassword method
    assert.ok(
      content.includes('forgotPassword('),
      'auth_service.dart deve conter método forgotPassword'
    );

    // resetPassword method
    assert.ok(
      content.includes('resetPassword('),
      'auth_service.dart deve conter método resetPassword'
    );

    // Dio usage
    assert.ok(
      content.includes('Dio') || content.includes('dio'),
      'auth_service.dart deve usar Dio para HTTP'
    );
  });
});


/**
 * **Validates: Requirements 37.1, 37.2, 37.3, 37.4**
 *
 * Property 26: Temas Material Design 3 no mobile
 *
 * Verifies that:
 * - app_theme.dart exists with light() and dark() methods, useMaterial3: true
 * - color_schemes.dart exists with ColorScheme.fromSeed for light and dark
 * - theme_provider.dart uses shared_preferences for persistence and supports ThemeMode.system
 * - settings_screen.dart has theme toggle
 */
describe('Property 26: Temas Material Design 3 no mobile', function () {

  const themeFiles = {
    'app_theme.dart': path.join(themesMobilePath, 'lib', 'theme', 'app_theme.dart'),
    'color_schemes.dart': path.join(themesMobilePath, 'lib', 'theme', 'color_schemes.dart'),
    'theme_provider.dart': path.join(themesMobilePath, 'lib', 'providers', 'theme_provider.dart'),
    'settings_screen.dart': path.join(mobileBasePath, 'lib', 'screens', 'settings_screen.dart'),
  };

  it('todos os arquivos de tema mobile devem existir', function () {
    Object.entries(themeFiles).forEach(([name, filePath]) => {
      assert.ok(
        fs.existsSync(filePath),
        `Arquivo de tema "${name}" deve existir em ${filePath}`
      );
    });
  });

  it('app_theme.dart deve conter métodos light() e dark() com useMaterial3: true', function () {
    const content = fs.readFileSync(themeFiles['app_theme.dart'], 'utf-8');

    // light() method
    assert.ok(
      /static\s+ThemeData\s+light\s*\(/.test(content),
      'app_theme.dart deve conter método estático light() que retorna ThemeData'
    );

    // dark() method
    assert.ok(
      /static\s+ThemeData\s+dark\s*\(/.test(content),
      'app_theme.dart deve conter método estático dark() que retorna ThemeData'
    );

    // useMaterial3: true
    assert.ok(
      content.includes('useMaterial3: true'),
      'app_theme.dart deve usar Material Design 3 (useMaterial3: true)'
    );
  });

  it('color_schemes.dart deve conter ColorScheme.fromSeed para light e dark', function () {
    const content = fs.readFileSync(themeFiles['color_schemes.dart'], 'utf-8');

    // ColorScheme.fromSeed
    assert.ok(
      content.includes('ColorScheme.fromSeed'),
      'color_schemes.dart deve usar ColorScheme.fromSeed'
    );

    // Light brightness
    assert.ok(
      content.includes('Brightness.light'),
      'color_schemes.dart deve definir esquema de cores para Brightness.light'
    );

    // Dark brightness
    assert.ok(
      content.includes('Brightness.dark'),
      'color_schemes.dart deve definir esquema de cores para Brightness.dark'
    );
  });

  it('theme_provider.dart deve usar shared_preferences para persistência e suportar ThemeMode.system', function () {
    const content = fs.readFileSync(themeFiles['theme_provider.dart'], 'utf-8');

    // shared_preferences usage
    assert.ok(
      content.includes('shared_preferences') || content.includes('SharedPreferences'),
      'theme_provider.dart deve usar shared_preferences para persistência'
    );

    // ThemeMode.system support
    assert.ok(
      content.includes('ThemeMode.system'),
      'theme_provider.dart deve suportar ThemeMode.system como padrão'
    );

    // ThemeMode.light and ThemeMode.dark
    assert.ok(
      content.includes('ThemeMode.light') && content.includes('ThemeMode.dark'),
      'theme_provider.dart deve suportar ThemeMode.light e ThemeMode.dark'
    );

    // Riverpod StateNotifier
    assert.ok(
      content.includes('StateNotifier') || content.includes('StateNotifierProvider'),
      'theme_provider.dart deve usar Riverpod StateNotifier'
    );
  });

  it('settings_screen.dart deve conter toggle de tema', function () {
    const content = fs.readFileSync(themeFiles['settings_screen.dart'], 'utf-8');

    // Theme provider import/usage
    assert.ok(
      content.includes('themeModeProvider') || content.includes('theme_provider'),
      'settings_screen.dart deve importar/usar o theme provider'
    );

    // Theme toggle UI (SegmentedButton or Switch or similar)
    assert.ok(
      content.includes('SegmentedButton') || content.includes('Switch') || content.includes('ThemeMode'),
      'settings_screen.dart deve conter controle de alternância de tema'
    );

    // Theme mode labels
    assert.ok(
      content.includes('settingsTheme'),
      'settings_screen.dart deve exibir labels de tema via i18n'
    );
  });
});


/**
 * **Validates: Requirements 38.1, 38.2, 38.3, 38.4**
 *
 * Property 25: Internacionalização mobile completa
 *
 * Verifies that:
 * - app_pt.arb and app_en.arb exist with matching keys
 * - app_localizations.dart exists with delegate and of(context)
 * - All screens import and use AppLocalizations
 * - settings_screen.dart has language selection
 */
describe('Property 25: Internacionalização mobile completa', function () {

  const l10nFiles = {
    'app_pt.arb': path.join(i18nMobilePath, 'lib', 'l10n', 'app_pt.arb'),
    'app_en.arb': path.join(i18nMobilePath, 'lib', 'l10n', 'app_en.arb'),
    'app_localizations.dart': path.join(i18nMobilePath, 'lib', 'l10n', 'app_localizations.dart'),
  };

  const screenFiles = {
    'login_screen.dart': path.join(authMobilePath, 'lib', 'screens'),
    'register_screen.dart': path.join(authMobilePath, 'lib', 'screens'),
    'forgot_password_screen.dart': path.join(authMobilePath, 'lib', 'screens'),
    'reset_password_screen.dart': path.join(authMobilePath, 'lib', 'screens'),
    'dashboard_screen.dart': path.join(__dirname, '..', 'Utils', 'templates', 'packages', 'dashboard', 'mobile', 'lib', 'screens'),
    'audit_screen.dart': path.join(__dirname, '..', 'Utils', 'templates', 'packages', 'audit', 'mobile', 'lib', 'screens'),
    'notifications_screen.dart': path.join(__dirname, '..', 'Utils', 'templates', 'packages', 'messaging', 'mobile', 'lib', 'screens'),
    'settings_screen.dart': path.join(mobileBasePath, 'lib', 'screens'),
  };

  it('arquivos ARB de tradução devem existir', function () {
    assert.ok(
      fs.existsSync(l10nFiles['app_pt.arb']),
      'app_pt.arb deve existir'
    );
    assert.ok(
      fs.existsSync(l10nFiles['app_en.arb']),
      'app_en.arb deve existir'
    );
  });

  it('app_pt.arb e app_en.arb devem conter as mesmas chaves de tradução', function () {
    const ptContent = JSON.parse(fs.readFileSync(l10nFiles['app_pt.arb'], 'utf-8'));
    const enContent = JSON.parse(fs.readFileSync(l10nFiles['app_en.arb'], 'utf-8'));

    const ptKeys = Object.keys(ptContent).filter(k => !k.startsWith('@@'));
    const enKeys = Object.keys(enContent).filter(k => !k.startsWith('@@'));

    // All pt keys must exist in en
    ptKeys.forEach(key => {
      assert.ok(
        enKeys.includes(key),
        `Chave "${key}" presente em app_pt.arb deve existir em app_en.arb`
      );
    });

    // All en keys must exist in pt
    enKeys.forEach(key => {
      assert.ok(
        ptKeys.includes(key),
        `Chave "${key}" presente em app_en.arb deve existir em app_pt.arb`
      );
    });

    // Both must have locale metadata
    assert.ok(ptContent['@@locale'], 'app_pt.arb deve conter @@locale');
    assert.ok(enContent['@@locale'], 'app_en.arb deve conter @@locale');
  });

  it('app_localizations.dart deve existir com delegate e of(context)', function () {
    const content = fs.readFileSync(l10nFiles['app_localizations.dart'], 'utf-8');

    // of(context) static method
    assert.ok(
      content.includes('of(BuildContext context)') || content.includes('of(context)'),
      'app_localizations.dart deve conter método estático of(context)'
    );

    // delegate
    assert.ok(
      content.includes('delegate') && content.includes('LocalizationsDelegate'),
      'app_localizations.dart deve conter delegate do tipo LocalizationsDelegate'
    );

    // supportedLocales
    assert.ok(
      content.includes('supportedLocales'),
      'app_localizations.dart deve definir supportedLocales'
    );

    // pt and en locales
    assert.ok(
      content.includes("'pt'") || content.includes('"pt"'),
      'app_localizations.dart deve suportar locale pt'
    );
    assert.ok(
      content.includes("'en'") || content.includes('"en"'),
      'app_localizations.dart deve suportar locale en'
    );
  });

  it('todas as telas devem importar e usar AppLocalizations', function () {
    Object.entries(screenFiles).forEach(([screenFile, screensDir]) => {
      const filePath = path.join(screensDir, screenFile);
      assert.ok(
        fs.existsSync(filePath),
        `Tela "${screenFile}" deve existir`
      );

      const content = fs.readFileSync(filePath, 'utf-8');

      // Import AppLocalizations
      assert.ok(
        content.includes('app_localizations') || content.includes('AppLocalizations'),
        `${screenFile} deve importar AppLocalizations`
      );

      // Use AppLocalizations.of(context) or l10n
      assert.ok(
        content.includes('AppLocalizations.of(context)') || content.includes('l10n'),
        `${screenFile} deve usar AppLocalizations.of(context) ou variável l10n`
      );
    });
  });

  it('settings_screen.dart deve conter seleção de idioma', function () {
    const content = fs.readFileSync(
      path.join(mobileBasePath, 'lib', 'screens', 'settings_screen.dart'),
      'utf-8'
    );

    // Language section
    assert.ok(
      content.includes('settingsLanguage') || content.includes('Language'),
      'settings_screen.dart deve conter seção de idioma'
    );

    // Language selection UI
    assert.ok(
      content.includes('settingsLanguageSelect') || content.includes('_showLanguageDialog'),
      'settings_screen.dart deve conter seleção de idioma'
    );

    // Multiple language options
    assert.ok(
      content.includes('Português') || content.includes('Portuguese'),
      'settings_screen.dart deve listar Português como opção'
    );
    assert.ok(
      content.includes('English'),
      'settings_screen.dart deve listar English como opção'
    );
  });
});


// --- Load EJS templates for CRUD Flutter ---

const mobileEntityDir = path.join(__dirname, '..', 'Utils', 'templates', 'mobile', 'entity');

const listScreenTemplatePath = path.join(mobileEntityDir, '_entity_list_screen.dart');
const formScreenTemplatePath = path.join(mobileEntityDir, '_entity_form_screen.dart');
const serviceTemplatePath = path.join(mobileEntityDir, '_entity_service.dart');
const modelTemplatePath = path.join(mobileEntityDir, '_entity_model.dart');
const providerTemplatePath = path.join(mobileEntityDir, '_entity_provider.dart');

const listScreenTemplate = fs.readFileSync(listScreenTemplatePath, 'utf-8');
const formScreenTemplate = fs.readFileSync(formScreenTemplatePath, 'utf-8');
const serviceTemplate = fs.readFileSync(serviceTemplatePath, 'utf-8');
const modelTemplate = fs.readFileSync(modelTemplatePath, 'utf-8');
const providerTemplate = fs.readFileSync(providerTemplatePath, 'utf-8');

// --- Arbitraries for CRUD Flutter tests ---

const JAVA_PRIMITIVE_TYPES = ['String', 'Integer', 'Long', 'Date', 'LocalDate', 'LocalDateTime', 'Double', 'BigDecimal', 'boolean', 'Float', 'Short'];

const entityNameArb = fc.stringMatching(/^[a-z][a-zA-Z]{2,12}$/).filter(s => s.length >= 3);

const primitivePropertyArb = fc.record({
  name: fc.stringMatching(/^[a-z][a-zA-Z]{1,10}$/).filter(n => n !== 'id' && n.length >= 2),
  type: fc.constantFrom(...JAVA_PRIMITIVE_TYPES),
  isReadOnly: fc.boolean(),
  isPrimitive: fc.constant(true)
});

const nonPrimitivePropertyArb = fc.record({
  name: fc.stringMatching(/^[a-z][a-zA-Z]{1,10}$/).filter(n => n !== 'id' && n.length >= 2),
  type: fc.stringMatching(/^[A-Z][a-zA-Z]{2,8}$/).filter(s => s.length >= 3),
  isReadOnly: fc.constant(false),
  isPrimitive: fc.constant(false)
});

const propertyArb = fc.oneof(
  { weight: 4, arbitrary: primitivePropertyArb },
  { weight: 1, arbitrary: nonPrimitivePropertyArb }
);

const propertiesArb = fc.array(propertyArb, { minLength: 1, maxLength: 6 })
  .map(props => {
    const seen = new Set();
    return props.filter(p => {
      if (seen.has(p.name)) return false;
      seen.add(p.name);
      return true;
    });
  })
  .filter(props => props.length >= 1);

// --- Helpers for CRUD Flutter tests ---

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function buildMobileTemplateData(entityName, properties) {
  return {
    name: {
      lower: entityName.toLowerCase(),
      capital: capitalize(entityName)
    },
    properties,
    dartType,
    flutterWidgetType,
    isPrimitive: isPrimitive,
    packages: ['export', 'i18n', 'dashboard', 'auth', 'audit', 'observability', 'mcp']
  };
}

function renderListScreen(entityName, properties) {
  return ejs.render(listScreenTemplate, buildMobileTemplateData(entityName, properties));
}

function renderFormScreen(entityName, properties) {
  return ejs.render(formScreenTemplate, buildMobileTemplateData(entityName, properties));
}

function renderService(entityName, properties) {
  return ejs.render(serviceTemplate, buildMobileTemplateData(entityName, properties));
}

function renderModel(entityName, properties) {
  return ejs.render(modelTemplate, buildMobileTemplateData(entityName, properties));
}

function renderProvider(entityName, properties) {
  return ejs.render(providerTemplate, buildMobileTemplateData(entityName, properties));
}


/**
 * **Validates: Requirements 30.1, 30.2, 30.3, 30.4, 30.5, 41.2**
 *
 * Property 19: Geração completa de CRUD Flutter
 *
 * For any valid entity name and properties, the CRUD generation must produce:
 * - _entity_list_screen.dart: includes AdvancedFilterWidget, ExportButtons, ResponsiveLayout, RefreshIndicator
 * - _entity_form_screen.dart: includes form validation, save method
 * - _entity_service.dart: has findAll, findById, create, update, remove methods
 * - _entity_model.dart: has fromJson, toJson methods
 * - _entity_provider.dart: has StateNotifier
 * All 5 templates render without errors and contain expected content.
 */
describe('Property 19: Geração completa de CRUD Flutter', function () {

  it('todos os 5 templates CRUD Flutter devem renderizar sem erros e conter conteúdo esperado para qualquer entidade', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(entityNameArb, propertiesArb, (entityName, properties) => {
        const entityLower = entityName.toLowerCase();
        const entityCapital = capitalize(entityName);

        // All 5 templates must render without throwing
        const listScreen = renderListScreen(entityName, properties);
        const formScreen = renderFormScreen(entityName, properties);
        const service = renderService(entityName, properties);
        const model = renderModel(entityName, properties);
        const provider = renderProvider(entityName, properties);

        // --- List Screen: class names and imports ---
        assert.ok(
          listScreen.includes(`${entityCapital}ListScreen`),
          `List screen deve conter classe ${entityCapital}ListScreen`
        );
        assert.ok(
          listScreen.includes(`import`),
          'List screen deve conter imports'
        );

        // --- List Screen: AdvancedFilterWidget ---
        assert.ok(
          listScreen.includes('AdvancedFilterWidget'),
          'List screen deve incluir AdvancedFilterWidget'
        );

        // --- List Screen: ExportButtons ---
        assert.ok(
          listScreen.includes('ExportButtons'),
          'List screen deve incluir ExportButtons'
        );

        // --- List Screen: ResponsiveLayout ---
        assert.ok(
          listScreen.includes('ResponsiveLayout'),
          'List screen deve incluir ResponsiveLayout'
        );

        // --- List Screen: RefreshIndicator ---
        assert.ok(
          listScreen.includes('RefreshIndicator'),
          'List screen deve incluir RefreshIndicator'
        );

        // --- Form Screen: class name ---
        assert.ok(
          formScreen.includes(`${entityCapital}FormScreen`),
          `Form screen deve conter classe ${entityCapital}FormScreen`
        );

        // --- Form Screen: form validation ---
        assert.ok(
          formScreen.includes('_formKey') && formScreen.includes('GlobalKey<FormState>'),
          'Form screen deve conter validação de formulário com GlobalKey<FormState>'
        );

        // --- Form Screen: save method ---
        assert.ok(
          formScreen.includes('_save'),
          'Form screen deve conter método _save'
        );

        // --- Service: class name and CRUD methods ---
        assert.ok(
          service.includes(`${entityCapital}Service`),
          `Service deve conter classe ${entityCapital}Service`
        );
        assert.ok(
          /findAll/.test(service),
          'Service deve conter método findAll'
        );
        assert.ok(
          /findById/.test(service),
          'Service deve conter método findById'
        );
        assert.ok(
          /\bcreate\b/.test(service),
          'Service deve conter método create'
        );
        assert.ok(
          /\bupdate\b/.test(service),
          'Service deve conter método update'
        );
        assert.ok(
          /\bremove\b/.test(service),
          'Service deve conter método remove'
        );

        // --- Model: class name, fromJson, toJson ---
        assert.ok(
          model.includes(`${entityCapital}Model`),
          `Model deve conter classe ${entityCapital}Model`
        );
        assert.ok(
          model.includes('fromJson'),
          'Model deve conter factory fromJson'
        );
        assert.ok(
          model.includes('toJson'),
          'Model deve conter método toJson'
        );

        // --- Provider: StateNotifier ---
        assert.ok(
          provider.includes('StateNotifier'),
          'Provider deve conter StateNotifier'
        );
        assert.ok(
          provider.includes(`${entityCapital}ListNotifier`),
          `Provider deve conter classe ${entityCapital}ListNotifier`
        );
        assert.ok(
          provider.includes(`${entityLower}ListProvider`),
          `Provider deve conter ${entityLower}ListProvider`
        );
      }),
      { numRuns: 100 }
    );
  });
});


/**
 * **Validates: Requirements 30.4, 42.4**
 *
 * Property 20: Round-trip de serialização JSON nos models Dart
 *
 * For any valid entity name and properties, the generated model must:
 * - Have both fromJson and toJson methods
 * - All properties appear in both fromJson and toJson
 * - DateTime properties use toIso8601String() in toJson and DateTime.parse() in fromJson
 */
describe('Property 20: Round-trip de serialização JSON nos models Dart', function () {

  it('model Dart deve conter fromJson e toJson com todas as propriedades e serialização DateTime correta', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(entityNameArb, propertiesArb, (entityName, properties) => {
        const model = renderModel(entityName, properties);

        // Must have fromJson factory
        assert.ok(
          model.includes('fromJson'),
          'Model deve conter factory fromJson'
        );

        // Must have toJson method
        assert.ok(
          model.includes('toJson'),
          'Model deve conter método toJson'
        );

        // All properties must appear in fromJson
        for (const prop of properties) {
          assert.ok(
            model.includes(`json['${prop.name}']`),
            `fromJson deve referenciar propriedade "${prop.name}" via json['${prop.name}']`
          );
        }

        // All properties must appear in toJson
        for (const prop of properties) {
          assert.ok(
            model.includes(`'${prop.name}': ${prop.name}`),
            `toJson deve conter entrada '${prop.name}': ${prop.name}`
          );
        }

        // DateTime properties must use toIso8601String() in toJson
        const dateProps = properties.filter(p => /^(date|localdate|localdatetime)$/i.test(p.type));
        for (const prop of dateProps) {
          assert.ok(
            model.includes(`${prop.name}.toIso8601String()`) || model.includes(`${prop.name}?.toIso8601String()`),
            `toJson deve usar toIso8601String() para propriedade DateTime "${prop.name}"`
          );
        }

        // DateTime properties must use DateTime.parse() in fromJson
        for (const prop of dateProps) {
          assert.ok(
            model.includes(`DateTime.parse(json['${prop.name}']`),
            `fromJson deve usar DateTime.parse() para propriedade DateTime "${prop.name}"`
          );
        }
      }),
      { numRuns: 100 }
    );
  });
});


/**
 * **Validates: Requirements 31.2, 31.3**
 *
 * Property 21: Mapeamento de tipos Java para widgets Flutter
 *
 * For any entity with specific Java types, the form screen template must map:
 * - String → TextFormField
 * - String (email) → TextInputType.emailAddress
 * - String (pass) → obscureText: true
 * - Date/LocalDate/LocalDateTime → showDatePicker
 * - Integer/Long/Double/BigDecimal → TextInputType.number
 * - boolean → SwitchListTile
 * - Non-primitive → DropdownButtonFormField
 */
describe('Property 21: Mapeamento de tipos Java para widgets Flutter', function () {

  // Specific arbitraries for each widget type mapping

  const emailPropertyArb = fc.record({
    name: fc.constantFrom('email', 'userEmail', 'contactEmail', 'mail'),
    type: fc.constant('String'),
    isReadOnly: fc.constant(false),
    isPrimitive: fc.constant(true)
  });

  const passwordPropertyArb = fc.record({
    name: fc.constantFrom('password', 'pass', 'passphrase', 'userPass'),
    type: fc.constant('String'),
    isReadOnly: fc.constant(false),
    isPrimitive: fc.constant(true)
  });

  const datePropertyArb = fc.record({
    name: fc.stringMatching(/^[a-z][a-zA-Z]{1,10}$/).filter(n => n !== 'id' && !/mail/i.test(n) && !/pass/i.test(n) && n.length >= 2),
    type: fc.constantFrom('Date', 'LocalDate', 'LocalDateTime'),
    isReadOnly: fc.constant(false),
    isPrimitive: fc.constant(true)
  });

  const numberPropertyArb = fc.record({
    name: fc.stringMatching(/^[a-z][a-zA-Z]{1,10}$/).filter(n => n !== 'id' && !/mail/i.test(n) && !/pass/i.test(n) && n.length >= 2),
    type: fc.constantFrom('Integer', 'Long', 'Double', 'BigDecimal', 'Float', 'Short'),
    isReadOnly: fc.constant(false),
    isPrimitive: fc.constant(true)
  });

  const booleanPropertyArb = fc.record({
    name: fc.stringMatching(/^[a-z][a-zA-Z]{1,10}$/).filter(n => n !== 'id' && !/mail/i.test(n) && !/pass/i.test(n) && n.length >= 2),
    type: fc.constant('boolean'),
    isReadOnly: fc.constant(false),
    isPrimitive: fc.constant(true)
  });

  const plainStringPropertyArb = fc.record({
    name: fc.stringMatching(/^[a-z][a-zA-Z]{1,10}$/).filter(n => n !== 'id' && !/mail/i.test(n) && !/pass/i.test(n) && n.length >= 2),
    type: fc.constant('String'),
    isReadOnly: fc.constant(false),
    isPrimitive: fc.constant(true)
  });

  const relationPropertyArb = fc.record({
    name: fc.stringMatching(/^[a-z][a-zA-Z]{1,10}$/).filter(n => n !== 'id' && !/mail/i.test(n) && !/pass/i.test(n) && n.length >= 2),
    type: fc.stringMatching(/^[A-Z][a-zA-Z]{2,8}$/).filter(s => s.length >= 3),
    isReadOnly: fc.constant(false),
    isPrimitive: fc.constant(false)
  });

  it('String com email no nome deve gerar TextInputType.emailAddress', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(entityNameArb, emailPropertyArb, (entityName, emailProp) => {
        const form = renderFormScreen(entityName, [emailProp]);
        assert.ok(
          form.includes('TextInputType.emailAddress'),
          `Campo "${emailProp.name}" deve gerar TextInputType.emailAddress`
        );
        assert.ok(
          form.includes('TextFormField'),
          `Campo "${emailProp.name}" deve gerar TextFormField`
        );
      }),
      { numRuns: 50 }
    );
  });

  it('String com pass no nome deve gerar obscureText: true', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(entityNameArb, passwordPropertyArb, (entityName, passProp) => {
        const form = renderFormScreen(entityName, [passProp]);
        assert.ok(
          form.includes('obscureText: true'),
          `Campo "${passProp.name}" deve gerar obscureText: true`
        );
        assert.ok(
          form.includes('TextFormField'),
          `Campo "${passProp.name}" deve gerar TextFormField`
        );
      }),
      { numRuns: 50 }
    );
  });

  it('Date/LocalDate/LocalDateTime deve gerar showDatePicker', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(entityNameArb, datePropertyArb, (entityName, dateProp) => {
        const form = renderFormScreen(entityName, [dateProp]);
        assert.ok(
          form.includes('showDatePicker'),
          `Campo "${dateProp.name}" (tipo ${dateProp.type}) deve gerar showDatePicker`
        );
      }),
      { numRuns: 50 }
    );
  });

  it('Integer/Long/Double/BigDecimal deve gerar TextInputType.number', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(entityNameArb, numberPropertyArb, (entityName, numProp) => {
        const form = renderFormScreen(entityName, [numProp]);
        assert.ok(
          form.includes('TextInputType.number'),
          `Campo "${numProp.name}" (tipo ${numProp.type}) deve gerar TextInputType.number`
        );
        assert.ok(
          form.includes('TextFormField'),
          `Campo "${numProp.name}" deve gerar TextFormField`
        );
      }),
      { numRuns: 50 }
    );
  });

  it('boolean deve gerar SwitchListTile', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(entityNameArb, booleanPropertyArb, (entityName, boolProp) => {
        const form = renderFormScreen(entityName, [boolProp]);
        assert.ok(
          form.includes('SwitchListTile'),
          `Campo "${boolProp.name}" (tipo boolean) deve gerar SwitchListTile`
        );
      }),
      { numRuns: 50 }
    );
  });

  it('tipo não primitivo (relacionamento) deve gerar DropdownButtonFormField', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(entityNameArb, relationPropertyArb, (entityName, relProp) => {
        const form = renderFormScreen(entityName, [relProp]);
        assert.ok(
          form.includes('DropdownButtonFormField'),
          `Campo "${relProp.name}" (tipo ${relProp.type}) deve gerar DropdownButtonFormField`
        );
      }),
      { numRuns: 50 }
    );
  });

  it('String simples (sem email/pass) deve gerar TextFormField sem tipo especial', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(entityNameArb, plainStringPropertyArb, (entityName, strProp) => {
        const form = renderFormScreen(entityName, [strProp]);
        assert.ok(
          form.includes('TextFormField'),
          `Campo "${strProp.name}" (tipo String) deve gerar TextFormField`
        );
        // Should NOT have emailAddress or obscureText for plain strings
        // (only check the section for this specific field)
        assert.ok(
          !form.includes('TextInputType.emailAddress'),
          `Campo String simples "${strProp.name}" NÃO deve gerar TextInputType.emailAddress`
        );
        assert.ok(
          !form.includes('obscureText: true'),
          `Campo String simples "${strProp.name}" NÃO deve gerar obscureText: true`
        );
      }),
      { numRuns: 50 }
    );
  });
});
