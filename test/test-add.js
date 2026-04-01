'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const addGeneratorSourcePath = path.join(__dirname, '..', 'generators', 'add', 'index.js');
const addGeneratorSource = fs.readFileSync(addGeneratorSourcePath, 'utf-8');

describe('yo demoiselle:add', () => {

  // --- Req 9.3: Verificar CRUD Vue.js SFC gerado ---

  describe('quando gerar um CRUD Vue.js', () => {

    it('DEVE instanciar FrontendUtil para gerar arquivos Vue.js', () => {
      assert.ok(
        addGeneratorSource.includes('FrontendUtil'),
        'AddGenerator deve importar FrontendUtil'
      );
      assert.ok(
        addGeneratorSource.includes('this.frontendUtil = new FrontendUtil(this)'),
        'AddGenerator deve instanciar FrontendUtil'
      );
    });

    it('DEVE chamar frontendUtil.createCrud() quando frontend habilitado', () => {
      assert.ok(
        addGeneratorSource.includes('this.frontendUtil.createCrud('),
        'AddGenerator deve chamar frontendUtil.createCrud()'
      );
    });

    it('templates de CRUD Vue.js devem existir', () => {
      const entityDir = path.join(__dirname, '..', 'Utils', 'templates', 'frontend', 'entity');
      const expectedFiles = [
        '_entityList.vue',
        '_entityForm.vue',
        '_entity.service.js',
        '_entity.routes.js'
      ];
      expectedFiles.forEach(file => {
        assert.ok(
          fs.existsSync(path.join(entityDir, file)),
          `Template CRUD Vue.js "${file}" deve existir`
        );
      });
    });

    it('template _entityList.vue deve conter AdvancedFilter e botões de exportação', () => {
      const listPath = path.join(__dirname, '..', 'Utils', 'templates', 'frontend', 'entity', '_entityList.vue');
      const content = fs.readFileSync(listPath, 'utf-8');

      assert.ok(content.includes('AdvancedFilter'), 'List deve conter AdvancedFilter');
      assert.ok(content.includes('exportCsv'), 'List deve conter exportação CSV');
      assert.ok(content.includes('exportPdf'), 'List deve conter exportação PDF');
    });

    it('template _entityForm.vue deve conter formulário com $t() para i18n', () => {
      const formPath = path.join(__dirname, '..', 'Utils', 'templates', 'frontend', 'entity', '_entityForm.vue');
      const content = fs.readFileSync(formPath, 'utf-8');

      assert.ok(content.includes('<form'), 'Form deve conter elemento <form>');
      assert.ok(content.includes('$t('), 'Form deve usar $t() para internacionalização');
    });

    it('templates Vue.js SFC devem existir no diretório de templates', () => {
      const entityDir = path.join(__dirname, '..', 'Utils', 'templates', 'frontend', 'entity');
      const vueFiles = fs.readdirSync(entityDir).filter(f => f.endsWith('.vue') || f.endsWith('.service.js') || f.endsWith('.routes.js'));
      assert.ok(vueFiles.length >= 4, 'Deve haver pelo menos 4 arquivos Vue.js/JS no diretório de templates');
      assert.ok(vueFiles.some(f => f.endsWith('.vue')), 'Deve haver arquivos .vue no diretório de templates');
    });
  });

  // --- Req 42.1, 42.2: Verificar CRUD Flutter gerado quando mobile habilitado ---

  describe('quando gerar um CRUD Flutter (mobile habilitado)', () => {

    it('DEVE instanciar MobileUtil para gerar arquivos Flutter', () => {
      assert.ok(
        addGeneratorSource.includes('MobileUtil'),
        'AddGenerator deve importar MobileUtil'
      );
      assert.ok(
        addGeneratorSource.includes('this.mobileUtil = new MobileUtil(this)'),
        'AddGenerator deve instanciar MobileUtil'
      );
    });

    it('DEVE chamar mobileUtil.createCrud() quando mobile habilitado', () => {
      assert.ok(
        addGeneratorSource.includes('this.mobileUtil.createCrud('),
        'AddGenerator deve chamar mobileUtil.createCrud()'
      );
    });

    it('DEVE verificar skip-mobile antes de gerar mobile', () => {
      assert.ok(
        addGeneratorSource.includes("'skip-mobile'"),
        'AddGenerator deve verificar flag skip-mobile'
      );
    });

    it('templates de CRUD Flutter devem existir', () => {
      const entityDir = path.join(__dirname, '..', 'Utils', 'templates', 'mobile', 'entity');
      const expectedFiles = [
        '_entity_list_screen.dart',
        '_entity_form_screen.dart',
        '_entity_service.dart',
        '_entity_model.dart',
        '_entity_provider.dart'
      ];
      expectedFiles.forEach(file => {
        assert.ok(
          fs.existsSync(path.join(entityDir, file)),
          `Template CRUD Flutter "${file}" deve existir`
        );
      });
    });
  });

  // --- Verificar filtros avançados, exportação, chaves i18n, cards no dashboard ---

  describe('funcionalidades integradas no CRUD', () => {

    it('FrontendUtil deve adicionar chaves i18n ao gerar CRUD', () => {
      const frontendSource = fs.readFileSync(
        path.join(__dirname, '..', 'Utils', 'frontend.js'), 'utf-8'
      );
      assert.ok(
        frontendSource.includes('_addI18nKeys'),
        'FrontendUtil deve conter método _addI18nKeys'
      );
    });

    it('FrontendUtil deve adicionar card no dashboard ao gerar CRUD', () => {
      const frontendSource = fs.readFileSync(
        path.join(__dirname, '..', 'Utils', 'frontend.js'), 'utf-8'
      );
      assert.ok(
        frontendSource.includes('_addDashboardCard'),
        'FrontendUtil deve conter método _addDashboardCard'
      );
    });

    it('MobileUtil deve adicionar rota, i18n, dashboard card e drawer item ao gerar CRUD', () => {
      const mobileSource = fs.readFileSync(
        path.join(__dirname, '..', 'Utils', 'mobile.js'), 'utf-8'
      );
      assert.ok(mobileSource.includes('_addRoute'), 'MobileUtil deve conter _addRoute');
      assert.ok(mobileSource.includes('_addI18nKeys'), 'MobileUtil deve conter _addI18nKeys');
      assert.ok(mobileSource.includes('_addDashboardCard'), 'MobileUtil deve conter _addDashboardCard');
      assert.ok(mobileSource.includes('_addDrawerItem'), 'MobileUtil deve conter _addDrawerItem');
    });

    it('prompt do AddGenerator deve incluir opção mobile', () => {
      assert.ok(
        addGeneratorSource.includes("name: 'mobile'"),
        'Prompt do AddGenerator deve conter opção mobile'
      );
    });
  });
});
