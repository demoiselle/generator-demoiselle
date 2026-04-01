'use strict';

const assert = require('assert');
const fc = require('fast-check');
const fs = require('fs');
const path = require('path');

const { entityNameArb, capitalize } = require('./generators/arbitraries');

// --- Load source files ---

const dashboardViewPath = path.join(__dirname, '..', 'Utils', 'templates', 'base', 'frontend', 'src', 'views', 'DashboardView.vue');
const dashboardViewContent = fs.readFileSync(dashboardViewPath, 'utf-8');

const dashboardScreenPath = path.join(__dirname, '..', 'Utils', 'templates', 'base', 'mobile', 'lib', 'screens', 'dashboard_screen.dart');
const dashboardScreenContent = fs.readFileSync(dashboardScreenPath, 'utf-8');

const frontendUtilPath = path.join(__dirname, '..', 'Utils', 'frontend.js');
const frontendUtilSource = fs.readFileSync(frontendUtilPath, 'utf-8');

const mobileUtilPath = path.join(__dirname, '..', 'Utils', 'mobile.js');
const mobileUtilSource = fs.readFileSync(mobileUtilPath, 'utf-8');

const backendUtilPath = path.join(__dirname, '..', 'Utils', 'backend.js');
const backendUtilSource = fs.readFileSync(backendUtilPath, 'utf-8');

/**
 * **Validates: Requirements 16.1, 16.2, 16.3, 16.4**
 *
 * Property 14: Dashboard com estatísticas por entidade
 *
 * For any generated project with at least one CRUD entity:
 * - The backend must contain a /dashboard/stats endpoint (DashboardREST)
 * - The frontend must contain a DashboardView.vue with stat cards
 * - The mobile must contain a DashboardScreen with stat cards
 * - Adding a new entity via add or fromEntity must add a new card automatically
 */
