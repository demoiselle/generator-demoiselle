const Generator = require('yeoman-generator');
const Util = require('../../Utils/util');
// const _ = require('lodash');
const chalk = require('chalk');
const yosay = require('yosay');

/**
 * yo demoiselle <project-name>
 *
 * Demoiselle generator for new projects.
 */
module.exports = class AppGenerator extends Generator {
  constructor(args, opts) {
    super(args, opts);

    // Muda o caminho dos arquivos de templates.
    Util.changeRootPath(this);

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
    this.option('skip-message');
    this.option('skip-install');
    this.option('skip-frontend');
    this.option('skip-backend');
  }

  /**
   * Your initialization methods (checking current project state, getting configs, etc)
   */
  initializing() {
    // this.log('[initializing] done.');
    if (!this.options['skip-message']) {
      this.log(yosay(
        'Bem vindo ao ' + chalk.red('generator-demoiselle') + '. Começe seu projeto!'
      ));
    }
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

    return this.prompt(prompts).then(function (answers) {
      this.answers = answers;
      this.name = this.options.project || answers.project;
      this.prefix = this.options.prefix || answers.prefix;
    }.bind(this));
  }

  /**
   * Where you write the generator specific files (routes, controllers, etc)
   */
  writing() {
    // Generate Project
    if (!this.options['skip-frontend']) {
      this._generateTodoProjectFrontend();
    }

    if (!this.options['skip-backend']) {
      this._generateTodoProjectBackend();
    }
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

  _generateTodoProjectFrontend() {
    let template = {
      name: Util.createNames(this.name),
      prefix: Util.createNames(this.prefix)
    };

    let from = this.templatePath('todo/frontend/');
    let to = this.destinationPath('frontend/');
    this.fs.copyTpl(from, to, template);
  }

  _generateTodoProjectBackend() {
    let template = {
      name: Util.createNames(this.name)
    };

    let from = this.templatePath('todo/backend/');
    let to = this.destinationPath('backend/');
    this.fs.copyTpl(from, to, template);
  }
};

