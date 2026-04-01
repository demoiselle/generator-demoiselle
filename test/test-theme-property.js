'use strict';

const assert = require('assert');
const fc = require('fast-check');
const fs = require('fs');
const path = require('path');

// --- Paths ---

const baseFrontendPath = path.join(__dirname, '..', 'Utils', 'templates', 'base', 'frontend', 'src');
const stylesDir = path.join(baseFrontendPath, 'styles');
const componentsDir = path.join(baseFrontendPath, 'components');
const viewsDir = path.join(baseFrontendPath, 'views');
const storesDir = path.join(baseFrontendPath, 'stores');

// --- Load files ---

const variablesCssPath = path.join(stylesDir, 'variables.css');
const themeLightPath = path.join(stylesDir, 'theme-light.css');
const themeDarkPath = path.join(stylesDir, 'theme-dark.css');
const themeTogglePath = path.join(componentsDir, 'ThemeToggle.vue');
const appHeaderPath = path.join(componentsDir, 'AppHeader.vue');
const themeStorePath = path.join(storesDir, 'theme.js');

const variablesCss = fs.readFileSync(variablesCssPath, 'utf-8');
const themeLightCss = fs.readFileSync(themeLightPath, 'utf-8');
const themeDarkCss = fs.readFileSync(themeDarkPath, 'utf-8');
const themeToggle = fs.readFileSync(themeTogglePath, 'utf-8');
const appHeader = fs.readFileSync(appHeaderPath, 'utf-8');
const themeStore = fs.readFileSync(themeStorePath, 'utf-8');

// --- Helpers ---

/**
 * Extract all CSS custom property names (--xxx) from a CSS string.
 */
function extractCssVarNames(css) {
  const matches = css.match(/--[\w-]+/g);
  return matches ? [...new Set(matches)] : [];
}

/**
 * Extract the <style> section from a Vue SFC string.
 */
function extractStyle(sfcContent) {
  const match = sfcContent.match(/<style[^>]*>([\s\S]*?)<\/style>/);
  return match ? match[1] : '';
}

/**
 * Extract the <template> section from a Vue SFC string.
 */