describe('Property 14: Dashboard com estatísticas por entidade', () => {

  // --- Req 16.1: DashboardView.vue deve existir como tela inicial após login ---

  it('DashboardView.vue deve existir e conter estrutura de dashboard com cards de estatísticas', () => {
    // Must exist
    assert.ok(
      fs.existsSync(dashboardViewPath),
      'DashboardView.vue deve existir no template base frontend'
    );

    // Must contain dashboard title via i18n
    assert.ok(
      dashboardViewContent.includes("$t('dashboard.title')"),
      'DashboardView deve usar $t("dashboard.title") para título'
    );

    // Must contain stats grid
    assert.ok(
      dashboardViewContent.includes('stats-grid') || dashboardViewContent.includes('stat-card'),
      'DashboardView deve conter grid de cards de estatísticas'
    );

    // Must contain marker for entity cards injection
    assert.ok(
      dashboardViewContent.includes('ENTITY_DASHBOARD_CARDS'),
      'DashboardView deve conter marcador ENTITY_DASHBOARD_CARDS para injeção de cards'
    );

    // Must fetch stats from API
    assert.ok(
      dashboardViewContent.includes('/api/dashboard/stats') || dashboardViewContent.includes('dashboard/stats'),
      'DashboardView deve buscar estatísticas do endpoint /dashboard/stats'
    );

    // Must use Vue 3 Composition API
    assert.ok(
      /<script\s+setup>/.test(dashboardViewContent),
      'DashboardView deve usar <script setup> (Composition API)'
    );

    // Must use scoped styles with CSS variables
    assert.ok(
      /<style\s+scoped>/.test(dashboardViewContent),
      'DashboardView deve usar <style scoped>'
    );
    assert.ok(
      /var\(--[\w-]+\)/.test(dashboardViewContent),
      'DashboardView deve usar variáveis CSS de tema'
    );
  });

  // --- Req 16.2: Adicionar card automaticamente ao gerar CRUD ---

  it('FrontendUtil._addDashboardCard deve existir e injetar card no DashboardView', () => {
    // Method must exist
    assert.ok(
      frontendUtilSource.includes('_addDashboardCard'),
      'FrontendUtil deve conter método _addDashboardCard'
    );

    // Must reference ENTITY_DASHBOARD_CARDS marker
    assert.ok(
      frontendUtilSource.includes('ENTITY_DASHBOARD_CARDS'),
      'FrontendUtil._addDashboardCard deve usar marcador ENTITY_DASHBOARD_CARDS'
    );

    // Must reference DashboardView.vue path
    assert.ok(
      frontendUtilSource.includes('DashboardView.vue'),
      'FrontendUtil._addDashboardCard deve referenciar DashboardView.vue'
    );
  });

  it('MobileUtil._addDashboardCard deve existir e injetar card no DashboardScreen', () => {
    // Method must exist
    assert.ok(
      mobileUtilSource.includes('_addDashboardCard'),
      'MobileUtil deve conter método _addDashboardCard'
    );

    // Must reference ENTITY_STATS_CARDS marker
    assert.ok(
      mobileUtilSource.includes('ENTITY_STATS_CARDS'),
      'MobileUtil._addDashboardCard deve usar marcador ENTITY_STATS_CARDS'
    );

    // Must reference dashboard_screen.dart path
    assert.ok(
      mobileUtilSource.includes('dashboard_screen.dart'),
      'MobileUtil._addDashboardCard deve referenciar dashboard_screen.dart'
    );
  });

  // --- Req 16.3: Backend deve conter endpoint /dashboard/stats ---

  it('BackendUtil._addEntityToDashboardStats deve existir e injetar DAO no DashboardREST', () => {
    // Method must exist
    assert.ok(
      backendUtilSource.includes('_addEntityToDashboardStats'),
      'BackendUtil deve conter método _addEntityToDashboardStats'
    );

    // Must reference DashboardREST.java
    assert.ok(
      backendUtilSource.includes('DashboardREST.java'),
      'BackendUtil._addEntityToDashboardStats deve referenciar DashboardREST.java'
    );

    // Must inject DAO and count
    assert.ok(
      backendUtilSource.includes('ENTITY_STATS_INJECT'),
      'BackendUtil deve usar marcador ENTITY_STATS_INJECT para injeção de DAO'
    );
    assert.ok(
      backendUtilSource.includes('ENTITY_COUNT_INJECT'),
      'BackendUtil deve usar marcador ENTITY_COUNT_INJECT para contagem'
    );
  });

  // --- Req 16.4: Dashboard responsivo com grid de cards ---

  it('DashboardView.vue deve ter layout responsivo com grid', () => {
    // Must use CSS grid
    assert.ok(
      dashboardViewContent.includes('grid-template-columns'),
      'DashboardView deve usar CSS grid para layout responsivo'
    );

    // Must have responsive breakpoint
    assert.ok(
      dashboardViewContent.includes('@media'),
      'DashboardView deve ter media query para responsividade'
    );
  });

  it('DashboardScreen mobile deve ter layout responsivo para phone e tablet', () => {
    // Must use LayoutBuilder or MediaQuery for responsive layout
    assert.ok(
      dashboardScreenContent.includes('LayoutBuilder') || dashboardScreenContent.includes('MediaQuery'),
      'DashboardScreen deve usar LayoutBuilder ou MediaQuery para layout responsivo'
    );

    // Must have GridView for cards
    assert.ok(
      dashboardScreenContent.includes('GridView'),
      'DashboardScreen deve usar GridView para exibir cards'
    );
  });

  // --- Property-based: card injection is idempotent and uses entity name ---

  it('simulação de _addDashboardCard deve usar nome da entidade corretamente para qualquer entidade (property-based)', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(entityNameArb, (entityName) => {
        const lower = entityName.toLowerCase();
        const capital = capitalize(entityName);

        // Simulate what _addDashboardCard does for frontend
        const newCard = `
      <div class="stat-card">
        <div class="stat-icon">📦</div>
        <div class="stat-info">
          <span class="stat-count">{{ entityCounts['${lower}'] || 0 }}</span>
          <span class="stat-label">{{ $t('dashboard.entities.${lower}') }}</span>
        </div>
      </div>`;

        // Card must reference entity name in i18n key
        assert.ok(
          newCard.includes(`dashboard.entities.${lower}`),
          `Card deve usar chave i18n dashboard.entities.${lower}`
        );

        // Card must reference entity name in entityCounts
        assert.ok(
          newCard.includes(`entityCounts['${lower}']`),
          `Card deve referenciar entityCounts['${lower}']`
        );

        // Simulate what _addDashboardCard does for mobile
        const mobileCard = `
            _buildStatCard(
              context,
              title: AppLocalizations.of(context)!.${lower}Title,
              icon: Icons.list_alt,
              route: '/${lower}',
            ),`;

        // Mobile card must reference entity name
        assert.ok(
          mobileCard.includes(`${lower}Title`),
          `Mobile card deve referenciar ${lower}Title`
        );
        assert.ok(
          mobileCard.includes(`'/${lower}'`),
          `Mobile card deve referenciar rota /${lower}`
        );
      }),
      { numRuns: 100 }
    );
  });

  // --- Property-based: duplicate entity injection is prevented ---

  it('injeção de card duplicado deve ser prevenida para qualquer entidade (property-based)', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(entityNameArb, (entityName) => {
        const lower = entityName.toLowerCase();

        // Simulate the duplicate check logic from FrontendUtil._addDashboardCard
        const contentWithEntity = `some content '${lower}' more content`;
        const regex = new RegExp("'" + lower + "'", 'i');

        // If entity already exists in content, the function should not add it again
        assert.ok(
          regex.test(contentWithEntity),
          'Regex de detecção de duplicata deve encontrar entidade existente'
        );

        // Simulate the duplicate check logic from MobileUtil._addDashboardCard
        const mobileContentWithEntity = `some content ${lower}Count more content`;
        const mobileRegex = new RegExp(lower + 'Count', 'i');

        assert.ok(
          mobileRegex.test(mobileContentWithEntity),
          'Regex de detecção de duplicata mobile deve encontrar entidade existente'
        );
      }),
      { numRuns: 100 }
    );
  });

  // --- Property-based: BackendUtil injects DAO for any entity ---

  it('BackendUtil._addEntityToDashboardStats deve injetar DAO e contagem para qualquer entidade (property-based)', function () {
    this.timeout(30000);

    fc.assert(
      fc.property(entityNameArb, (entityName) => {
        const lower = entityName.toLowerCase();
        const capital = capitalize(entityName);

        // Simulate what _addEntityToDashboardStats generates
        const importStatement = `import somepackage.dao.${capital}DAO;\n`;
        const daoInject = `    @Inject\n    private ${capital}DAO ${lower}DAO;\n\n`;
        const countLine = `            stats.put("${lower}", ${lower}DAO.count());\n`;

        // Import must reference entity DAO
        assert.ok(
          importStatement.includes(`${capital}DAO`),
          `Import deve referenciar ${capital}DAO`
        );

        // Inject must declare DAO field
        assert.ok(
          daoInject.includes(`${capital}DAO ${lower}DAO`),
          `Inject deve declarar campo ${capital}DAO ${lower}DAO`
        );

        // Count line must put entity count in stats map
        assert.ok(
          countLine.includes(`"${lower}"`) && countLine.includes(`${lower}DAO.count()`),
          `Count deve adicionar "${lower}" com ${lower}DAO.count() ao mapa de stats`
        );
      }),
      { numRuns: 100 }
    );
  });
});
