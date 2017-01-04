'use strict';
const Generator = require('yeoman-generator');
const cheerio = require('cheerio');
const htmlWiring = require('html-wiring');
const _ = require('lodash');

/**
 * yo demoiselle:add <entity-name>
 * Demoiselle generator for new entities
 */
module.exports = class extends Generator {

  constructor(args, opts) {
    super(args, opts);

    // Arguments - passados direto pela cli (ex.: yo demoiselle:add my-feature)
    this.argument('entity', {
      desc: 'Nome da entidade a ser criada. (ex.: Pessoa)',
      type: String,
      required: false
    });

    // Options - parecido com "argument", mas vão como "flags" (--option)
    this.option('output', {
      desc: '[backend,frontend] - Camadas a serem geradas',
      alias: 'o',
      type: String
    });
  }

  /**
   * Your initialization methods (checking current project state, getting configs, etc)
   */
  initializing() {
    this.log('[initializing] done.');
  }

  /**
   * Where you prompt users for options (where you'd call this.prompt())
   * Examples: name of app? which frameworks? which template engine?
   */
  prompting() {
    let prompts = [];

    if (!this.options.entity) {
      prompts.push({
        type: 'input',
        name: 'entity',
        message: 'Dê um nome para a nova entidade:',
        default: 'Todo'
      });
    }

    if (this.options.output) {
      this.options.output = this.options.output.split(',');
    } else {
      prompts.push({
        type: 'checkbox',
        name: 'output',
        message: 'Quais camadas você quer gerar?',
        choices: [{
          name: 'Backend - Demoiselle 3 Server JEE7 (REST)',
          value: 'backend',
          short: 'backend'
        }, {
          name: 'Frontend - Angular2',
          value: 'frontend',
          short: 'frontend'
        }]
      });
    }

    return this.prompt(prompts).then(function (answers) {
      this.answers = answers;
      this.name = this.options.entity || answers.entity;
      this.output = this.options.output || answers.output;
    }.bind(this));
  }

  /**
   * Where you write the generator specific files (routes, controllers, etc)
   */
  writing() {
    // entityName
    let name = this.name;

    // Generate Frontend CRUD?
    this._generateFrontendEntity(name);
    this._generateFrontendEntityShared(name);
    this._generateFrontendEntityList(name);
    this._generateFrontendEntityForm(name);
    this._generateFrontendEntityDetails(name);
  }

  /**
   * Where conflicts are handled (used internally)
   */
  conflicts() {
    this.log('[conflicts] done.');
  }

  /**
   * Where installation are run (npm, bower)
   */
  install() {
    this.log('[install] done.');
  }

  /**
   * Called last, cleanup, say good bye, etc
   */
  end() {
    this.log('[end] done.');
  }

  // ---------------
  // PRIVATE methods
  // ---------------

  _buildTemplateName(name) {
    return {
      name: {
        name: name,
        kebab: _.kebabCase(name),
        snake: _.snakeCase(name),
        camel: _.camelCase(name),
        capital: _.upperFirst(_.camelCase(name))
      }
    };
  }

  _generateBackend(name) {
    let template = this._buildTemplateName(name);
    let backendFileMap = {
      'backend/src/main/java/app/business/_pojoBC.java': 'backend/src/main/java/app/business/' + template.name.capital + 'BC.java',
      'backend/src/main/java/app/entity/_pojo.java': 'backend/src/main/java/app/entity/' + template.name.capital + '.java',
      'backend/src/main/java/app/persistence/_pojoDAO.java': 'backend/src/main/java/app/persistence/' + template.name.capital + 'DAO.java',
      'backend/src/main/java/app/service/_pojoREST.java': 'backend/src/main/java/app/service/' + template.name.capital + 'REST.java'
    };
    this._generateFiles(backendFileMap, template);
    // include feature on persistence XML
    let persistenceXML = cheerio.load(htmlWiring.readFileAsString('backend/src/main/resources/META-INF/persistence.xml'), {xmlMode: true});
    persistenceXML('jta-data-source').after('<class>app.entity.' + template.name.capital + '</class>');
    this.fs.write('backend/src/main/resources/META-INF/persistence.xml', persistenceXML.html());
  }

  _generateFrontendEntity(name) {
    let template = this._buildTemplateName(name);
    let path = 'frontend/src/app/' + template.name.kebab + '/';

    let fileMap = {
      'frontend/entity/_entity.module.ts': path + template.name.kebab + '.module.ts',
      'frontend/entity/_entity-routing.module.ts': path + template.name.kebab + '-routing.module.ts',
      'frontend/entity/_entity.component.ts': path + template.name.kebab + '.component.ts',
      'frontend/entity/_entity.component.spec.ts': path + template.name.kebab + '.component.spec.ts',
      'frontend/entity/_entity.component.html': path + template.name.kebab + '.component.html',
      'frontend/entity/_entity.component.scss': path + template.name.kebab + '.component.scss'
    };

    this._generateFiles(fileMap, template);
  }

  _generateFrontendEntityShared(name) {
    let template = this._buildTemplateName(name);
    let path = 'frontend/src/app/' + template.name.kebab + '/shared/';

    let fileMap = {
      'frontend/entity/shared/_entity.model.ts': path + template.name.kebab + '.model.ts',
      'frontend/entity/shared/_entity.service.ts': path + template.name.kebab + '.service.ts',
      'frontend/entity/shared/_entity.service.spec.ts': path + template.name.kebab + '.service.spec.ts'
    };

    this._generateFiles(fileMap, template);
  }

  _generateFrontendEntityDetails(name) {
    let template = this._buildTemplateName(name);
    let path = 'frontend/src/app/' + template.name.kebab + '/details/';

    let fileMap = {
      'frontend/entity/details/_entity-details.component.ts': path + template.name.kebab + '-details.component.ts',
      'frontend/entity/details/_entity-details.component.spec.ts': path + template.name.kebab + '-details.component.spec.ts',
      'frontend/entity/details/_entity-details.component.html': path + template.name.kebab + '-details.component.html',
      'frontend/entity/details/_entity-details.component.scss': path + template.name.kebab + '-details.component.scss'
    };

    this._generateFiles(fileMap, template);
  }

  _generateFrontendEntityForm(name) {
    let template = this._buildTemplateName(name);
    let path = 'frontend/src/app/' + template.name.kebab + '/form/';

    let fileMap = {
      'frontend/entity/form/_entity-form.component.ts': path + template.name.kebab + '-form.component.ts',
      'frontend/entity/form/_entity-form.component.spec.ts': path + template.name.kebab + '-form.component.spec.ts',
      'frontend/entity/form/_entity-form.component.html': path + template.name.kebab + '-form.component.html',
      'frontend/entity/form/_entity-form.component.scss': path + template.name.kebab + '-form.component.scss'
    };

    this._generateFiles(fileMap, template);
  }

  _generateFrontendEntityList(name) {
    let template = this._buildTemplateName(name);
    let path = 'frontend/src/app/' + template.name.kebab + '/list/';

    let fileMap = {
      'frontend/entity/list/_entity-list.component.ts': path + template.name.kebab + '-list.component.ts',
      'frontend/entity/list/_entity-list.component.spec.ts': path + template.name.kebab + '-list.component.spec.ts',
      'frontend/entity/list/_entity-list.component.html': path + template.name.kebab + '-list.component.html',
      'frontend/entity/list/_entity-list.component.scss': path + template.name.kebab + '-list.component.scss'
    };

    this._generateFiles(fileMap, template);
  }

  _generateFiles(fileMap, template) {
    for (let key in fileMap) {
      if (Object.prototype.hasOwnProperty.call(fileMap, key)) {
        let dest = fileMap[key];
        this.fs.copyTpl(
          this.templatePath(key),
          this.destinationPath(dest),
          template
        );
      }
    }
  }
};

