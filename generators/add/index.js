const Generator = require('yeoman-generator');
const Util = require('../../Utils/util');
const FrontendUtil = require('../../Utils/frontend');
const BackendUtil = require('../../Utils/backend');
// const _ = require('lodash');

/**
 * yo demoiselle:add entity-name
 *
 * Gerador para:
 * - components
 * - entities
 * - pages
 * - ? -> peça o seu via issue ou envie um PR.
 */
module.exports = class AddGenerator extends Generator {

  constructor(args, opts) {
    super(args, opts);

    this.frontendUtil = new FrontendUtil(this);
    this.backendUtil = new BackendUtil(this);
    Util.changeRootPath(this);

    // Arguments - passados direto pela cli (ex.: yo demoiselle:add my-feature)
    this.argument('template', { required: false });
    this.argument('name', { required: false });

    // Options - parecido com "argument", mas vão como "flags" (--option)
    this.option('skip-frontend');
    this.option('skip-backend');
  }

  /**
   * Your initialization methods (checking current project state, getting configs, etc)
   */
  initializing() {
    // this.log('[initializing] done.');
  }

  /**
   * Where you prompt users for options (where you'd call this.prompt())
   * Examples: name of app? which frameworks? which template engine?
   */
  prompting() {
    let prompts = [];

    if (!this.options.template) {
      prompts.push({
        type: 'list',
        name: 'template',
        message: 'Qual template você quer gerar?',
        default: 'entity',
        choices: [{
          name: 'Entidade (CRUD)',
          value: 'entity'
        }, {
          name: 'Componente',
          value: 'component'
        }, {
          name: 'Página',
          value: 'page'
        }/*, {
          name: 'Serviço',
          value: 'service'
        }*/]
      });
    }

    if (!this.options.name) {
      prompts.push({
        type: 'input',
        name: 'name',
        message: 'Dê um nome para o novo template:',
        default: 'MyExample'
      });
    }

    return this.prompt(prompts).then(function (answers) {
      this.answers = answers;
      this.options.template = this.options.template || answers.template;
      this.options.name = this.options.name || answers.name;
    }.bind(this));
  }

  /**
   * Where you write the generator specific files (routes, controllers, etc)
   */
  writing() {
    let fn = {
      entity: this._writeEntity,
      component: this._writeComponent,
      page: this._writePage,
    };

    let template = this.options.template;
    if (template in fn) {
      fn[template].bind(this)();
    } else {
      this.log('Template não implementado:' + this.options.template);
    }
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

  _writeEntity() {
    let entity = {
      name: Util.createNames(this.options.name),
      properties: [{
        name: 'id',
        type: 'integer',
        format: 'int32',
        description: 'Unique identifier',
      }, {
        name: 'description',
        type: 'string',
        description: 'Description of entity',
      }]
    };

    // Generate Entity CRUD
    if (!this.options['skip-frontend']) {
      this.frontendUtil.createEntity(entity);
    }
    if (!this.options['skip-backend']) {
      this.backendUtil.createEntity(entity);
    }
  }

  _writeComponent() {
    let component = {
      name: Util.createNames(this.options.name)
    };

    if (!this.options['skip-frontend']) {
      this.frontendUtil.createComponent(component);
    }
  }

  _writePage() {
    let page = {
      name: Util.createNames(this.options.name)
    };

    if (!this.options['skip-frontend']) {
      this.frontendUtil.createPage(page);
    }
  }
};

