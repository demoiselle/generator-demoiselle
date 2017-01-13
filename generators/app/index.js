'use strict';
const Generator = require('yeoman-generator');
// const chalk = require('chalk');
// const yosay = require('yosay');
// const htmlWiring = require('html-wiring');
const _ = require('lodash');

/**
 * yo demoiselle <project-name>
 *
 * Demoiselle generator for new projects.
 */
module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    // Arguments - passados direto pela cli (ex.: yo demoiselle:add my-feature)
    this.argument('project', {
      desc: 'Nome do projeto',
      type: String,
      required: false
    });

    this.argument('prefix', {
      desc: 'prefixo dos componentes',
      type: String,
      required: false
    });

    // Options - parecido com "argument", mas vão como "flags" (--option)
    this.option('skip-install');
    // this.option('template', {
    //   desc: '[Todo,Store] - Template a ser utilizado',
    //   alias: 't',
    //   type: String
    // });
  }

  /**
   * Your initialization methods (checking current project state, getting configs, etc)
   */
  initializing() {
    // this.log(yosay(
    //   'Bem vindo ao ' + chalk.red('generator-demoiselle') + '. Crie sua app aqui!'
    // ));
    // this.log('[initializing] done.');
  }

  /**
   * Where you prompt users for options (where you'd call this.prompt())
   * Examples: name of app? which frameworks? which template engine?
   */
  prompting() {
    let prompts = [];

    if (!this.options.project) {
      prompts.push({
        type: 'input',
        name: 'project',
        message: 'Dê um nome para o seu projeto:',
        default: 'Todo'
      });
    }

    if (!this.options.prefix) {
      prompts.push({
        type: 'input',
        name: 'project',
        message: 'Dê um prefixo para os seus componentes:',
        default: 'my'
      });
    }

    // if (!this.options.template) {
    //   prompts.push({
    //     type: 'list',
    //     name: 'template',
    //     message: 'Qual modelo você deseja gerar?',
    //     choices: [{
    //       name: 'Todo - Aplicação simples com usuário e uma entidade (TodoEntity)',
    //       value: 'todo',
    //       short: 'todo'
    //     }, {
    //       name: 'Store - Loja simples',
    //       value: 'store',
    //       short: 'store'
    //     }]
    //   });
    // }

    return this.prompt(prompts).then(function (answers) {
      this.answers = answers;
      this.name = this.options.project || answers.project;
      this.prefix = this.options.prefix || answers.prefix;
      // this.template = this.options.template || answers.template;
    }.bind(this));
  }

  /**
   * Where you write the generator specific files (routes, controllers, etc)
   */
  writing() {
    // Generate Project
    this._generateTodoProjectFrontend();
    // this._generateTodoProjectBackend(name);
  }

  /**
   * Where conflicts are handled (used internally)
   */
  conflicts() {
    // this.log('[conflicts] done.');
  }

  /**
   * Where installation are run (npm, bower)
   */
  install() {
    let skipInstall = this.options['skip-install'];

    this.installDependencies({
      skipInstall: skipInstall,
      npm: true,
      bower: false,
      yarn: false
    });

    this.log('[install] done.');
  }

  // ---------------
  // PRIVATE methods
  // ---------------

  _buildTemplateName(name) {
    return {
      name: name,
      kebab: _.kebabCase(name),
      snake: _.snakeCase(name),
      camel: _.camelCase(name),
      capital: _.upperFirst(_.camelCase(name))
    };
  }

  _generateTodoProjectFrontend() {
    let template = {
      name: this._buildTemplateName(this.name),
      prefix: this._buildTemplateName(this.prefix)
    };

    this.fs.copyTpl(this.templatePath('todo/frontend/'), this.destinationPath('frontend/'), template);
  }

  _generateTodoProjectBackend(name) {
    this.log('TODO: generate frontend project for', name);

    let template = this._buildTemplateName(name);
    // TODO: create --prefix option
    if (!template.prefix) {
      template.prefix = template.name;
    }
    this.fs.copyTpl(this.templatePath('todo/backend/'), this.destinationPath('backend/'), template);
  }
};

