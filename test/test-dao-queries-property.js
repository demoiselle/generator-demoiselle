'use strict';

const assert = require('assert');
const fc = require('fast-check');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, '..', 'Utils', 'templates', 'backend', 'src', 'main', 'java', 'app', 'dao', '_pojoDAO.java');
const daoTemplate = fs.readFileSync(templatePath, 'utf-8');

/**
 * Supported Java types for property generation
 */
const JAVA_TYPES = ['String', 'Integer', 'Long', 'Date', 'LocalDate', 'Double', 'BigDecimal', 'boolean'];
const STRING_TYPES = ['String'];
const DATE_NUMBER_TYPES = ['Integer', 'Long', 'Date', 'LocalDate', 'Double', 'BigDecimal'];

function isStringType(type) {
  return /^string$/i.test(type);
}

function isDateOrNumberType(type) {
  return /^(date|localdate|localdatetime|integer|int|long|double|float|bigdecimal|number|short)$/i.test(type);
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Arbitrary for entity name (valid Java identifier, lowercase start)
 */
const entityNameArb = fc.stringMatching(/^[a-z][a-zA-Z]{2,12}$/).filter(s => s.length >= 3);

/**
 * Arbitrary for package name (Java package)
 */
const packageArb = fc.stringMatching(/^[a-z]{2,6}(\.[a-z]{2,6}){1,2}$/).map(lower => ({
  lower,
  capital: lower.split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('.')
}));

/**
 * Arbitrary for project name
 */
const projectArb = fc.stringMatching(/^[a-z][a-z0-9]{1,10}$/).map(lower => ({
  lower,
  capital: lower.charAt(0).toUpperCase() + lower.slice(1)
}));

/**
 * Arbitrary for a single Java property
 */
const propertyArb = fc.record({
  name: fc.stringMatching(/^[a-z][a-zA-Z]{1,10}$/).filter(n => n !== 'id' && n.length >= 2),
  type: fc.constantFrom(...JAVA_TYPES),
  isReadOnly: fc.boolean()
});

/**
 * Arbitrary for an array of properties with unique names, at least 1 property
 */
const propertiesArb = fc.array(propertyArb, { minLength: 1, maxLength: 6 })
  .map(props => {
    // Deduplicate by name
    const seen = new Set();
    return props.filter(p => {
      if (seen.has(p.name)) return false;
      seen.add(p.name);
      return true;
    });
  })
  .filter(props => props.length >= 1);

/**
 * Renders the DAO EJS template with given values
 */
function renderDao(entityName, pkg, project, properties) {
  const name = {
    lower: entityName.toLowerCase(),
    capital: capitalize(entityName)
  };
  return ejs.render(daoTemplate, {
    name,
    package: pkg,
    project,
    properties
  });
}

/**
 * **Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7**
 *
 * Property 10: Geração completa de queries DAO por tipo de campo
 *
 * For any valid entity name and random array of properties (with random types),
 * the generated DAO must:
 * - Contain findBy<Campo> for each non-readOnly property (Req 11.1)
 * - Contain findBy<Campo>Like ONLY for String properties (Req 11.2)
 * - Contain findBy<Campo>Between ONLY for Date/Number properties (Req 11.3)
 * - Contain findBy<Campo>In for each non-readOnly property (Req 11.4)
 * - Contain findBy<Campo1>And<Campo2> for combinations of eligible fields (Req 11.5)
 * - Contain countBy<Campo> for each non-readOnly property (Req 11.6)
 * - Contain existsBy<Campo> for each non-readOnly property (Req 11.7)
 */
describe('Property 10: Geração completa de queries DAO por tipo de campo', () => {

  it('DAO gerado deve conter todos os métodos de consulta corretos para qualquer entidade e propriedades válidas', function () {
    this.timeout(60000);

    fc.assert(
      fc.property(entityNameArb, packageArb, projectArb, propertiesArb, (entityName, pkg, project, properties) => {
        const dao = renderDao(entityName, pkg, project, properties);
        const capEntity = capitalize(entityName);

        const nonReadOnly = properties.filter(p => !p.isReadOnly);
        const readOnly = properties.filter(p => p.isReadOnly);

        // --- Req 11.1: findBy<Campo> for each non-readOnly property ---
        nonReadOnly.forEach(prop => {
          const capName = capitalize(prop.name);
          assert.ok(
            dao.includes(`findBy${capName}(`),
            `DAO deve conter findBy${capName} para propriedade não-readOnly '${prop.name}'`
          );
        });

        // readOnly properties should NOT have findBy
        readOnly.forEach(prop => {
          const capName = capitalize(prop.name);
          assert.ok(
            !dao.includes(`findBy${capName}(`),
            `DAO NÃO deve conter findBy${capName} para propriedade readOnly '${prop.name}'`
          );
        });

        // --- Req 11.2: findBy<Campo>Like ONLY for String properties ---
        nonReadOnly.forEach(prop => {
          const capName = capitalize(prop.name);
          if (isStringType(prop.type)) {
            assert.ok(
              dao.includes(`findBy${capName}Like(`),
              `DAO deve conter findBy${capName}Like para propriedade String '${prop.name}'`
            );
          } else {
            assert.ok(
              !dao.includes(`findBy${capName}Like(`),
              `DAO NÃO deve conter findBy${capName}Like para propriedade não-String '${prop.name}' (tipo: ${prop.type})`
            );
          }
        });

        // --- Req 11.3: findBy<Campo>Between ONLY for Date/Number properties ---
        nonReadOnly.forEach(prop => {
          const capName = capitalize(prop.name);
          if (isDateOrNumberType(prop.type)) {
            assert.ok(
              dao.includes(`findBy${capName}Between(`),
              `DAO deve conter findBy${capName}Between para propriedade Date/Number '${prop.name}' (tipo: ${prop.type})`
            );
          } else {
            assert.ok(
              !dao.includes(`findBy${capName}Between(`),
              `DAO NÃO deve conter findBy${capName}Between para propriedade não-Date/Number '${prop.name}' (tipo: ${prop.type})`
            );
          }
        });

        // --- Req 11.4: findBy<Campo>In for each non-readOnly property ---
        nonReadOnly.forEach(prop => {
          const capName = capitalize(prop.name);
          assert.ok(
            dao.includes(`findBy${capName}In(`),
            `DAO deve conter findBy${capName}In para propriedade não-readOnly '${prop.name}'`
          );
        });

        // --- Req 11.6: countBy<Campo> for each non-readOnly property ---
        nonReadOnly.forEach(prop => {
          const capName = capitalize(prop.name);
          assert.ok(
            dao.includes(`countBy${capName}(`),
            `DAO deve conter countBy${capName} para propriedade não-readOnly '${prop.name}'`
          );
        });

        // --- Req 11.7: existsBy<Campo> for each non-readOnly property ---
        nonReadOnly.forEach(prop => {
          const capName = capitalize(prop.name);
          assert.ok(
            dao.includes(`existsBy${capName}(`),
            `DAO deve conter existsBy${capName} para propriedade não-readOnly '${prop.name}'`
          );
        });

        // --- Req 11.5: findBy<Campo1>And<Campo2> for combinations of eligible fields ---
        // Eligible: non-readOnly AND non-id
        const eligible = nonReadOnly.filter(p => p.name !== 'id');
        for (let i = 0; i < eligible.length; i++) {
          for (let j = i + 1; j < eligible.length; j++) {
            const capName1 = capitalize(eligible[i].name);
            const capName2 = capitalize(eligible[j].name);
            assert.ok(
              dao.includes(`findBy${capName1}And${capName2}(`),
              `DAO deve conter findBy${capName1}And${capName2} para combinação de campos elegíveis '${eligible[i].name}' e '${eligible[j].name}'`
            );
          }
        }

        // Verify entity class name appears in the DAO
        assert.ok(
          dao.includes(`${capEntity}DAO`),
          `DAO deve conter o nome da classe ${capEntity}DAO`
        );

        // Verify package declaration
        assert.ok(
          dao.includes(`package ${pkg.lower}.${project.lower}.dao`),
          `DAO deve conter declaração de package correta`
        );
      }),
      { numRuns: 100 }
    );
  });
});
