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
 * Extracts all method signatures that return List<Entity> from the DAO source.
 * Returns an array of { methodName, signatureLine, bodyText } objects.
 */
function extractListMethods(daoSource, entityCapital) {
  const methods = [];
  const returnType = `List<${entityCapital}>`;

  // Match method signatures: public List<Entity> methodName(params) {
  const methodRegex = new RegExp(
    `public\\s+${returnType.replace(/[<>]/g, '\\$&')}\\s+(\\w+)\\s*\\(([^)]*)\\)\\s*\\{`,
    'g'
  );

  let match;
  while ((match = methodRegex.exec(daoSource)) !== null) {
    const methodName = match[1];
    const params = match[2];
    const startIdx = match.index;

    // Find the matching closing brace for this method body
    let braceCount = 0;
    let bodyStart = daoSource.indexOf('{', startIdx);
    let bodyEnd = bodyStart;
    for (let i = bodyStart; i < daoSource.length; i++) {
      if (daoSource[i] === '{') braceCount++;
      if (daoSource[i] === '}') braceCount--;
      if (braceCount === 0) {
        bodyEnd = i;
        break;
      }
    }

    const bodyText = daoSource.substring(bodyStart, bodyEnd + 1);

    methods.push({
      methodName,
      params,
      bodyText
    });
  }

  return methods;
}

/**
 * **Validates: Requirements 11.8**
 *
 * Property 11: Paginação e ordenação nos métodos de consulta DAO
 *
 * For any valid entity name and random array of properties (with random types),
 * every method in the generated DAO that returns List<Entity> must:
 * - Include pagination parameters: int page, int size
 * - Include ordering parameters: String sortField, String sortDirection
 * - Use setFirstResult and setMaxResults in the method body
 * - Include ORDER BY logic with sortField/sortDirection
 */
describe('Property 11: Paginação e ordenação nos métodos de consulta DAO', () => {

  it('Todos os métodos que retornam List devem incluir paginação e ordenação', function () {
    this.timeout(60000);

    fc.assert(
      fc.property(entityNameArb, packageArb, projectArb, propertiesArb, (entityName, pkg, project, properties) => {
        const dao = renderDao(entityName, pkg, project, properties);
        const capEntity = capitalize(entityName);

        const listMethods = extractListMethods(dao, capEntity);

        // There should be at least some list-returning methods if there are non-readOnly properties
        const nonReadOnly = properties.filter(p => !p.isReadOnly);
        if (nonReadOnly.length > 0) {
          assert.ok(
            listMethods.length > 0,
            `DAO deve conter pelo menos um método que retorna List<${capEntity}> quando há propriedades não-readOnly`
          );
        }

        // For each list-returning method, verify pagination and ordering
        listMethods.forEach(method => {
          // --- Pagination parameters ---
          assert.ok(
            method.params.includes('int page'),
            `Método ${method.methodName} deve incluir parâmetro 'int page'. Params: ${method.params}`
          );
          assert.ok(
            method.params.includes('int size'),
            `Método ${method.methodName} deve incluir parâmetro 'int size'. Params: ${method.params}`
          );

          // --- Ordering parameters ---
          assert.ok(
            method.params.includes('String sortField'),
            `Método ${method.methodName} deve incluir parâmetro 'String sortField'. Params: ${method.params}`
          );
          assert.ok(
            method.params.includes('String sortDirection'),
            `Método ${method.methodName} deve incluir parâmetro 'String sortDirection'. Params: ${method.params}`
          );

          // --- setFirstResult and setMaxResults in body ---
          assert.ok(
            method.bodyText.includes('setFirstResult'),
            `Método ${method.methodName} deve usar setFirstResult no corpo do método`
          );
          assert.ok(
            method.bodyText.includes('setMaxResults'),
            `Método ${method.methodName} deve usar setMaxResults no corpo do método`
          );

          // --- ORDER BY logic with sortField/sortDirection ---
          assert.ok(
            method.bodyText.includes('ORDER BY') || method.bodyText.includes('order by') || method.bodyText.includes('Order by'),
            `Método ${method.methodName} deve incluir lógica ORDER BY no corpo do método`
          );
          assert.ok(
            method.bodyText.includes('sortField'),
            `Método ${method.methodName} deve referenciar sortField na lógica de ordenação`
          );
          assert.ok(
            method.bodyText.includes('sortDirection') || method.bodyText.includes('DESC'),
            `Método ${method.methodName} deve referenciar sortDirection na lógica de ordenação`
          );
        });
      }),
      { numRuns: 100 }
    );
  });
});
