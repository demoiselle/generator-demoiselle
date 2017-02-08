const _ = require('lodash');
const path = require('path');

module.exports = class Util {

  constructor(vm) {
    this.vm = vm;
  }

  static changeRootPath(vm) {
    // Set sourceRoot to Utils/templates
    let oldPath = vm.sourceRoot();
    vm.sourceRoot(path.join(oldPath, '/../../../Utils/templates'));
  }

  static createNames(name) {
    return {
      name: name,
      kebab: _.kebabCase(name),
      snake: _.snakeCase(name),
      camel: _.camelCase(name),
      capital: _.upperFirst(_.toLower(name)),
      lower: _.toLower(name)
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

  static buildComponentTemplate(component) {
    let template = {
      name: component.name
    };
    return template;
  }

  // static getCommonType(type, format) {
  //   // Examples of Data Types
  //   // https://gist.github.com/arno-di-loreto/5a3df2250721fb154060#file-simple_openapi_specification_14_advanced_data_modeling-yaml
  //   // ref.: http://apihandyman.io/writing-openapi-swagger-specification-tutorial-part-4-advanced-data-modeling/
  //   let commonTypes = {
  //     integer: {
  //       int32: 'integer',
  //       int64: 'long'
  //     },
  //     number: {
  //       float: 'float',
  //       double: 'double'
  //     },
  //     string: {
  //       string: 'string',
  //       byte: 'byte',
  //       binary: 'binary'
  //     },
  //     boolean: 'boolean'
  //   };

  //   if (commonTypes[type] && commonTypes[type][format]) {
  //     return commonTypes[type] && commonTypes[type][format];
  //   }

  //   // if (commonTypes[type]) {
  //   //   return commonTypes[type];
  //   // }

  //   return type;
  // }

  createFiles(paths, template) {
    paths.forEach(path => Util.copyTpl(path.src, path.dest, template));
  }

  copyTpl(src, dest, template) {
    this.vm.fs.copyTpl(
      this.vm.templatePath(src),
      this.vm.destinationPath(dest),
      template
    );
  }
};
