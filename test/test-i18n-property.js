'use strict';

const assert = require('assert');
const fc = require('fast-check');
const fs = require('fs');
const path = require('path');

// --- Paths ---

const baseFrontendPath = path.join(__dirname, '..', 'Utils', 'templates', 'packages', 'i18n', 'frontend', 'src');
const i18nDir = path.join(baseFrontendPath, 'i18n');
const componentsDir = path.join(baseFrontendPath, 'components');
const viewsDir = path.join(baseFrontendPath, 'views');

// --- Load files ---

const i18nIndexPath = path.join(i18nDir, 'index.js');
const ptBRPath = path.join(i18nDir, 'pt-BR.json');
const enPath = path.join(i18nDir, 'en.json');
const languageSelectorPath = path.join(componentsDir, 'LanguageSelector.vue');

const i18nIndex = fs.readFileSync(i18nIndexPath, 'utf-8');
const ptBR = JSON.parse(fs.readFileSync(ptBRPath, 'utf-8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf-8'));

// --- Helpers ---

/**
 * Recursively extract all leaf keys from a nested object.
 * Returns an array of dot-separated key paths, e.g. ['login.title', 'login.email']
 */
function extractKeys(obj, prefix) {
  prefix = prefix || '';
  let keys = [];
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? prefix + '.' + key : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(extractKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

/**
 * Recursively extract all keys (including intermediate object keys) from a nested object.
 * Returns an array of dot-separated key paths.
 */
function extractAllKeys(obj, prefix) {
  prefix = prefix || '';
  let keys = [];
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? prefix + '.' + key : key;
    keys.push(fullKey);
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(extractAllKeys(obj[key], fullKey));
    }
  }
  return keys;
}

/**
 * Read all .vue files from a directory and return their contents.
 */
function readVueFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  for (const file of fs.readdirSync(dir)) {
    if (file.endsWith('.vue')) {
      files.push({
        name: file,
        content: fs.readFileSync(path.join(dir, file), 'utf-8')
      });
    }
  }
  return files;
}

/**
 * Extract the <template> section from a Vue SFC string.
 */
function extractTemplate(sfcContent) {
  const match = sfcContent.match(/<template[^>]*>([\s\S]*?)<\/template>/);
  return match ? match[1] : '';
}


/**
 * **Validates: Requirements 22.1, 22.2, 22.3, 22.4**
 *
 * Property 16: Internacionalização completa
 *
 * The i18n system must be fully configured:
 * - i18n/index.js configures vue-i18n with pt-BR (default) and en (Req 22.1)
 * - Translation files pt-BR.json and en.json exist with matching key structures (Req 22.1)
 * - LanguageSelector.vue component exists and is accessible (Req 22.2)
 * - All Vue SFC templates in the base frontend use $t() for visible text (Req 22.3)
 * - Translation keys support entity field labels for CRUD generation (Req 22.4)
 */
