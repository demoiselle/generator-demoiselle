const Util = require('./util');
const _ = require('lodash');
const path = require('path');

module.exports = class FrontendUtil {

  constructor(vm) {
    this.util = new Util(vm);
    this.vm = vm;
    this.fs = vm.fs;
  }

  createCrud(entity, config) {
    config = config || {};
    config.dest = config.dest || 'frontend/src/app/';
    const fromPath = 'frontend/entity/';
    //const template = entity;
    const template = Object.assign(entity, {
      project: config.project,
      prefix: config.prefix
    });

    const files = [
      // ENTITY
      '_entity.module.ts',
      '_entity-routing.module.ts',
      '_entity.ts',
      '_entity.spec.ts',
      '_entity.html',
      '_entity.scss',
      // shared
      'shared/_entity.model.ts',
      'shared/_entity.service.ts',
      'shared/_entity.service.spec.ts',
      // details
      'details/_entity-details.ts',
      'details/_entity-details.spec.ts',
      'details/_entity-details.html',
      'details/_entity-details.scss',
      // form
      'form/_entity-form.ts',
      'form/_entity-form.spec.ts',
      'form/_entity-form.html',
      'form/_entity-form.scss',
      // list
      'list/_entity-list.ts',
      'list/_entity-list.spec.ts',
      'list/_entity-list.html',
      'list/_entity-list.scss'
    ];
    files.map((file) => {
      let from = path.join(fromPath, file);
      let to = path.join(config.dest, template.name.kebab, _.replace(file, /_entity/g, template.name.kebab));

      this.util.copyTpl(from, to, template);
    });

    // Adicionar imports no app.module.ts
    this._addModuleImports(template);
    
  }

  createComponent(component, config) {
    config = config || {};
    config.dest = config.dest || 'frontend/src/app/';
    const fromPath = 'frontend/component/';
    const template = component;
    const files = [
      '_component.e2e-spec.ts',
      '_component.html',
      '_component.scss',
      '_component.spec.ts',
      '_component.ts'
    ];
    files.map((file) => {
      let from = path.join(fromPath, file);
      let to = path.join(config.dest, template.name.kebab, _.replace(file, /_component/g, template.name.kebab));

      this.util.copyTpl(from, to, template);
    });
  }

  createPage(page, config) {
    config = config || {};
    config.dest = config.dest || 'frontend/src/app/';
    const fromPath = 'frontend/page/';
    const template = page;
    const files = [
      '_page.e2e-spec.ts',
      '_page.html',
      '_page.ts'
    ];
    files.map((file) => {
      let from = path.join(fromPath, file);
      let to = path.join(config.dest, template.name.kebab, _.replace(file, /_page/g, template.name.kebab));

      this.util.copyTpl(from, to, template);
    });
  }

  createService(endpoint, config) {
    config = config || {};
    config.dest = config.dest || 'frontend/src/app/';
    const fromPath = 'frontend/provider/';
    const template = endpoint;
    const files = [
      '_provider.service.ts'
    ];
    files.map((file) => {
      let from = path.join(fromPath, file);
      let to = path.join(config.dest, template.name.kebab, _.replace(file, /_provider/g, template.name.kebab));

      this.util.copyTpl(from, to, template);
    });
  }

  /**
   * Importa um sub módulo no módulo principal app.module.ts
   */
  _addModuleImports(template) {

    var templatePath = this.vm.destinationPath('frontend/src/app/app.module.ts');
    this.fs.copy(templatePath, templatePath, {
      process: function (content) {

        // Utilizando RegExp enquanto não tem um bom parser para typescript
        var regEx = new RegExp('imports\\:\\s*\\t*\\r*\\n*\\[');
        var newContent = content.toString().replace(regEx, 'imports: [\n\t\t' + template.name.capital + 'Module,\n');
        newContent = 'import { ' + template.name.capital + 'Module } from \'./' + template.name.lower + '\';\n' + newContent;
        return newContent;

      }
    });
    this.fs.commit(function () { });

  }
};
