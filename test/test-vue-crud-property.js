'use strict';

const assert = require('assert');
const fc = require('fast-check');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

// --- Load EJS templates ---

const templateDir = path.join(__dirname, '..', 'Utils', 'templates', 'frontend', 'entity');

const listTemplatePath = path.join(templateDir, '_entityList.vue');
const formTemplatePath = path.join(templateDir, '_entityForm.vue');
const serviceTemplatePath = path.join(templateDir, '_entity.service.js');
const routesTemplatePath = path.join(templateDir, '_entity.routes.js');

const listTemplate = fs.readFileSync(listTemplatePath, 'utf-8');
const formTemplate = fs.readFileSync(formTemplatePath, 'utf-8');
const serviceTemplate = fs.readFileSync(serviceTemplatePath, 'utf-8');
const routesTemplate = fs.readFileSync(routesTemplatePath, 'utf-8');

// --- Arbitraries ---

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
    hasCustomEntity: properties.some(p => !p.isPrimitive)
  };
}

function renderList(entityName, properties) {
  return ejs.render(listTemplate, buildTemplateData(entityName, properties));
}

function renderForm(entityName, properties) {
  return ejs.render(formTemplate, buildTemplateData(entityName, properties));
}

function renderService(entityName, properties) {
  return ejs.render(serviceTemplate, buildTemplateData(entityName, properties));
}

function renderRoutes(entityName, properties) {
  return ejs.render(routesTemplate, buildTemplateData(entityName, properties));
}

/**
 * Extract the <template> section from a Vue SFC string.
 */
function extractTemplate(sfcContent) {
  const match = sfcContent.match(/<template[^>]*>([\s\S]*?)<\/template>/);
  return match ? match[1] : '';
}

/**
 * Extract the <script> section from a Vue SFC string.
 */
function extractScript(sfcContent) {
  const match = sfcContent.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  return match ? match[1] : '';
}

/**
 * Extract the <style> section from a Vue SFC string.
 */
function extractStyle(sfcContent) {
  const match = sfcContent.match(/<style[^>]*>([\s\S]*?)<\/style>/);
  return match ? match[1] : '';
}

/**
 * Determine the expected HTML5 input type for a given property.
 */
function expectedInputType(property) {
  if (property.isReadOnly) return 'text';
  if (!property.isPrimitive) return 'select';
  if (/^boolean$/i.test(property.type)) return 'checkbox';
  if (/^(date|localdate|localdatetime)$/i.test(property.type)) return 'date';
  if (/^(integer|int|long|double|float|bigdecimal|number|short)$/i.test(property.type)) return 'number';
  if (/email/i.test(property.name)) return 'email';
  if (/pass/i.test(property.name)) return 'password';
  return 'text';
}

/**
 * **Validates: Requirements 3.2, 4.1, 4.2, 4.3, 4.4, 7.1, 9.3**
 *
 * Property 5: Geração completa de CRUD Vue.js
 *
 * For any valid entity name and properties, the CRUD generation must produce:
 * - _entityList.vue: valid Vue SFC with <template>, <script>, <style>
 * - _entityForm.vue: valid Vue SFC with form fields matching properties
 * - _entity.service.js: valid composable with CRUD methods (findAll, findById, create, update, remove)
 * - _entity.routes.js: valid route configuration with list, create, edit routes
 * - All rendered files use the entity name correctly
 * - List template includes AdvancedFilter, export buttons, pagination
 * - Form template maps Java types to correct HTML5 input types
 */
