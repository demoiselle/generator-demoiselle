const _ = require('lodash');

module.exports = class Util {

  constructor(vm) {

  }

  static createNames(name) {
    return {
      name: name,
      kebab: _.kebabCase(name),
      snake: _.snakeCase(name),
      camel: _.camelCase(name),
      capital: _.upperFirst(_.camelCase(name))
    };
  }

  static parseEntity(entity) {
    if (typeof entity === 'string') {
      entity = {
        name: Util.createNames(entity)
      };
    }

    entity.properties = entity.properties || [];

    return entity;
  }

  static buildEntityTemplate(entity) {
    Util.parseEntity(entity);

    let template = {
      name: entity.name,
      properties: entity.properties || []
    };
    return template;
  }

  static buildComponentTemplate(component) {
    let template = {
      name: component.name
    };
    return template;
  }

  static parseType(type) {
    let resultType;
    switch (type) {
      case 'integer':
        resultType = 'number';
        break;
      default:
        resultType = 'string';
        break;
    }
    return resultType;
  }

  createFiles(paths, template) {
    paths.forEach(path => Util.copyTpl(path.src, path.dest, template));
  }

  copyTpl(src, dest, template) {
    this.vm.fs.copyTpl(
      this.templatePath(src),
      this.destinationPath(dest),
      template
    );
  }
};
