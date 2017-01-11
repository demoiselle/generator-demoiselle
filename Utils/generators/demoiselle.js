const Generator = require('yeoman-generator');
const _ = require('lodash');

const fEntitySrc = 'frontend/entity/';
const fEntityDist = 'frontend/src/app/entity/';

module.exports = class DemoiselleGenerator extends Generator {
  constructor(args, opts) {
    super(args, opts);
    console.log('[DemoiselleGenerator] constructor()');

    let newSourceRoot = super.sourceRoot() + '/../../../Utils/templates/';
    super.sourceRoot(newSourceRoot);
    console.log('[DemoiselleGenerator] new sourceRoot():', super.sourceRoot());
  }

  _buildTemplateName(name) {
    return {
      name: name,
      kebab: _.kebabCase(name),
      snake: _.snakeCase(name),
      camel: _.camelCase(name),
      capital: _.upperFirst(_.camelCase(name))
    };
  }

  _generateFrontendEntity(entity) {
    let template = {
      entity: entity
    };
    console.log('template.entity.properties', template.entity.properties);
    let path = fEntityDist + entity.name.kebab + '/';

    let paths = [
      {
        src: fEntitySrc + '_entity.module.ts',
        dest: path + entity.name.kebab + '.module.ts'
      },
      {
        src: fEntitySrc + '_entity-routing.module.ts',
        dest: path + entity.name.kebab + '-routing.module.ts'
      },
      {
        src: fEntitySrc + '_entity.component.ts',
        dest: path + entity.name.kebab + '.component.ts'
      },
      {
        src: fEntitySrc + '_entity.component.spec.ts',
        dest: path + entity.name.kebab + '.component.spec.ts'
      },
      {
        src: fEntitySrc + '_entity.component.html',
        dest: path + entity.name.kebab + '.component.html'
      },
      {
        src: fEntitySrc + '_entity.component.scss',
        dest: path + entity.name.kebab + '.component.scss'
      }
    ];

    this._generateFiles(paths, template);
  }

  _generateFrontendEntityShared(entity) {
    let template = {
      entity: entity
    };
    let path = fEntityDist + entity.name.kebab + '/shared/';

    let paths = [
      {
        src: fEntitySrc + 'shared/_entity.model.ts',
        dest: path + entity.name.kebab + '.model.ts'
      },
      {
        src: fEntitySrc + 'shared/_entity.service.ts',
        dest: path + entity.name.kebab + '.service.ts'
      },
      {
        src: fEntitySrc + 'shared/_entity.service.spec.ts',
        dest: path + entity.name.kebab + '.service.spec.ts'
      }
    ];

    this._generateFiles(paths, template);
  }

  _generateFrontendEntityDetails(entity) {
    let template = {
      entity: entity
    };
    let path = fEntityDist + entity.name.kebab + '/details/';

    let paths = [
      {
        src: fEntitySrc + 'details/_entity-details.component.ts',
        dest: path + entity.name.kebab + '-details.component.ts'
      },
      {
        src: fEntitySrc + 'details/_entity-details.component.spec.ts',
        dest: path + entity.name.kebab + '-details.component.spec.ts'
      },
      {
        src: fEntitySrc + 'details/_entity-details.component.html',
        dest: path + entity.name.kebab + '-details.component.html'
      },
      {
        src: fEntitySrc + 'details/_entity-details.component.scss',
        dest: path + entity.name.kebab + '-details.component.scss'
      }];

    this._generateFiles(paths, template);
  }

  _generateFrontendEntityForm(entity) {
    let template = {
      entity: entity
    };
    let path = fEntityDist + entity.name.kebab + '/form/';

    let paths = [
      {
        src: fEntitySrc + 'form/_entity-form.component.ts',
        dest: path + entity.name.kebab + '-form.component.ts'
      },
      {
        src: fEntitySrc + 'form/_entity-form.component.spec.ts',
        dest: path + entity.name.kebab + '-form.component.spec.ts'
      },
      {
        src: fEntitySrc + 'form/_entity-form.component.html',
        dest: path + entity.name.kebab + '-form.component.html'
      },
      {
        src: fEntitySrc + 'form/_entity-form.component.scss',
        dest: path + entity.name.kebab + '-form.component.scss'
      }];

    this._generateFiles(paths, template);
  }

  _generateFrontendEntityList(entity) {
    let template = {
      entity: entity
    };
    let path = fEntityDist + entity.name.kebab + '/list/';

    let paths = [
      {
        src: fEntitySrc + 'list/_entity-list.component.ts',
        dest: path + entity.name.kebab + '-list.component.ts'
      },
      {
        src: fEntitySrc + 'list/_entity-list.component.spec.ts',
        dest: path + entity.name.kebab + '-list.component.spec.ts'
      },
      {
        src: fEntitySrc + 'list/_entity-list.component.html',
        dest: path + entity.name.kebab + '-list.component.html'
      },
      {
        src: fEntitySrc + 'list/_entity-list.component.scss',
        dest: path + entity.name.kebab + '-list.component.scss'
      }];

    this._generateFiles(paths, template);
  }

  /**
   * exemplo paths:
   * {
   *  'template-path/file.ext': 'destination-path/other-file.ext'
   * };
   */
  _generateFiles(paths, template) {
    paths.forEach(path => {
      this.fs.copyTpl(
        this.templatePath(path.src),
        this.destinationPath(path.dest),
        template
      );
    });
  }

  _parseType(type) {
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
};
