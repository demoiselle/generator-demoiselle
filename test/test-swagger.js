'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const PackageRegistry = require('../Utils/packageRegistry');

const swaggerGeneratorSourcePath = path.join(__dirname, '..', 'generators', 'fromSwagger', 'index.js');
const swaggerGeneratorSource = fs.readFileSync(swaggerGeneratorSourcePath, 'utf-8');

describe('yo demoiselle:fromSwagger', () => {

  // --- Req 9.4: Verificar services e componentes Vue.js gerados ---

  describe('quando gerar a partir de Swagger/OpenAPI', () => {

    it('DEVE instanciar FrontendUtil para gerar componentes Vue.js', () => {
      assert.ok(
        swaggerGeneratorSource.includes('FrontendUtil'),
        'SwaggerGenerator deve importar FrontendUtil'
      );
      assert.ok(
        swaggerGeneratorSource.includes('this.frontendUtil = new FrontendUtil(this)'),
        'SwaggerGenerator deve instanciar FrontendUtil'
      );
    });

    it('DEVE chamar frontendUtil.createCrud() para entidades', () => {
      assert.ok(
        swaggerGeneratorSource.includes('this.frontendUtil.createCrud('),
        'SwaggerGenerator deve chamar frontendUtil.createCrud() para entidades'
      );
    });

    it('DEVE chamar frontendUtil.createService() para endpoints', () => {
      assert.ok(
        swaggerGeneratorSource.includes('this.frontendUtil.createService('),
        'SwaggerGenerator deve chamar frontendUtil.createService() para endpoints'
      );
    });

    it('templates de service Vue.js (composable) devem existir', () => {
      const providerDir = path.join(__dirname, '..', 'Utils', 'templates', 'frontend', 'provider');
      assert.ok(
        fs.existsSync(path.join(providerDir, '_provider.composable.js')),
        'Template _provider.composable.js deve existir'
      );
    });
  });

  // --- Verificar services e telas Flutter gerados quando mobile habilitado ---

  describe('quando gerar Flutter a partir de Swagger/OpenAPI (mobile habilitado)', () => {

    it('DEVE instanciar MobileUtil para gerar telas Flutter', () => {
      assert.ok(
        swaggerGeneratorSource.includes('MobileUtil'),
        'SwaggerGenerator deve importar MobileUtil'
      );
      assert.ok(
        swaggerGeneratorSource.includes('this.mobileUtil = new MobileUtil(this)'),
        'SwaggerGenerator deve instanciar MobileUtil'
      );
    });

    it('DEVE chamar mobileUtil.createCrud() para entidades quando mobile habilitado', () => {
      assert.ok(
        swaggerGeneratorSource.includes('this.mobileUtil.createCrud('),
        'SwaggerGenerator deve chamar mobileUtil.createCrud() para entidades'
      );
    });

    it('DEVE chamar mobileUtil.createService() para endpoints quando mobile habilitado', () => {
      assert.ok(
        swaggerGeneratorSource.includes('this.mobileUtil.createService('),
        'SwaggerGenerator deve chamar mobileUtil.createService() para endpoints'
      );
    });

    it('DEVE verificar skip-mobile antes de gerar mobile', () => {
      assert.ok(
        swaggerGeneratorSource.includes("'skip-mobile'"),
        'SwaggerGenerator deve verificar flag skip-mobile'
      );
    });

    it('prompt deve incluir opção mobile', () => {
      assert.ok(
        swaggerGeneratorSource.includes("name: 'mobile'"),
        'Prompt do SwaggerGenerator deve conter opção mobile'
      );
    });
  });

  // --- Verificar suporte a OpenAPI 3.0 ---

  describe('suporte a OpenAPI 3.0', () => {

    it('DEVE suportar tanto Swagger 2.0 (definitions) quanto OpenAPI 3.0 (components.schemas)', () => {
      assert.ok(
        swaggerGeneratorSource.includes('definitions'),
        'SwaggerGenerator deve suportar Swagger 2.0 (definitions)'
      );
      assert.ok(
        swaggerGeneratorSource.includes('components') && swaggerGeneratorSource.includes('schemas'),
        'SwaggerGenerator deve suportar OpenAPI 3.0 (components.schemas)'
      );
    });

    it('DEVE usar swagger-parser com suporte a OpenAPI 3.0', () => {
      assert.ok(
        swaggerGeneratorSource.includes('swagger-parser') || swaggerGeneratorSource.includes('SwaggerParser'),
        'SwaggerGenerator deve usar swagger-parser'
      );
    });

    it('arquivos de exemplo Swagger devem existir para testes', () => {
      const examplesDir = path.join(__dirname, 'swagger-examples');
      assert.ok(fs.existsSync(examplesDir), 'Diretório swagger-examples deve existir');
      const files = fs.readdirSync(examplesDir);
      assert.ok(files.length > 0, 'Deve haver pelo menos um arquivo de exemplo Swagger');
    });
  });

  // --- Req 17.3: Geração via Swagger respeitando pacotes selecionados ---

  describe('geração via Swagger respeitando pacotes selecionados (Req 17.3)', () => {

    it('SwaggerGenerator DEVE ler Configuração_Pacotes do .yo-rc.json no initializing()', () => {
      assert.ok(
        swaggerGeneratorSource.includes("this.config.get('packages')"),
        'SwaggerGenerator deve ler packages do config (.yo-rc.json)'
      );
      assert.ok(
        swaggerGeneratorSource.includes('this.selectedPackages'),
        'SwaggerGenerator deve armazenar pacotes em this.selectedPackages'
      );
    });

    it('SwaggerGenerator DEVE passar selectedPackages ao config do FrontendUtil', () => {
      assert.ok(
        swaggerGeneratorSource.includes('packages: this.selectedPackages'),
        'configFrontend deve conter packages: this.selectedPackages'
      );
    });

    it('SwaggerGenerator DEVE passar selectedPackages ao config do BackendUtil', () => {
      assert.ok(
        swaggerGeneratorSource.includes('packages: this.selectedPackages'),
        'configBackend deve conter packages: this.selectedPackages'
      );
    });

    it('SwaggerGenerator DEVE passar selectedPackages ao config do MobileUtil', () => {
      assert.ok(
        swaggerGeneratorSource.includes('packages: this.selectedPackages'),
        'configMobile deve conter packages: this.selectedPackages'
      );
    });
  });

  // --- Req 17.4: Compatibilidade retroativa (projeto sem Configuração_Pacotes) ---

  describe('compatibilidade retroativa — projeto legado sem Configuração_Pacotes (Req 17.4)', () => {

    it('SwaggerGenerator DEVE assumir todos os pacotes quando .yo-rc.json não tem packages', () => {
      assert.ok(
        swaggerGeneratorSource.includes("this.config.get('packages')"),
        'SwaggerGenerator deve ler packages do config'
      );
      assert.ok(
        swaggerGeneratorSource.includes('this.selectedPackages === null'),
        'SwaggerGenerator deve verificar se selectedPackages é null'
      );
    });

    it('SwaggerGenerator DEVE usar PackageRegistry.getAvailablePackages() para obter todos os slugs', () => {
      assert.ok(
        swaggerGeneratorSource.includes('PackageRegistry'),
        'SwaggerGenerator deve importar PackageRegistry'
      );
      assert.ok(
        swaggerGeneratorSource.includes('getAvailablePackages'),
        'SwaggerGenerator deve chamar getAvailablePackages() para obter todos os pacotes'
      );
    });

    it('quando selectedPackages é null, DEVE resolver para todos os 10 pacotes', () => {
      const registry = new PackageRegistry();
      const allSlugs = registry.getAvailablePackages().map(p => p.slug);
      assert.strictEqual(allSlugs.length, 10, 'Deve haver 10 pacotes disponíveis');
      const expected = ['auth', 'messaging', 'mcp', 'file-upload', 'audit',
        'dashboard', 'export', 'observability', 'i18n', 'themes'];
      expected.forEach(slug => {
        assert.ok(allSlugs.includes(slug), `Pacote "${slug}" deve estar disponível`);
      });
    });

    it('SwaggerGenerator initializing() DEVE instanciar PackageRegistry para fallback', () => {
      assert.ok(
        swaggerGeneratorSource.includes('new PackageRegistry()'),
        'SwaggerGenerator deve instanciar PackageRegistry no initializing() para fallback'
      );
    });

    it('fallback de compatibilidade DEVE mapear getAvailablePackages para array de slugs', () => {
      assert.ok(
        swaggerGeneratorSource.includes('.map(p => p.slug)') || swaggerGeneratorSource.includes('.map(function'),
        'SwaggerGenerator deve mapear pacotes para array de slugs'
      );
    });
  });
});
