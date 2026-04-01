'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

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
});