describe('Property 5: Geração completa de CRUD Vue.js', () => {

  // --- Req 3.2, 7.1: All CRUD files are Vue SFC (.vue) not Angular ---

  it('templates de CRUD devem gerar arquivos Vue SFC válidos com <template>, <script>, <style> para qualquer entidade', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(entityNameArb, propertiesArb, (entityName, properties) => {
        const list = renderList(entityName, properties);
        const form = renderForm(entityName, properties);

        // --- List SFC validation ---
        assert.ok(
          /<template[^>]*>/.test(list),
          'List SFC deve conter seção <template>'
        );
        assert.ok(
          /<script[^>]*>/.test(list),
          'List SFC deve conter seção <script>'
        );
        assert.ok(
          /<style[^>]*>/.test(list),
          'List SFC deve conter seção <style>'
        );
        assert.ok(
          /<\/template>/.test(list),
          'List SFC deve fechar seção </template>'
        );
        assert.ok(
          /<\/script>/.test(list),
          'List SFC deve fechar seção </script>'
        );
        assert.ok(
          /<\/style>/.test(list),
          'List SFC deve fechar seção </style>'
        );

        // --- Form SFC validation ---
        assert.ok(
          /<template[^>]*>/.test(form),
          'Form SFC deve conter seção <template>'
        );
        assert.ok(
          /<script[^>]*>/.test(form),
          'Form SFC deve conter seção <script>'
        );
        assert.ok(
          /<style[^>]*>/.test(form),
          'Form SFC deve conter seção <style>'
        );
        assert.ok(
          /<\/template>/.test(form),
          'Form SFC deve fechar seção </template>'
        );
        assert.ok(
          /<\/script>/.test(form),
          'Form SFC deve fechar seção </script>'
        );
        assert.ok(
          /<\/style>/.test(form),
          'Form SFC deve fechar seção </style>'
        );

        // --- Must NOT contain Angular artifacts ---
        assert.ok(
          !/@Component/.test(list) && !/@NgModule/.test(list),
          'List SFC NÃO deve conter decorators Angular'
        );
        assert.ok(
          !/@Component/.test(form) && !/@NgModule/.test(form),
          'Form SFC NÃO deve conter decorators Angular'
        );
      }),
      { numRuns: 100 }
    );
  });

  // --- Req 4.1: List SFC with table, AdvancedFilter, export buttons, pagination ---

  it('List SFC deve conter tabela, AdvancedFilter, botões de exportação e paginação para qualquer entidade', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(entityNameArb, propertiesArb, (entityName, properties) => {
        const list = renderList(entityName, properties);
        const template = extractTemplate(list);
        const script = extractScript(list);

        // Must include AdvancedFilter component
        assert.ok(
          /AdvancedFilter/.test(template),
          'List template deve incluir componente AdvancedFilter'
        );
        assert.ok(
          /AdvancedFilter/.test(script),
          'List script deve importar AdvancedFilter'
        );

        // Must include a data table
        assert.ok(
          /<table/.test(template),
          'List template deve conter uma tabela de dados'
        );

        // Must include edit and delete actions
        assert.ok(
          /edit/.test(template),
          'List template deve conter ação de editar'
        );
        assert.ok(
          /remove|delete/.test(template),
          'List template deve conter ação de excluir'
        );

        // Must include export CSV button
        assert.ok(
          /exportCsv/.test(template),
          'List template deve conter botão de exportação CSV'
        );

        // Must include export PDF button
        assert.ok(
          /exportPdf/.test(template),
          'List template deve conter botão de exportação PDF'
        );

        // Must include pagination controls
        assert.ok(
          /pagination/.test(list) || /currentPage/.test(list) || /goToPage/.test(list),
          'List deve conter controles de paginação'
        );

        // Must use entity name in route references
        const entityLower = entityName.toLowerCase();
        assert.ok(
          list.includes(entityLower),
          `List deve referenciar o nome da entidade "${entityLower}"`
        );
      }),
      { numRuns: 100 }
    );
  });

  // --- Req 4.2: Form SFC with form fields matching properties ---

  it('Form SFC deve conter campos de formulário correspondentes às propriedades da entidade', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(entityNameArb, propertiesArb, (entityName, properties) => {
        const form = renderForm(entityName, properties);
        const template = extractTemplate(form);
        const script = extractScript(form);

        // Must contain a <form> element
        assert.ok(
          /<form/.test(template),
          'Form template deve conter elemento <form>'
        );

        // Must contain save/submit functionality
        assert.ok(
          /save/.test(script),
          'Form script deve conter função save'
        );

        // Each property must have a corresponding form field
        for (const prop of properties) {
          assert.ok(
            template.includes(prop.name) || script.includes(prop.name),
            `Form deve referenciar a propriedade "${prop.name}"`
          );
        }

        // Must use entity name
        const entityLower = entityName.toLowerCase();
        assert.ok(
          form.includes(entityLower),
          `Form deve referenciar o nome da entidade "${entityLower}"`
        );

        // Must use i18n $t() for labels
        assert.ok(
          /\$t\(/.test(template),
          'Form template deve usar $t() para internacionalização'
        );
      }),
      { numRuns: 100 }
    );
  });

  // --- Req 4.3: Service composable with CRUD methods ---

  it('Service deve ser um composable válido com métodos CRUD para qualquer entidade', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(entityNameArb, propertiesArb, (entityName, properties) => {
        const service = renderService(entityName, properties);
        const entityLower = entityName.toLowerCase();
        const entityCapital = capitalize(entityName);

        // Must export a composable function (use<Entity>Service)
        assert.ok(
          service.includes(`use${entityCapital}Service`),
          `Service deve exportar composable use${entityCapital}Service`
        );

        // Must use the correct API base URL with entity name
        assert.ok(
          service.includes(`/api/v1/${entityLower}s`),
          `Service deve usar URL base /api/v1/${entityLower}s`
        );

        // Must have findAll method
        assert.ok(
          /findAll/.test(service),
          'Service deve conter método findAll'
        );

        // Must have findById method
        assert.ok(
          /findById/.test(service),
          'Service deve conter método findById'
        );

        // Must have create method
        assert.ok(
          /\bcreate\b/.test(service),
          'Service deve conter método create'
        );

        // Must have update method
        assert.ok(
          /\bupdate\b/.test(service),
          'Service deve conter método update'
        );

        // Must have remove method
        assert.ok(
          /\bremove\b/.test(service),
          'Service deve conter método remove'
        );

        // Must import useApi composable
        assert.ok(
          /useApi/.test(service),
          'Service deve importar useApi composable'
        );

        // Must NOT contain Angular patterns
        assert.ok(
          !/@Injectable/.test(service),
          'Service NÃO deve conter @Injectable (Angular)'
        );
        assert.ok(
          !/HttpClient/.test(service),
          'Service NÃO deve conter HttpClient (Angular)'
        );
      }),
      { numRuns: 100 }
    );
  });

  // --- Req 4.4: Route configuration with list, create, edit routes ---

  it('Routes deve conter configuração de rotas Vue Router para list, create e edit para qualquer entidade', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(entityNameArb, propertiesArb, (entityName, properties) => {
        const routes = renderRoutes(entityName, properties);
        const entityLower = entityName.toLowerCase();
        const entityCapital = capitalize(entityName);

        // Must contain list route
        assert.ok(
          routes.includes(`${entityLower}-list`),
          `Routes deve conter rota "${entityLower}-list"`
        );

        // Must contain create route
        assert.ok(
          routes.includes(`${entityLower}-create`),
          `Routes deve conter rota "${entityLower}-create"`
        );

        // Must contain edit route
        assert.ok(
          routes.includes(`${entityLower}-edit`),
          `Routes deve conter rota "${entityLower}-edit"`
        );

        // Edit route must have :id parameter
        assert.ok(
          /:id/.test(routes),
          'Rota de edição deve conter parâmetro :id'
        );

        // Must import List and Form components
        assert.ok(
          routes.includes(`${entityCapital}List`),
          `Routes deve importar componente ${entityCapital}List`
        );
        assert.ok(
          routes.includes(`${entityCapital}Form`),
          `Routes deve importar componente ${entityCapital}Form`
        );

        // Must export routes as default
        assert.ok(
          /export\s+default/.test(routes),
          'Routes deve exportar configuração como default'
        );

        // Must NOT contain Angular routing patterns
        assert.ok(
          !/RouterModule/.test(routes),
          'Routes NÃO deve conter RouterModule (Angular)'
        );
        assert.ok(
          !/NgModule/.test(routes),
          'Routes NÃO deve conter NgModule (Angular)'
        );
      }),
      { numRuns: 100 }
    );
  });

  // --- Req 9.3, 5.2: Form maps Java types to correct HTML5 input types ---

  it('Form deve mapear tipos Java para inputs HTML5 corretos para qualquer propriedade', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(entityNameArb, propertiesArb, (entityName, properties) => {
        const form = renderForm(entityName, properties);
        const template = extractTemplate(form);

        for (const prop of properties) {
          const expected = expectedInputType(prop);

          if (expected === 'select') {
            // Non-primitive types should render as <select>
            assert.ok(
              template.includes(`${prop.name}Options`),
              `Propriedade não-primitiva "${prop.name}" deve gerar campo select com options`
            );
          } else if (expected === 'checkbox') {
            // Boolean types should render as checkbox
            const checkboxRegex = new RegExp(`type="checkbox"[^>]*${prop.name}|${prop.name}[^>]*type="checkbox"`);
            assert.ok(
              checkboxRegex.test(template) || (template.includes('type="checkbox"') && template.includes(`v-model="entity.${prop.name}"`)),
              `Propriedade boolean "${prop.name}" deve gerar input type="checkbox"`
            );
          } else {
            // Other types should render as <input> with the correct type
            // Check that the property has an input with the expected type attribute
            const inputRegex = new RegExp(`type="${expected}"[\\s\\S]*?v-model="entity\\.${prop.name}"|v-model="entity\\.${prop.name}"[\\s\\S]*?type="${expected}"`);
            assert.ok(
              inputRegex.test(template) || template.includes(`type="${expected}"`) && template.includes(`v-model="entity.${prop.name}"`),
              `Propriedade "${prop.name}" (tipo ${prop.type}) deve gerar input type="${expected}"`
            );
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  // --- Req 4.1: List uses entity name correctly in i18n keys and service ---

  it('List deve usar o nome da entidade corretamente em chaves i18n e no service para qualquer entidade', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(entityNameArb, propertiesArb, (entityName, properties) => {
        const list = renderList(entityName, properties);
        const entityLower = entityName.toLowerCase();
        const entityCapital = capitalize(entityName);

        // Must use entity-specific i18n keys
        assert.ok(
          list.includes(`$t('${entityLower}.title')`),
          `List deve usar chave i18n "${entityLower}.title"`
        );

        // Must import entity-specific service
        assert.ok(
          list.includes(`use${entityCapital}Service`),
          `List deve importar use${entityCapital}Service`
        );

        // Must use entity-specific route names for navigation
        assert.ok(
          list.includes(`${entityLower}-create`),
          `List deve referenciar rota "${entityLower}-create"`
        );
        assert.ok(
          list.includes(`${entityLower}-edit`),
          `List deve referenciar rota "${entityLower}-edit"`
        );

        // Column headers must use i18n keys for each property
        for (const prop of properties) {
          if (!/^id$/i.test(prop.name)) {
            assert.ok(
              list.includes(`${entityLower}.fields.${prop.name}`),
              `List deve usar chave i18n "${entityLower}.fields.${prop.name}" para coluna`
            );
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  // --- Req 4.2: Form uses entity name correctly in i18n keys and service ---

  it('Form deve usar o nome da entidade corretamente em chaves i18n e no service para qualquer entidade', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(entityNameArb, propertiesArb, (entityName, properties) => {
        const form = renderForm(entityName, properties);
        const entityLower = entityName.toLowerCase();
        const entityCapital = capitalize(entityName);

        // Must import entity-specific service
        assert.ok(
          form.includes(`use${entityCapital}Service`),
          `Form deve importar use${entityCapital}Service`
        );

        // Must use entity-specific i18n key for entity name
        assert.ok(
          form.includes(`${entityLower}.entityName`),
          `Form deve usar chave i18n "${entityLower}.entityName"`
        );

        // Field labels must use i18n keys for each property
        for (const prop of properties) {
          assert.ok(
            form.includes(`${entityLower}.fields.${prop.name}`),
            `Form deve usar chave i18n "${entityLower}.fields.${prop.name}" para label`
          );
        }

        // Must navigate back to list route
        assert.ok(
          form.includes(`${entityLower}-list`),
          `Form deve navegar de volta para rota "${entityLower}-list"`
        );
      }),
      { numRuns: 100 }
    );
  });

  // --- Req 3.2: List SFC uses scoped styles with CSS variables ---

  it('List e Form SFC devem usar <style scoped> com variáveis CSS de tema', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(entityNameArb, propertiesArb, (entityName, properties) => {
        const list = renderList(entityName, properties);
        const form = renderForm(entityName, properties);

        // Both must use scoped styles
        assert.ok(
          /<style\s+scoped>/.test(list),
          'List SFC deve usar <style scoped>'
        );
        assert.ok(
          /<style\s+scoped>/.test(form),
          'Form SFC deve usar <style scoped>'
        );

        // Both must use CSS variables for theming
        const listStyle = extractStyle(list);
        const formStyle = extractStyle(form);

        assert.ok(
          /var\(--[\w-]+\)/.test(listStyle),
          'List style deve usar variáveis CSS var(--...)'
        );
        assert.ok(
          /var\(--[\w-]+\)/.test(formStyle),
          'Form style deve usar variáveis CSS var(--...)'
        );
      }),
      { numRuns: 100 }
    );
  });

  // --- Req 4.1: List SFC uses Vue 3 Composition API ---

  it('List e Form SFC devem usar Vue 3 Composition API (script setup)', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(entityNameArb, propertiesArb, (entityName, properties) => {
        const list = renderList(entityName, properties);
        const form = renderForm(entityName, properties);

        // Both must use <script setup> (Composition API)
        assert.ok(
          /<script\s+setup>/.test(list),
          'List SFC deve usar <script setup>'
        );
        assert.ok(
          /<script\s+setup>/.test(form),
          'Form SFC deve usar <script setup>'
        );

        // Both must import from vue
        const listScript = extractScript(list);
        const formScript = extractScript(form);

        assert.ok(
          /from\s+['"]vue['"]/.test(listScript),
          'List script deve importar de vue'
        );
        assert.ok(
          /from\s+['"]vue['"]/.test(formScript),
          'Form script deve importar de vue'
        );

        // Both must use vue-i18n
        assert.ok(
          /useI18n/.test(listScript),
          'List script deve usar useI18n'
        );
        assert.ok(
          /useI18n/.test(formScript),
          'Form script deve usar useI18n'
        );
      }),
      { numRuns: 100 }
    );
  });
});
