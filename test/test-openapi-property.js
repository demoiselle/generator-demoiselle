'use strict';

const assert = require('assert');
const fc = require('fast-check');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

// Load REST EJS template
const restTemplatePath = path.join(__dirname, '..', 'Utils', 'templates', 'backend', 'src', 'main', 'java', 'app', 'service', '_pojoREST.java');
const restTemplate = fs.readFileSync(restTemplatePath, 'utf-8');

// --- Arbitraries ---

const JAVA_TYPES = ['String', 'Integer', 'Long', 'Date', 'LocalDate', 'Double', 'BigDecimal', 'boolean'];

const entityNameArb = fc.stringMatching(/^[a-z][a-zA-Z]{2,12}$/).filter(s => s.length >= 3);

const packageArb = fc.stringMatching(/^[a-z]{2,6}(\.[a-z]{2,6}){1,2}$/).map(lower => ({
  lower,
  capital: lower.split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('.')
}));

const projectArb = fc.stringMatching(/^[a-z][a-z0-9]{1,10}$/).map(lower => ({
  lower,
  capital: lower.charAt(0).toUpperCase() + lower.slice(1)
}));

const propertyArb = fc.record({
  name: fc.stringMatching(/^[a-z][a-zA-Z]{1,10}$/).filter(n => n !== 'id' && n.length >= 2),
  type: fc.constantFrom(...JAVA_TYPES),
  isReadOnly: fc.boolean()
});

const propertiesArb = fc.array(propertyArb, { minLength: 1, maxLength: 5 })
  .map(props => {
    const seen = new Set();
    return props.filter(p => {
      if (seen.has(p.name)) return false;
      seen.add(p.name);
      return true;
    });
  })
  .filter(props => props.length >= 1);

// --- Helpers ---

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function renderRest(entityName, pkg, project, properties) {
  return ejs.render(restTemplate, {
    name: {
      lower: entityName.toLowerCase(),
      capital: capitalize(entityName)
    },
    package: pkg,
    project,
    properties
  });
}

/**
 * **Validates: Requirements 2.6**
 *
 * Property 4: Anotações OpenAPI 3.0 nos REST services
 *
 * For any valid entity name, package, project, and properties, the generated
 * REST service must:
 * - Contain imports from org.eclipse.microprofile.openapi.annotations
 * - NOT contain imports from io.swagger.annotations
 * - Contain @Tag annotation (replaces @Api)
 * - Contain @Operation annotation (replaces @ApiOperation)
 * - NOT contain @Api( annotation
 * - NOT contain @ApiImplicitParam annotation
 * - NOT contain @ApiOperation annotation
 */
describe('Property 4: Anotações OpenAPI 3.0 nos REST services', () => {

  it('REST service deve usar anotações OpenAPI 3.0 (MicroProfile) em vez de Swagger 1.x para qualquer entidade válida', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(entityNameArb, packageArb, projectArb, propertiesArb, (entityName, pkg, project, properties) => {
        const rest = renderRest(entityName, pkg, project, properties);

        // 1. Must contain MicroProfile OpenAPI imports
        assert.ok(
          rest.includes('org.eclipse.microprofile.openapi.annotations'),
          'REST deve conter imports de org.eclipse.microprofile.openapi.annotations'
        );

        // 2. Must NOT contain Swagger 1.x imports
        assert.ok(
          !rest.includes('io.swagger.annotations'),
          'REST NÃO deve conter imports de io.swagger.annotations'
        );

        // 3. Must contain @Tag annotation (replaces @Api)
        assert.ok(
          /@Tag\s*\(/.test(rest),
          'REST deve conter anotação @Tag (substitui @Api do Swagger)'
        );

        // 4. Must contain @Operation annotation (replaces @ApiOperation)
        assert.ok(
          /@Operation\s*\(/.test(rest),
          'REST deve conter anotação @Operation (substitui @ApiOperation do Swagger)'
        );

        // 5. Must NOT contain old Swagger annotations
        assert.ok(
          !/@Api\s*\(/.test(rest) || /@Api\s*\(/.test(rest) && /@Tag/.test(rest) && !rest.includes('io.swagger'),
          'REST NÃO deve conter @Api( do Swagger 1.x'
        );

        // More precise check: @Api( without being part of @ApiOperation or other
        const hasOldApi = /(?<![\w])@Api\s*\(/.test(rest) && !/@Tag/.test(rest);
        assert.ok(
          !hasOldApi,
          'REST NÃO deve conter @Api( do Swagger 1.x sem @Tag'
        );

        assert.ok(
          !/@ApiImplicitParam/.test(rest),
          'REST NÃO deve conter @ApiImplicitParam do Swagger 1.x'
        );

        assert.ok(
          !/@ApiOperation/.test(rest),
          'REST NÃO deve conter @ApiOperation do Swagger 1.x'
        );
      }),
      { numRuns: 100 }
    );
  });
});