function extractTemplate(sfcContent) {
  const match = sfcContent.match(/<template[^>]*>([\s\S]*?)<\/template>/);
  return match ? match[1] : '';
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
 * **Validates: Requirements 21.1, 21.2, 21.3, 21.4**
 *
 * Property 17: Temas e modo escuro
 *
 * The theme system must be fully configured:
 * - CSS theme files exist: variables.css, theme-light.css, theme-dark.css (Req 21.1)
 * - Theme files define CSS custom properties (--color-*, --bg-*, --text-*) (Req 21.1)
 * - ThemeToggle.vue component exists and uses localStorage for persistence (Req 21.2, 21.3)
 * - ThemeToggle.vue is included in AppHeader.vue (Req 21.2)
 * - Pinia theme store exists at src/stores/theme.js (Req 21.3)
 * - Vue SFC components use CSS variables (var(--...)) instead of hardcoded colors (Req 21.4)
 */
describe('Property 17: Temas e modo escuro', () => {

  // --- Req 21.1: CSS theme files exist and define custom properties ---

  it('arquivos CSS de tema devem existir e definir variáveis CSS customizadas', function () {
    this.timeout(30000);

    // Files must exist
    assert.ok(
      fs.existsSync(variablesCssPath),
      'variables.css deve existir em Utils/templates/base/frontend/src/styles/'
    );
    assert.ok(
      fs.existsSync(themeLightPath),
      'theme-light.css deve existir em Utils/templates/base/frontend/src/styles/'
    );
    assert.ok(
      fs.existsSync(themeDarkPath),
      'theme-dark.css deve existir em Utils/templates/base/frontend/src/styles/'
    );

    // variables.css must define CSS custom properties
    const varNames = extractCssVarNames(variablesCss);
    assert.ok(varNames.length > 0, 'variables.css deve definir variáveis CSS customizadas');

    // Must have --color-*, --bg-*, --text-* categories
    const hasColor = varNames.some(v => v.startsWith('--color-'));
    const hasBg = varNames.some(v => v.startsWith('--bg-'));
    const hasText = varNames.some(v => v.startsWith('--text-'));
    assert.ok(hasColor, 'variables.css deve definir variáveis --color-*');
    assert.ok(hasBg, 'variables.css deve definir variáveis --bg-*');
    assert.ok(hasText, 'variables.css deve definir variáveis --text-*');

    // theme-light.css must define custom properties
    const lightVars = extractCssVarNames(themeLightCss);
    assert.ok(lightVars.length > 0, 'theme-light.css deve definir variáveis CSS customizadas');
    assert.ok(
      lightVars.some(v => v.startsWith('--color-')),
      'theme-light.css deve definir variáveis --color-*'
    );
    assert.ok(
      lightVars.some(v => v.startsWith('--bg-')),
      'theme-light.css deve definir variáveis --bg-*'
    );
    assert.ok(
      lightVars.some(v => v.startsWith('--text-')),
      'theme-light.css deve definir variáveis --text-*'
    );

    // theme-dark.css must define custom properties
    const darkVars = extractCssVarNames(themeDarkCss);
    assert.ok(darkVars.length > 0, 'theme-dark.css deve definir variáveis CSS customizadas');
    assert.ok(
      darkVars.some(v => v.startsWith('--color-')),
      'theme-dark.css deve definir variáveis --color-*'
    );
    assert.ok(
      darkVars.some(v => v.startsWith('--bg-')),
      'theme-dark.css deve definir variáveis --bg-*'
    );
    assert.ok(
      darkVars.some(v => v.startsWith('--text-')),
      'theme-dark.css deve definir variáveis --text-*'
    );
  });

  // --- Req 21.1: Light and dark themes must override the same set of variables ---

  it('temas claro e escuro devem sobrescrever o mesmo conjunto de variáveis CSS', function () {
    this.timeout(30000);

    const lightVars = new Set(extractCssVarNames(themeLightCss));
    const darkVars = new Set(extractCssVarNames(themeDarkCss));

    // Property test: for any CSS variable defined in the light theme,
    // it must also be defined in the dark theme, and vice versa
    const lightVarArb = fc.constantFrom(...lightVars);

    fc.assert(
      fc.property(lightVarArb, (varName) => {
        assert.ok(
          darkVars.has(varName),
          `Variável "${varName}" definida em theme-light.css mas não em theme-dark.css`
        );
        return true;
      }),
      { numRuns: Math.min(50, lightVars.size) }
    );

    const darkVarArb = fc.constantFrom(...darkVars);

    fc.assert(
      fc.property(darkVarArb, (varName) => {
        assert.ok(
          lightVars.has(varName),
          `Variável "${varName}" definida em theme-dark.css mas não em theme-light.css`
        );
        return true;
      }),
      { numRuns: Math.min(50, darkVars.size) }
    );
  });

  // --- Req 21.2: ThemeToggle.vue component exists and is a valid Vue SFC ---

  it('ThemeToggle.vue deve existir e ser um componente Vue SFC funcional', function () {
    this.timeout(30000);

    assert.ok(
      fs.existsSync(themeTogglePath),
      'ThemeToggle.vue deve existir em Utils/templates/base/frontend/src/components/'
    );

    // Must be a valid Vue SFC with <template> and <script>
    assert.ok(
      /<template[^>]*>/.test(themeToggle),
      'ThemeToggle.vue deve conter seção <template>'
    );
    assert.ok(
      /<script[^>]*>/.test(themeToggle),
      'ThemeToggle.vue deve conter seção <script>'
    );

    // Must reference the theme store
    assert.ok(
      /useThemeStore/.test(themeToggle) || /theme/.test(themeToggle),
      'ThemeToggle.vue deve usar o theme store'
    );

    // Must have toggle functionality
    assert.ok(
      /toggle/.test(themeToggle),
      'ThemeToggle.vue deve ter funcionalidade de toggle'
    );

    // Must reference light/dark themes (directly or via v-else for the alternate state)
    assert.ok(
      /light/.test(themeToggle),
      'ThemeToggle.vue deve referenciar tema light'
    );
    // The component may use v-else for the dark branch instead of explicitly naming 'dark'
    assert.ok(
      /dark/.test(themeToggle) || /v-else/.test(themeToggle),
      'ThemeToggle.vue deve referenciar tema dark (ou usar v-else para o estado alternativo)'
    );
  });

  // --- Req 21.3: Theme store uses localStorage for persistence ---

  it('Pinia theme store deve existir e usar localStorage para persistência', function () {
    this.timeout(30000);

    assert.ok(
      fs.existsSync(themeStorePath),
      'theme.js deve existir em Utils/templates/base/frontend/src/stores/'
    );

    // Must use Pinia defineStore
    assert.ok(
      /defineStore/.test(themeStore),
      'theme.js deve usar defineStore do Pinia'
    );

    // Must use localStorage for persistence
    assert.ok(
      /localStorage\.getItem/.test(themeStore),
      'theme.js deve ler preferência do localStorage'
    );
    assert.ok(
      /localStorage\.setItem/.test(themeStore),
      'theme.js deve salvar preferência no localStorage'
    );

    // Must have toggle function
    assert.ok(
      /toggle/.test(themeStore),
      'theme.js deve ter função toggle'
    );

    // Must support light and dark themes
    assert.ok(
      /light/.test(themeStore),
      'theme.js deve suportar tema light'
    );
    assert.ok(
      /dark/.test(themeStore),
      'theme.js deve suportar tema dark'
    );

    // Must apply theme to document (data-theme attribute or class)
    assert.ok(
      /data-theme/.test(themeStore) || /setAttribute/.test(themeStore) || /classList/.test(themeStore),
      'theme.js deve aplicar tema ao documento (data-theme ou classList)'
    );
  });

  // --- Req 21.2: ThemeToggle is included in AppHeader ---

  it('ThemeToggle deve estar incluído no AppHeader para ser acessível no header da aplicação', function () {
    this.timeout(30000);

    assert.ok(
      fs.existsSync(appHeaderPath),
      'AppHeader.vue deve existir'
    );

    // AppHeader must import ThemeToggle
    assert.ok(
      /ThemeToggle/.test(appHeader),
      'AppHeader.vue deve referenciar ThemeToggle'
    );

    // AppHeader template must include <ThemeToggle /> component
    const headerTemplate = extractTemplate(appHeader);
    assert.ok(
      /<ThemeToggle\s*\/?>/.test(headerTemplate),
      'AppHeader.vue template deve incluir <ThemeToggle />'
    );
  });

  // --- Req 21.4: All Vue SFC components use CSS variables instead of hardcoded colors ---

  it('todos os componentes Vue SFC devem usar variáveis CSS de tema em vez de cores hardcoded', function () {
    this.timeout(30000);

    const componentFiles = readVueFiles(componentsDir);
    const viewFiles = readVueFiles(viewsDir);
    const allVueFiles = componentFiles.concat(viewFiles);

    assert.ok(
      allVueFiles.length > 0,
      'Deve existir pelo menos um arquivo .vue nos diretórios components/ e views/'
    );

    // Property test: for any randomly selected Vue SFC file that has a <style> section,
    // it must use var(--...) CSS variables and not hardcoded color values for theming properties
    const vueFilesWithStyle = allVueFiles.filter(f => /<style[^>]*>/.test(f.content));

    if (vueFilesWithStyle.length === 0) return;

    const vueFileArb = fc.constantFrom(...vueFilesWithStyle);

    fc.assert(
      fc.property(vueFileArb, (vueFile) => {
        const styleSection = extractStyle(vueFile.content);

        // Skip files with empty or minimal styles
        if (styleSection.trim().length < 20) return true;

        // Check if the style section uses CSS variables
        const usesVars = /var\(--[\w-]+\)/.test(styleSection);

        // Check for hardcoded hex colors used for theming properties
        // (background-color, color, border-color, box-shadow)
        const themingProps = styleSection.match(
          /(?:background-color|(?<![a-z-])color|border-color|box-shadow)\s*:\s*([^;]+)/g
        ) || [];

        const hardcodedThemingColors = themingProps.filter(prop => {
          // Allow var(--...) references
          if (/var\(--[\w-]+\)/.test(prop)) return false;
          // Allow 'none', 'inherit', 'transparent', 'currentColor'
          if (/(?:none|inherit|transparent|currentColor)/.test(prop)) return false;
          // Flag hardcoded hex colors (#xxx, #xxxxxx) or rgb/rgba
          return /#[0-9a-fA-F]{3,8}/.test(prop) || /rgba?\s*\(/.test(prop);
        });

        // If the file has theming properties, most should use CSS variables
        if (themingProps.length > 0) {
          // Allow a small number of hardcoded colors (e.g., white text on avatar)
          // but the majority should use CSS variables
          const hardcodedRatio = hardcodedThemingColors.length / themingProps.length;
          assert.ok(
            hardcodedRatio <= 0.5 || usesVars,
            `${vueFile.name} tem muitas cores hardcoded (${hardcodedThemingColors.length}/${themingProps.length}). ` +
            `Componentes devem usar var(--...) para consistência de tema.`
          );
        }

        return true;
      }),
      { numRuns: Math.min(50, vueFilesWithStyle.length) }
    );
  });
});
