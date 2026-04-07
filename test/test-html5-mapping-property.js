'use strict';

const assert = require('assert');
const fc = require('fast-check');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

// --- Load EJS template ---

const templateDir = path.join(__dirname, '..', 'Utils', 'templates', 'frontend', 'entity');
const formTemplatePath = path.join(templateDir, '_entityForm.vue');
const formTemplate = fs.readFileSync(formTemplatePath, 'utf-8');

// --- Arbitraries ---

const entityNameArb = fc.stringMatching(/^[a-z][a-zA-Z]{2,12}$/).filter(s => s.length >= 3);

const fieldNameArb = fc.stringMatching(/^[a-z][a-zA-Z]{1,10}$/).filter(n =>
  n !== 'id' && n.length >= 2 && !/email/i.test(n) && !/pass/i.test(n)
);

const emailFieldNameArb = fc.constantFrom('email', 'userEmail', 'emailAddress', 'contactEmail', 'myEmail');

const passwordFieldNameArb = fc.constantFrom('pass', 'password', 'userPass', 'passCode', 'myPassword');

// --- Helpers ---

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function buildTemplateData(entityName, properties) {
  return {
    name: {
      lower: entityName.toLowerCase(),
      capital: capitalize(entityName)
    },
    properties,
    hasCustomEntity: properties.some(p => !p.isPrimitive),
    packages: ['i18n']
  };
}

function renderForm(entityName, properties) {
  return ejs.render(formTemplate, buildTemplateData(entityName, properties));
}

function extractTemplate(sfcContent) {
  const match = sfcContent.match(/<template[^>]*>([\s\S]*?)<\/template>/);
  return match ? match[1] : '';
}

function extractScript(sfcContent) {
  const match = sfcContent.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  return match ? match[1] : '';
}

function makeProp(name, type, isPrimitive, isReadOnly) {
  return { name, type, isPrimitive: isPrimitive !== false, isReadOnly: isReadOnly || false };
}


/**
 * **Validates: Requirements 5.2, 5.3**
 *
 * Property 8: Mapeamento de tipos Java para inputs HTML5
 *
 * For any valid entity name and property, the _entityForm.vue EJS template must:
 * - Map String → type="text"
 * - Map String (name contains "email") → type="email"
 * - Map String (name contains "pass") → type="password"
 * - Map Date, LocalDate, LocalDateTime → type="date"
 * - Map Integer, Long, Double, BigDecimal, Float, Short → type="number"
 * - Map boolean → type="checkbox"
 * - Map non-primitive types (relationships) → <select> element with dropdown options
 */