describe('Property 16: Internacionalização completa', () => {

  // --- Req 22.1: i18n configuration ---

  it('i18n/index.js deve configurar vue-i18n com pt-BR como padrão e en como secundário', function () {
    this.timeout(30000);

    // i18n index.js must exist
    assert.ok(
      fs.existsSync(i18nIndexPath),
      'i18n/index.js deve existir em Utils/templates/base/frontend/src/i18n/'
    );

    // Must import createI18n from vue-i18n
    assert.ok(
      /import\s+\{[^}]*createI18n[^}]*\}\s+from\s+['"]vue-i18n['"]/.test(i18nIndex),
      'i18n/index.js deve importar createI18n de vue-i18n'
    );

    // Must import pt-BR translations
    assert.ok(
      /import\s+\w+\s+from\s+['"]\.\/pt-BR\.json['"]/.test(i18nIndex),
      'i18n/index.js deve importar pt-BR.json'
    );

    // Must import en translations
    assert.ok(
      /import\s+\w+\s+from\s+['"]\.\/en\.json['"]/.test(i18nIndex),
      'i18n/index.js deve importar en.json'
    );

    // Must configure locale as pt-BR (default)
    assert.ok(
      /locale\s*:\s*.*['"]pt-BR['"]/.test(i18nIndex),
      'i18n/index.js deve configurar locale padrão como pt-BR'
    );

    // Must configure fallbackLocale as pt-BR
    assert.ok(
      /fallbackLocale\s*:\s*['"]pt-BR['"]/.test(i18nIndex),
      'i18n/index.js deve configurar fallbackLocale como pt-BR'
    );

    // Must configure messages with both locales
    assert.ok(
      /messages\s*:\s*\{/.test(i18nIndex),
      'i18n/index.js deve configurar messages'
    );
    assert.ok(
      /['"]pt-BR['"]\s*:/.test(i18nIndex),
      'i18n/index.js deve incluir pt-BR nas messages'
    );
    assert.ok(
      /['"]en['"]\s*:/.test(i18nIndex),
      'i18n/index.js deve incluir en nas messages'
    );

    // Must export the i18n instance
    assert.ok(
      /export\s+default\s+\w+/.test(i18nIndex),
      'i18n/index.js deve exportar a instância i18n'
    );
  });

  // --- Req 22.1: Translation files must exist and have matching keys ---

  it('pt-BR.json e en.json devem existir e ter estruturas de chaves correspondentes', function () {
    this.timeout(30000);

    // Files must exist
    assert.ok(
      fs.existsSync(ptBRPath),
      'pt-BR.json deve existir em Utils/templates/base/frontend/src/i18n/'
    );
    assert.ok(
      fs.existsSync(enPath),
      'en.json deve existir em Utils/templates/base/frontend/src/i18n/'
    );

    // Extract all keys (including intermediate) from both files
    const ptBRAllKeys = new Set(extractAllKeys(ptBR));
    const enAllKeys = new Set(extractAllKeys(en));

    // Every key in pt-BR must exist in en
    for (const key of ptBRAllKeys) {
      assert.ok(
        enAllKeys.has(key),
        `Chave "${key}" existe em pt-BR.json mas não em en.json`
      );
    }

    // Every key in en must exist in pt-BR
    for (const key of enAllKeys) {
      assert.ok(
        ptBRAllKeys.has(key),
        `Chave "${key}" existe em en.json mas não em pt-BR.json`
      );
    }

    // Both must have leaf keys (non-empty translation files)
    const ptBRLeafKeys = extractKeys(ptBR);
    const enLeafKeys = extractKeys(en);
    assert.ok(ptBRLeafKeys.length > 0, 'pt-BR.json deve conter chaves de tradução');
    assert.ok(enLeafKeys.length > 0, 'en.json deve conter chaves de tradução');
    assert.strictEqual(
      ptBRLeafKeys.length,
      enLeafKeys.length,
      `pt-BR.json (${ptBRLeafKeys.length} chaves) e en.json (${enLeafKeys.length} chaves) devem ter o mesmo número de chaves folha`
    );
  });

  // --- Req 22.2: LanguageSelector component ---

  it('LanguageSelector.vue deve existir e ser um componente Vue SFC funcional', function () {
    this.timeout(30000);

    assert.ok(
      fs.existsSync(languageSelectorPath),
      'LanguageSelector.vue deve existir em Utils/templates/base/frontend/src/components/'
    );

    const content = fs.readFileSync(languageSelectorPath, 'utf-8');

    // Must be a valid Vue SFC with <template>, <script>, and <style>
    assert.ok(
      /<template[^>]*>/.test(content),
      'LanguageSelector.vue deve conter seção <template>'
    );
    assert.ok(
      /<script[^>]*>/.test(content),
      'LanguageSelector.vue deve conter seção <script>'
    );

    // Must use vue-i18n
    assert.ok(
      /useI18n/.test(content) || /vue-i18n/.test(content),
      'LanguageSelector.vue deve usar vue-i18n (useI18n)'
    );

    // Must reference locale switching
    assert.ok(
      /locale/.test(content),
      'LanguageSelector.vue deve manipular locale'
    );

    // Must support pt-BR and en
    assert.ok(
      /pt-BR/.test(content),
      'LanguageSelector.vue deve suportar pt-BR'
    );
    assert.ok(
      /en/.test(content),
      'LanguageSelector.vue deve suportar en'
    );

    // Must persist locale to localStorage
    assert.ok(
      /localStorage/.test(content),
      'LanguageSelector.vue deve persistir idioma no localStorage'
    );
  });

  // --- Req 22.3: Vue SFC templates must use $t() for visible text ---

  it('todos os Vue SFC templates base devem usar $t() para textos visíveis ao usuário', function () {
    this.timeout(30000);

    const componentFiles = readVueFiles(componentsDir);
    const viewFiles = readVueFiles(viewsDir);
    const allVueFiles = componentFiles.concat(viewFiles);

    assert.ok(
      allVueFiles.length > 0,
      'Deve existir pelo menos um arquivo .vue nos diretórios components/ e views/'
    );

    // Property test: for any randomly selected Vue SFC file, its template section
    // must use $t() calls and not contain hardcoded Portuguese/English user-visible text
    const vueFileArb = fc.constantFrom(...allVueFiles);

    fc.assert(
      fc.property(vueFileArb, (vueFile) => {
        const templateSection = extractTemplate(vueFile.content);

        // Skip files with empty or minimal templates
        if (templateSection.trim().length < 20) return true;

        // The template must contain at least one $t() call if it has visible text
        // Check for text content between tags that isn't a Vue expression
        const hasVisibleTextContent = /<[^>]+>([^<{]+)</.test(templateSection);
        const hasTCalls = /\$t\s*\(/.test(templateSection);

        // If the template has visible text content, it should also have $t() calls
        // (allowing for some files that only have dynamic content)
        if (hasVisibleTextContent) {
          assert.ok(
            hasTCalls,
            `${vueFile.name} contém texto visível mas não usa $t() para internacionalização`
          );
        }

        return true;
      }),
      { numRuns: 50 }
    );
  });

  // --- Req 22.4: Translation keys support entity field labels ---

  it('arquivos de tradução devem ter estrutura que suporte chaves de entidade para CRUDs gerados', function () {
    this.timeout(30000);

    // The translation files must have a structure that supports entity-specific keys.
    // The design specifies that when add/fromEntity creates a CRUD, it auto-generates
    // translation keys like: { "<entityName>": { "title": "...", "fields": { ... } } }
    // The base files must have the "dashboard.entities" object as a placeholder for entity stats.

    // Verify the base structure supports entity keys
    assert.ok(
      ptBR.dashboard && typeof ptBR.dashboard === 'object',
      'pt-BR.json deve conter seção "dashboard"'
    );
    assert.ok(
      en.dashboard && typeof en.dashboard === 'object',
      'en.json deve conter seção "dashboard"'
    );

    // Verify common CRUD-related keys exist for reuse
    assert.ok(
      ptBR.common && ptBR.common.create,
      'pt-BR.json deve conter common.create para uso em CRUDs'
    );
    assert.ok(
      ptBR.common && ptBR.common.edit,
      'pt-BR.json deve conter common.edit para uso em CRUDs'
    );
    assert.ok(
      ptBR.common && ptBR.common.delete,
      'pt-BR.json deve conter common.delete para uso em CRUDs'
    );
    assert.ok(
      ptBR.common && ptBR.common.save,
      'pt-BR.json deve conter common.save para uso em CRUDs'
    );
    assert.ok(
      ptBR.common && ptBR.common.cancel,
      'pt-BR.json deve conter common.cancel para uso em CRUDs'
    );
    assert.ok(
      ptBR.common && ptBR.common.actions,
      'pt-BR.json deve conter common.actions para uso em CRUDs'
    );
    assert.ok(
      ptBR.common && ptBR.common.exportCsv,
      'pt-BR.json deve conter common.exportCsv para uso em CRUDs'
    );
    assert.ok(
      ptBR.common && ptBR.common.exportPdf,
      'pt-BR.json deve conter common.exportPdf para uso em CRUDs'
    );

    // Same keys must exist in en.json
    assert.ok(en.common && en.common.create, 'en.json deve conter common.create');
    assert.ok(en.common && en.common.edit, 'en.json deve conter common.edit');
    assert.ok(en.common && en.common.delete, 'en.json deve conter common.delete');
    assert.ok(en.common && en.common.save, 'en.json deve conter common.save');
    assert.ok(en.common && en.common.cancel, 'en.json deve conter common.cancel');
    assert.ok(en.common && en.common.actions, 'en.json deve conter common.actions');
    assert.ok(en.common && en.common.exportCsv, 'en.json deve conter common.exportCsv');
    assert.ok(en.common && en.common.exportPdf, 'en.json deve conter common.exportPdf');

    // Filter section must exist for advanced filter component
    assert.ok(
      ptBR.filter && typeof ptBR.filter === 'object',
      'pt-BR.json deve conter seção "filter" para filtros avançados'
    );
    assert.ok(
      en.filter && typeof en.filter === 'object',
      'en.json deve conter seção "filter" para filtros avançados'
    );

    // Property test: for any randomly generated entity name, the translation structure
    // should be extensible (the dashboard.entities object exists as a placeholder)
    const entityNameArb = fc.stringMatching(/^[a-z][a-zA-Z]{2,12}$/).filter(s => s.length >= 3);

    fc.assert(
      fc.property(entityNameArb, (entityName) => {
        // The dashboard.entities key must exist as an object (placeholder for entity stats)
        assert.ok(
          typeof ptBR.dashboard.entities === 'object',
          'pt-BR.json dashboard.entities deve ser um objeto extensível para entidades'
        );
        assert.ok(
          typeof en.dashboard.entities === 'object',
          'en.json dashboard.entities deve ser um objeto extensível para entidades'
        );

        // Verify that the common keys needed for any CRUD entity are string values
        assert.strictEqual(typeof ptBR.common.create, 'string', 'common.create deve ser string');
        assert.strictEqual(typeof ptBR.common.edit, 'string', 'common.edit deve ser string');
        assert.strictEqual(typeof ptBR.common.delete, 'string', 'common.delete deve ser string');
        assert.strictEqual(typeof en.common.create, 'string', 'common.create deve ser string');
        assert.strictEqual(typeof en.common.edit, 'string', 'common.edit deve ser string');
        assert.strictEqual(typeof en.common.delete, 'string', 'common.delete deve ser string');

        return true;
      }),
      { numRuns: 50 }
    );
  });

  // --- Req 22.3: LanguageSelector is included in AppHeader ---

  it('LanguageSelector deve estar incluído no AppHeader para ser acessível no header da aplicação', function () {
    this.timeout(30000);

    const baseComponentsDir = path.join(__dirname, '..', 'Utils', 'templates', 'base', 'frontend', 'src', 'components');
    const headerPath = path.join(baseComponentsDir, 'AppHeader.vue');
    assert.ok(
      fs.existsSync(headerPath),
      'AppHeader.vue deve existir'
    );

    const headerContent = fs.readFileSync(headerPath, 'utf-8');

    // AppHeader must import LanguageSelector
    assert.ok(
      /LanguageSelector/.test(headerContent),
      'AppHeader.vue deve referenciar LanguageSelector'
    );

    // AppHeader template must include <LanguageSelector /> component
    const headerTemplate = extractTemplate(headerContent);
    assert.ok(
      /<LanguageSelector\s*\/?>/.test(headerTemplate),
      'AppHeader.vue template deve incluir <LanguageSelector />'
    );
  });
});
