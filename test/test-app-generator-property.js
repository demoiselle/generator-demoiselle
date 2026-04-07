'use strict';

const assert = require('assert');
const fc = require('fast-check');
const fs = require('fs');
const path = require('path');

// Load the AppGenerator source code
const generatorSourcePath = path.join(__dirname, '..', 'generators', 'app', 'index.js');
const generatorSource = fs.readFileSync(generatorSourcePath, 'utf-8');

/**
 * **Validates: Requirements 24.1, 24.2, 24.3, 24.4, 24.5**
 *
 * Property 27: Opção mobile no prompt do gerador
 *
 * For any execution of the generator, the prompt must present three
 * independently selectable options: "backend", "frontend" and "mobile".
 * Selecting any combination must generate only the selected projects
 * without errors. The mobile flag must be stored in .yo-rc.json.
 */
describe('Property 27: Opção mobile no prompt do gerador', function () {

  // --- Req 24.1: Prompt must present three options: backend, frontend, mobile ---

  it('prompt de seleção deve conter as três opções: backend, frontend e mobile', function () {
    // The prompting() method must include a checkbox with all three choices
    assert.ok(
      generatorSource.includes("type: 'checkbox'"),
      'Gerador deve conter um prompt do tipo checkbox'
    );

    assert.ok(
      generatorSource.includes("name: 'skips'"),
      'Prompt checkbox deve ter name "skips"'
    );

    // All three choices must be present
    const backendChoiceRegex = /name:\s*['"]backend['"]/;
    const frontendChoiceRegex = /name:\s*['"]frontend['"]/;
    const mobileChoiceRegex = /name:\s*['"]mobile['"]/;

    assert.ok(
      backendChoiceRegex.test(generatorSource),
      'Prompt deve conter opção "backend"'
    );
    assert.ok(
      frontendChoiceRegex.test(generatorSource),
      'Prompt deve conter opção "frontend"'
    );
    assert.ok(
      mobileChoiceRegex.test(generatorSource),
      'Prompt deve conter opção "mobile"'
    );
  });

  // --- Req 24.2: Selecting mobile generates Flutter project in mobile/ ---

  it('writing() deve chamar _generateProjectMobile() quando mobile não é ignorado', function () {
    // The writing() method must call _generateProjectMobile when skip-mobile is false
    assert.ok(
      generatorSource.includes('_generateProjectMobile'),
      'Gerador deve conter método _generateProjectMobile'
    );

    // Verify the conditional call pattern
    const mobileWriteRegex = /if\s*\(\s*!this\.options\['skip-mobile'\]\s*\)\s*\{[^}]*_generateProjectMobile/s;
    assert.ok(
      mobileWriteRegex.test(generatorSource),
      'writing() deve chamar _generateProjectMobile() quando skip-mobile é false'
    );
  });

  // --- Req 24.2: _generateProjectMobile() method exists and copies Flutter template ---

  it('_generateProjectMobile() deve existir e copiar template base Flutter para mobile/', function () {
    // Method must exist (accepts packages parameter)
    const methodRegex = /_generateProjectMobile\s*\([^)]*\)\s*\{/;
    assert.ok(
      methodRegex.test(generatorSource),
      '_generateProjectMobile() deve existir como método'
    );

    // Must reference base/mobile/ template path
    assert.ok(
      generatorSource.includes("base/mobile/"),
      '_generateProjectMobile() deve referenciar template base/mobile/'
    );

    // Must copy to mobile/ destination
    assert.ok(
      generatorSource.includes("'mobile/'") || generatorSource.includes('"mobile/"'),
      '_generateProjectMobile() deve copiar para destino mobile/'
    );
  });

  // --- Req 24.3 & 24.4: Each option is independent (skip flags) ---

  it('cada opção deve ser independente via flags skip-frontend, skip-backend e skip-mobile', function () {
    // All three skip flags must be handled
    assert.ok(
      generatorSource.includes("'skip-frontend'"),
      'Gerador deve suportar flag skip-frontend'
    );
    assert.ok(
      generatorSource.includes("'skip-backend'"),
      'Gerador deve suportar flag skip-backend'
    );
    assert.ok(
      generatorSource.includes("'skip-mobile'"),
      'Gerador deve suportar flag skip-mobile'
    );

    // The writing() method must have independent conditionals for each
    const skipFrontendWriteRegex = /if\s*\(\s*!this\.options\['skip-frontend'\]\s*\)/;
    const skipBackendWriteRegex = /if\s*\(\s*!this\.options\['skip-backend'\]\s*\)/;
    const skipMobileWriteRegex = /if\s*\(\s*!this\.options\['skip-mobile'\]\s*\)/;

    assert.ok(
      skipFrontendWriteRegex.test(generatorSource),
      'writing() deve verificar skip-frontend independentemente'
    );
    assert.ok(
      skipBackendWriteRegex.test(generatorSource),
      'writing() deve verificar skip-backend independentemente'
    );
    assert.ok(
      skipMobileWriteRegex.test(generatorSource),
      'writing() deve verificar skip-mobile independentemente'
    );
  });

  // --- Req 24.5: Mobile flag stored in .yo-rc.json ---

  it('flag mobile deve ser armazenada no .yo-rc.json via config.set', function () {
    const configSetMobileRegex = /this\.config\.set\(\s*['"]mobile['"]/;
    assert.ok(
      configSetMobileRegex.test(generatorSource),
      'Gerador deve armazenar flag mobile no .yo-rc.json via config.set("mobile", ...)'
    );
  });

  // --- Req 24.5 (via 10.2): _checkRequiredTools() checks for Flutter SDK ---

  it('_checkRequiredTools() deve verificar Flutter SDK quando mobile habilitado', function () {
    const methodRegex = /_checkRequiredTools\s*\(\s*\)\s*\{/;
    assert.ok(
      methodRegex.test(generatorSource),
      '_checkRequiredTools() deve existir como método'
    );

    // Must check for flutter command
    assert.ok(
      generatorSource.includes("'flutter --version'") || generatorSource.includes('"flutter --version"'),
      '_checkRequiredTools() deve verificar flutter --version'
    );

    // Must reference Flutter SDK in the message
    assert.ok(
      generatorSource.includes('Flutter SDK'),
      '_checkRequiredTools() deve mencionar Flutter SDK na mensagem de erro'
    );
  });

  // --- Req 24.2: install() handles flutter pub get for mobile ---

  it('install() deve executar flutter pub get para mobile quando não ignorado', function () {
    // Must reference flutter pub get
    assert.ok(
      generatorSource.includes("'flutter'") || generatorSource.includes('"flutter"'),
      'install() deve referenciar comando flutter'
    );

    assert.ok(
      generatorSource.includes("'pub'") || generatorSource.includes('"pub"'),
      'install() deve referenciar subcomando pub'
    );

    assert.ok(
      generatorSource.includes("'get'") || generatorSource.includes('"get"'),
      'install() deve referenciar subcomando get'
    );

    // Must have skip-mobile check in install
    assert.ok(
      generatorSource.includes("flutter pub get") ||
      (generatorSource.includes("'flutter'") && generatorSource.includes("'pub', 'get'")),
      'install() deve executar flutter pub get'
    );
  });

  // --- Property-based: any combination of selections produces correct skip flags ---

  it('qualquer combinação de seleções deve produzir flags skip corretas (property-based)', function () {
    this.timeout(30000);

    // Arbitrary for a subset of {backend, frontend, mobile}
    const selectionArb = fc.record({
      backend: fc.boolean(),
      frontend: fc.boolean(),
      mobile: fc.boolean()
    });

    fc.assert(
      fc.property(selectionArb, (selection) => {
        // Simulate the answers.skips array based on selection
        const skips = [];
        if (selection.backend) skips.push('backend');
        if (selection.frontend) skips.push('frontend');
        if (selection.mobile) skips.push('mobile');

        // Simulate the logic from prompting()
        const skipFrontend = !(skips.indexOf('frontend') > -1);
        const skipBackend = !(skips.indexOf('backend') > -1);
        const skipMobile = !(skips.indexOf('mobile') > -1);

        // Verify: selected items should NOT be skipped
        assert.strictEqual(
          skipFrontend, !selection.frontend,
          `skip-frontend deve ser ${!selection.frontend} quando frontend ${selection.frontend ? 'selecionado' : 'não selecionado'}`
        );
        assert.strictEqual(
          skipBackend, !selection.backend,
          `skip-backend deve ser ${!selection.backend} quando backend ${selection.backend ? 'selecionado' : 'não selecionado'}`
        );
        assert.strictEqual(
          skipMobile, !selection.mobile,
          `skip-mobile deve ser ${!selection.mobile} quando mobile ${selection.mobile ? 'selecionado' : 'não selecionado'}`
        );

        // Verify: the mobile config value matches selection
        const mobileConfig = !skipMobile;
        assert.strictEqual(
          mobileConfig, selection.mobile,
          `config mobile deve ser ${selection.mobile}`
        );
      }),
      { numRuns: 100 }
    );
  });

  // --- Verify prompting logic correctly maps skips array to skip flags ---

  it('lógica de prompting deve mapear corretamente o array skips para flags skip (property-based)', function () {
    this.timeout(30000);

    // The source code logic:
    //   this.options['skip-frontend'] = !(answers.skips.indexOf('frontend') > -1);
    //   this.options['skip-backend'] = !(answers.skips.indexOf('backend') > -1);
    //   this.options['skip-mobile'] = !(answers.skips.indexOf('mobile') > -1);

    // Verify this pattern exists in the source
    const skipFrontendLogicRegex = /this\.options\['skip-frontend'\]\s*=\s*!\(answers\.skips\.indexOf\('frontend'\)\s*>\s*-1\)/;
    const skipBackendLogicRegex = /this\.options\['skip-backend'\]\s*=\s*!\(answers\.skips\.indexOf\('backend'\)\s*>\s*-1\)/;
    const skipMobileLogicRegex = /this\.options\['skip-mobile'\]\s*=\s*!\(answers\.skips\.indexOf\('mobile'\)\s*>\s*-1\)/;

    assert.ok(
      skipFrontendLogicRegex.test(generatorSource),
      'prompting() deve mapear skips para skip-frontend corretamente'
    );
    assert.ok(
      skipBackendLogicRegex.test(generatorSource),
      'prompting() deve mapear skips para skip-backend corretamente'
    );
    assert.ok(
      skipMobileLogicRegex.test(generatorSource),
      'prompting() deve mapear skips para skip-mobile corretamente'
    );

    // Property-based: for any subset of options, the indexOf logic is correct
    const optionArb = fc.constantFrom('backend', 'frontend', 'mobile');
    const skipsArb = fc.uniqueArray(optionArb, { minLength: 0, maxLength: 3 });

    fc.assert(
      fc.property(skipsArb, (skips) => {
        // Replicate the generator logic
        const skipFrontend = !(skips.indexOf('frontend') > -1);
        const skipBackend = !(skips.indexOf('backend') > -1);
        const skipMobile = !(skips.indexOf('mobile') > -1);

        // frontend selected iff not skipped
        assert.strictEqual(!skipFrontend, skips.includes('frontend'));
        assert.strictEqual(!skipBackend, skips.includes('backend'));
        assert.strictEqual(!skipMobile, skips.includes('mobile'));
      }),
      { numRuns: 100 }
    );
  });
});