describe('Property 8: Mapeamento de tipos Java para inputs HTML5', () => {

  // --- String → type="text" ---

  it('String deve gerar input type="text" para qualquer nome de campo sem "email" ou "pass"', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(entityNameArb, fieldNameArb, (entityName, fieldName) => {
        const props = [makeProp(fieldName, 'String', true)];
        const form = renderForm(entityName, props);
        const template = extractTemplate(form);

        assert.ok(
          template.includes(`v-model="entity.${fieldName}"`),
          `Template deve conter v-model="entity.${fieldName}"`
        );
        // Must have type="text" associated with this field
        const fieldSection = template.split(fieldName).join('__FIELD__');
        assert.ok(
          template.includes('type="text"') && template.includes(`v-model="entity.${fieldName}"`),
          `String field "${fieldName}" deve gerar input type="text"`
        );
        // Must NOT be checkbox, date, number, email, password, or select for a plain String
        assert.ok(
          !new RegExp(`type="(checkbox|date|number|email|password)"[\\s\\S]*?v-model="entity\\.${fieldName}"`).test(template) &&
          !new RegExp(`v-model="entity\\.${fieldName}"[\\s\\S]*?type="(checkbox|date|number|email|password)"`).test(template),
          `String field "${fieldName}" NÃO deve gerar input de tipo especial`
        );
        assert.ok(
          !template.includes(`${fieldName}Options`),
          `String field "${fieldName}" NÃO deve gerar select/options`
        );
      }),
      { numRuns: 100 }
    );
  });

  // --- String (name contains "email") → type="email" ---

  it('String com nome contendo "email" deve gerar input type="email"', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(entityNameArb, emailFieldNameArb, (entityName, fieldName) => {
        const props = [makeProp(fieldName, 'String', true)];
        const form = renderForm(entityName, props);
        const template = extractTemplate(form);

        assert.ok(
          template.includes(`v-model="entity.${fieldName}"`),
          `Template deve conter v-model="entity.${fieldName}"`
        );
        assert.ok(
          template.includes('type="email"'),
          `Email field "${fieldName}" deve gerar input type="email"`
        );
        assert.ok(
          !template.includes(`${fieldName}Options`),
          `Email field "${fieldName}" NÃO deve gerar select/options`
        );
      }),
      { numRuns: 100 }
    );
  });

  // --- String (name contains "pass") → type="password" ---

  it('String com nome contendo "pass" deve gerar input type="password"', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(entityNameArb, passwordFieldNameArb, (entityName, fieldName) => {
        const props = [makeProp(fieldName, 'String', true)];
        const form = renderForm(entityName, props);
        const template = extractTemplate(form);

        assert.ok(
          template.includes(`v-model="entity.${fieldName}"`),
          `Template deve conter v-model="entity.${fieldName}"`
        );
        assert.ok(
          template.includes('type="password"'),
          `Password field "${fieldName}" deve gerar input type="password"`
        );
        assert.ok(
          !template.includes(`${fieldName}Options`),
          `Password field "${fieldName}" NÃO deve gerar select/options`
        );
      }),
      { numRuns: 100 }
    );
  });

  // --- Date, LocalDate, LocalDateTime → type="date" ---

  it('Date, LocalDate e LocalDateTime devem gerar input type="date"', function () {
    this.timeout(30000);

    const dateTypeArb = fc.constantFrom('Date', 'LocalDate', 'LocalDateTime');

    fc.assert(
      fc.property(entityNameArb, fieldNameArb, dateTypeArb, (entityName, fieldName, dateType) => {
        const props = [makeProp(fieldName, dateType, true)];
        const form = renderForm(entityName, props);
        const template = extractTemplate(form);

        assert.ok(
          template.includes(`v-model="entity.${fieldName}"`),
          `Template deve conter v-model="entity.${fieldName}"`
        );
        assert.ok(
          template.includes('type="date"'),
          `${dateType} field "${fieldName}" deve gerar input type="date"`
        );
        assert.ok(
          !template.includes('type="text"'),
          `${dateType} field "${fieldName}" NÃO deve gerar input type="text"`
        );
        assert.ok(
          !template.includes(`${fieldName}Options`),
          `${dateType} field "${fieldName}" NÃO deve gerar select/options`
        );
      }),
      { numRuns: 100 }
    );
  });

  // --- Integer, Long, Double, BigDecimal, Float, Short → type="number" ---

  it('Tipos numéricos (Integer, Long, Double, BigDecimal, Float, Short) devem gerar input type="number"', function () {
    this.timeout(30000);

    const numericTypeArb = fc.constantFrom('Integer', 'Long', 'Double', 'BigDecimal', 'Float', 'Short');

    fc.assert(
      fc.property(entityNameArb, fieldNameArb, numericTypeArb, (entityName, fieldName, numType) => {
        const props = [makeProp(fieldName, numType, true)];
        const form = renderForm(entityName, props);
        const template = extractTemplate(form);

        assert.ok(
          template.includes(`v-model="entity.${fieldName}"`),
          `Template deve conter v-model="entity.${fieldName}"`
        );
        assert.ok(
          template.includes('type="number"'),
          `${numType} field "${fieldName}" deve gerar input type="number"`
        );
        assert.ok(
          !template.includes('type="text"'),
          `${numType} field "${fieldName}" NÃO deve gerar input type="text"`
        );
        assert.ok(
          !template.includes(`${fieldName}Options`),
          `${numType} field "${fieldName}" NÃO deve gerar select/options`
        );
      }),
      { numRuns: 100 }
    );
  });

  // --- boolean → type="checkbox" ---

  it('boolean deve gerar input type="checkbox"', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(entityNameArb, fieldNameArb, (entityName, fieldName) => {
        const props = [makeProp(fieldName, 'boolean', true)];
        const form = renderForm(entityName, props);
        const template = extractTemplate(form);

        assert.ok(
          template.includes(`v-model="entity.${fieldName}"`),
          `Template deve conter v-model="entity.${fieldName}"`
        );
        assert.ok(
          template.includes('type="checkbox"'),
          `boolean field "${fieldName}" deve gerar input type="checkbox"`
        );
        assert.ok(
          !template.includes(`${fieldName}Options`),
          `boolean field "${fieldName}" NÃO deve gerar select/options`
        );
      }),
      { numRuns: 100 }
    );
  });

  // --- Non-primitive types (relationship) → <select> element ---

  it('Tipos não primitivos (relacionamentos) devem gerar campo <select> com dropdown options', function () {
    this.timeout(30000);

    const relationTypeArb = fc.stringMatching(/^[A-Z][a-zA-Z]{2,8}$/).filter(s => s.length >= 3);

    fc.assert(
      fc.property(entityNameArb, fieldNameArb, relationTypeArb, (entityName, fieldName, relationType) => {
        const props = [makeProp(fieldName, relationType, false)];
        const form = renderForm(entityName, props);
        const template = extractTemplate(form);
        const script = extractScript(form);

        // Must generate a <select> element
        assert.ok(
          template.includes('<select'),
          `Non-primitive field "${fieldName}" (type ${relationType}) deve gerar elemento <select>`
        );
        assert.ok(
          template.includes(`v-model="entity.${fieldName}"`),
          `Template deve conter v-model="entity.${fieldName}"`
        );
        // Must generate options array
        assert.ok(
          template.includes(`${fieldName}Options`),
          `Non-primitive field "${fieldName}" deve gerar ${fieldName}Options para o dropdown`
        );
        // Must have v-for on options
        assert.ok(
          template.includes(`v-for="opt in ${fieldName}Options"`),
          `Non-primitive field "${fieldName}" deve iterar sobre ${fieldName}Options com v-for`
        );
        // Must NOT generate <input> for this field
        assert.ok(
          !new RegExp(`type="(text|number|date|email|password|checkbox)"[\\s\\S]*?v-model="entity\\.${fieldName}"`).test(template),
          `Non-primitive field "${fieldName}" NÃO deve gerar <input>`
        );
        // Script must declare the options ref
        assert.ok(
          script.includes(`${fieldName}Options`),
          `Script deve declarar ${fieldName}Options ref`
        );
        // Must import useApi for loading relationship data
        assert.ok(
          script.includes('useApi'),
          'Script deve importar useApi para carregar dados de relacionamento'
        );
      }),
      { numRuns: 100 }
    );
  });

  // --- ReadOnly properties → type="text" with readonly attribute ---

  it('Propriedades readOnly devem gerar input type="text" com atributo readonly', function () {
    this.timeout(30000);

    const anyTypeArb = fc.constantFrom('String', 'Integer', 'Long', 'Date', 'boolean', 'Double');

    fc.assert(
      fc.property(entityNameArb, fieldNameArb, anyTypeArb, (entityName, fieldName, fieldType) => {
        const props = [makeProp(fieldName, fieldType, true, true)];
        const form = renderForm(entityName, props);
        const template = extractTemplate(form);

        assert.ok(
          template.includes(`v-model="entity.${fieldName}"`),
          `Template deve conter v-model="entity.${fieldName}"`
        );
        assert.ok(
          template.includes('type="text"'),
          `ReadOnly field "${fieldName}" deve gerar input type="text" independente do tipo Java`
        );
        assert.ok(
          template.includes('readonly'),
          `ReadOnly field "${fieldName}" deve ter atributo readonly`
        );
      }),
      { numRuns: 100 }
    );
  });

  // --- Mixed properties: each field gets its correct type ---

  it('Entidade com múltiplos tipos deve mapear cada campo para o input HTML5 correto', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(entityNameArb, (entityName) => {
        const props = [
          makeProp('nome', 'String', true),
          makeProp('userEmail', 'String', true),
          makeProp('password', 'String', true),
          makeProp('birthDate', 'Date', true),
          makeProp('age', 'Integer', true),
          makeProp('salary', 'BigDecimal', true),
          makeProp('active', 'boolean', true),
          makeProp('category', 'Category', false)
        ];
        const form = renderForm(entityName, props);
        const template = extractTemplate(form);

        // String → text
        assert.ok(
          template.includes('type="text"') && template.includes('v-model="entity.nome"'),
          'String "nome" deve gerar type="text"'
        );
        // email → email
        assert.ok(
          template.includes('type="email"') && template.includes('v-model="entity.userEmail"'),
          'String "userEmail" deve gerar type="email"'
        );
        // password → password
        assert.ok(
          template.includes('type="password"') && template.includes('v-model="entity.password"'),
          'String "password" deve gerar type="password"'
        );
        // Date → date
        assert.ok(
          template.includes('type="date"') && template.includes('v-model="entity.birthDate"'),
          'Date "birthDate" deve gerar type="date"'
        );
        // Integer → number
        assert.ok(
          template.includes('type="number"') && template.includes('v-model="entity.age"'),
          'Integer "age" deve gerar type="number"'
        );
        // BigDecimal → number
        assert.ok(
          template.includes('v-model="entity.salary"'),
          'BigDecimal "salary" deve estar presente'
        );
        // boolean → checkbox
        assert.ok(
          template.includes('type="checkbox"') && template.includes('v-model="entity.active"'),
          'boolean "active" deve gerar type="checkbox"'
        );
        // Non-primitive → select
        assert.ok(
          template.includes('<select') && template.includes('v-model="entity.category"'),
          'Non-primitive "category" deve gerar <select>'
        );
        assert.ok(
          template.includes('categoryOptions'),
          'Non-primitive "category" deve gerar categoryOptions'
        );
      }),
      { numRuns: 100 }
    );
  });

  // --- Each numeric type individually ---

  it('Cada tipo numérico individual deve gerar type="number" com entidade isolada', function () {
    this.timeout(30000);

    const numericTypes = ['Integer', 'Long', 'Double', 'BigDecimal', 'Float', 'Short'];

    for (const numType of numericTypes) {
      fc.assert(
        fc.property(entityNameArb, fieldNameArb, (entityName, fieldName) => {
          const props = [makeProp(fieldName, numType, true)];
          const form = renderForm(entityName, props);
          const template = extractTemplate(form);

          assert.ok(
            template.includes('type="number"'),
            `${numType} field "${fieldName}" deve gerar input type="number"`
          );
          assert.ok(
            template.includes(`v-model="entity.${fieldName}"`),
            `${numType} field "${fieldName}" deve ter v-model correto`
          );
        }),
        { numRuns: 50 }
      );
    }
  });

  // --- Each date type individually ---

  it('Cada tipo de data individual deve gerar type="date" com entidade isolada', function () {
    this.timeout(30000);

    const dateTypes = ['Date', 'LocalDate', 'LocalDateTime'];

    for (const dateType of dateTypes) {
      fc.assert(
        fc.property(entityNameArb, fieldNameArb, (entityName, fieldName) => {
          const props = [makeProp(fieldName, dateType, true)];
          const form = renderForm(entityName, props);
          const template = extractTemplate(form);

          assert.ok(
            template.includes('type="date"'),
            `${dateType} field "${fieldName}" deve gerar input type="date"`
          );
          assert.ok(
            template.includes(`v-model="entity.${fieldName}"`),
            `${dateType} field "${fieldName}" deve ter v-model correto`
          );
        }),
        { numRuns: 50 }
      );
    }
  });

  // --- i18n labels for all field types ---

  it('Todos os tipos de campo devem gerar labels com i18n $t() para qualquer entidade', function () {
    this.timeout(30000);

    const allTypeArb = fc.constantFrom('String', 'Integer', 'Long', 'Date', 'LocalDate', 'LocalDateTime', 'Double', 'BigDecimal', 'boolean', 'Float', 'Short');

    fc.assert(
      fc.property(entityNameArb, fieldNameArb, allTypeArb, (entityName, fieldName, fieldType) => {
        const props = [makeProp(fieldName, fieldType, true)];
        const form = renderForm(entityName, props);
        const template = extractTemplate(form);
        const entityLower = entityName.toLowerCase();

        assert.ok(
          template.includes(`$t('${entityLower}.fields.${fieldName}')`),
          `Field "${fieldName}" (type ${fieldType}) deve ter label i18n $t('${entityLower}.fields.${fieldName}')`
        );
      }),
      { numRuns: 100 }
    );
  });
});
