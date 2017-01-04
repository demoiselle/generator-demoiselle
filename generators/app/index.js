'use strict';
const Generator = require('yeoman-generator');
const cheerio = require('cheerio');
const htmlWiring = require('html-wiring');
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
    this.log(yosay(
      'Bem vindo ao ' + chalk.red('generator-demoiselle') + '. Crie sua app aqui!'
    ));
    this.log('[initializing] done.');
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
        default: 'TodoApp'
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
      // this.template = this.options.template || answers.template;
    }.bind(this));
  }

  /**
   * Where you write the generator specific files (routes, controllers, etc)
   */
  writing() {
    // project name
    let name = this.name;

    // Generate Project
    this._generateTodoProjectFrontend(name);
    this._generateTodoProjectBackend(name);
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
    let skipInstall = this.options['skip-install'];

    this.installDependencies({
      skipInstall: skipInstall,
      npm: true,
      bower: false,
      yarn: false
    });

    this.log('[install] done.');
  }

  _generateTodoProjectFrontend(name){
    this.fs.copy(this.templatePath('frontend/'), this.destinationPath('frontend/'));
  }

  _generateTodoProjectBackend(name){
    this.fs.copy(this.templatePath('backend/'), this.destinationPath('backend/'));
  }
});

