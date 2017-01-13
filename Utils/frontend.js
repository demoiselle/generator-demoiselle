const Util = require('./util');
const _ = require('lodash');

module.exports = class FrontendUtil {

  constructor(vm) {
    this.vm = vm;
    this.util = new Util(vm);
  }

  createEntity(entity, config) {
    config = config || {};
    config.dest = config.dest || 'frontend/src/app/entity/';
    const fromPath = 'frontend/entity/';
    const template = Util.buildEntityTemplate(entity);
    const files = [
      // ENTITY
      '_entity.module.ts',
      '_entity-routing.module.ts',
      '_entity.component.ts',
      '_entity.component.spec.ts',
      '_entity.component.html',
      '_entity.component.scss',
      // shared
      'shared/_entity.model.ts',
      'shared/_entity.service.ts',
      'shared/_entity.service.spec.ts',
      // details
      'details/_entity-details.component.ts',
      'details/_entity-details.component.spec.ts',
      'details/_entity-details.component.html',
      'details/_entity-details.component.scss',
      // form
      'form/_entity-form.component.ts',
      'form/_entity-form.component.spec.ts',
      'form/_entity-form.component.html',
      'form/_entity-form.component.scss',
      // list
      'list/_entity-list.component.ts',
      'list/_entity-list.component.spec.ts',
      'list/_entity-list.component.html',
      'list/_entity-list.component.scss'
    ];
    files.map((file) => {
      let from = fromPath + file;
      let to = config.dest + _.replace(file, /_entity/g, template.name.kebab);

      this.util.copyTpl(from, to, template);
    });
  }

  createComponent(component, config) {
    config = config || {};
    config.dest = config.dest || 'frontend/src/app/component/';
    const fromPath = 'frontend/component/';
    const template = Util.buildComponentTemplate(component);
    const files = [
      '_component.component.e2e.ts',
      '_component.component.html',
      '_component.component.scss',
      '_component.component.spec.ts',
      '_component.component.ts'
    ];
    files.map((file) => {
      let from = fromPath + file;
      let to = config.dest + _.replace(file, /_component/g, template.name.kebab);

      this.util.copyTpl(from, to, template);
    });
  }

  createPage(page, config) {
    config = config || {};
    config.dest = config.dest || 'frontend/src/app/page/';
    const fromPath = 'frontend/page/';
    const template = { name: Util.createNames(page.name) };
    const files = [
      '_page.e2e.ts',
      '_page.html',
      '_page.ts'
    ];
    files.map((file) => {
      let from = fromPath + file;
      let to = config.dest + template.name.kebab + '/' + _.replace(file, /_page/g, template.name.kebab);

      this.util.copyTpl(from, to, template);
    });
  }
};
