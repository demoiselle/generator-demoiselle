const Generator = require('yeoman-generator');
const Util = require('../../Utils/util');
const chalk = require('chalk');
const yosay = require('yosay');

var execSync = require('child_process').execSync;

/**
 * yo demoiselle <project-name>
 *
 * Demoiselle generator for new projects.
 */
module.exports = class AppGenerator extends Generator {
  constructor(args, opts) {
    super(args, opts);

    // Change the path to the Util/templates
    Util.changeRootPath(this);

    // Arguments - passados direto pela cli (ex.: yo demoiselle my-project package myprefix)
    this.argument('project', {
      desc: 'Nome do projeto',
      type: String,
      required: false
    });

    this.argument('package', {
      desc: 'Pacote do backend',
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
        default: 'app'
      });
    }

    if (!this.options.package) {
      prompts.push({
        type: 'input',
        name: 'package',
        message: 'Informe o package do backend:',
        default: 'org.demoiselle'
      });
    }

    if (!this.options.prefix) {
      prompts.push({
        type: 'input',
        name: 'prefix',
        message: 'Dê um prefixo para os seus componentes:',
        default: 'app'
      });
    }

    if (!this.options['skip-frontend'] && !this.options['skip-backend']) {
      prompts.push({
        type: 'checkbox',
        name: 'skips',
        message: 'Você quer gerar arquivos para:',
        choices: [{
          name: 'frontend',
          checked: true
        }, {
          name: 'backend',
          checked: true
        }]
      });
    }

    if (!this.options['skip-install']) {
      prompts.push({
        type: 'confirm',
        name: 'do-install',
        message: 'Deseja instalar as dependências (isso pode demorar alguns minutos)?',
        default: false
      });
    }

    return this.prompt(prompts).then(function (answers) {
      this.answers = answers;
      this.project = this.options.project || answers.project;
      this.package = this.options.package || answers.package;
      this.prefix = this.options.prefix || answers.prefix;
      if (!this.options['skip-frontend'] && !this.options['skip-backend']) {
        this.options['skip-frontend'] = !(answers.skips.indexOf('frontend') > -1);
        this.options['skip-backend'] = !(answers.skips.indexOf('backend') > -1);
      }
      if (!this.options['skip-install']) {
        this.options['skip-install'] = !answers['do-install'];
      }

      // store config values for later use
      this.config.set('project', this.project);
      this.config.set('package', this.package);
      this.config.set('prefix', this.prefix);

    }.bind(this));
  }

  /**
   * Where you write the generator specific files (routes, controllers, etc)
   */
  writing() {
    // Generate Project
    if (!this.options['skip-frontend']) {
      this._generateProjectFrontend();
    } else {
      this.log('[writing] frontend ignored.');
    }

    if (!this.options['skip-backend']) {
      this._generateProjectBackend();
    } else {
      this.log('[writing] backend ignored.');
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

    if (!skipInstall) {
      this.spawnCommand('npm', ['install'], { cwd: 'frontend' });
      this.spawnCommand('mvn', ['install'], { cwd: 'backend' });
    } else {
      this.log('[install] ignored.');
    }
  }

  // ---------------
  // PRIVATE methods
  // ---------------

  _generateProjectFrontend() {
    let template = {
      project: Util.createNames(this.project),
      prefix: Util.createNames(this.prefix)
    };

    this.log('Creating angular/cli frontend! please wait...');
    this.log(execSync('ng new frontend --skip-install --skip-git').toString());

    this._updatePackageJson();
    this._updateAngularCli();

    // replacing src folders and styles.css

    this.fs.delete(this.destinationPath('frontend/src/app'));
    this.fs.delete(this.destinationPath('frontend/src/assets'));
    this.fs.delete(this.destinationPath('frontend/src/environments'));
    this.fs.delete(this.destinationPath('frontend/src/styles.css'));
    this.fs.delete(this.destinationPath('frontend/src/index.html'));
    this.fs.commit(function () { });

    let from = this.templatePath('base/frontend/src/app/');
    let to = this.destinationPath('frontend/src/app/');
    this.fs.copyTpl(from, to, template);

    from = this.templatePath('base/frontend/src/assets/');
    to = this.destinationPath('frontend/src/assets/');
    this.fs.copy(from, to);

    from = this.templatePath('base/frontend/src/environments/');
    to = this.destinationPath('frontend/src/environments/');
    this.fs.copy(from, to);

    from = this.templatePath('base/frontend/src/scss/');
    to = this.destinationPath('frontend/src/scss/');
    this.fs.copyTpl(from, to, template);

    from = this.templatePath('base/frontend/src/styles.css');
    to = this.destinationPath('frontend/src/styles.css');
    this.fs.copyTpl(from, to, template);

    from = this.templatePath('base/frontend/src/index.html');
    to = this.destinationPath('frontend/src/index.html');
    this.fs.copyTpl(from, to, template);

    from = this.templatePath('base/frontend/src/manifest.json');
    to = this.destinationPath('frontend/src/manifest.json');
    this.fs.copyTpl(from, to);

    from = this.templatePath('base/frontend/src/humans.txt');
    to = this.destinationPath('frontend/src/humans.txt');
    this.fs.copyTpl(from, to);

    from = this.templatePath('base/frontend/src/background.js');
    to = this.destinationPath('frontend/src/background.js');
    this.fs.copyTpl(from, to);

    from = this.templatePath('base/frontend/ngsw-manifest.json');
    to = this.destinationPath('frontend/ngsw-manifest.json');
    this.fs.copyTpl(from, to);
  }

  _generateProjectBackend() {
    this.log('Creating backend ...');

    let template = {
      package: Util.createNames(this.package),
      project: Util.createNames(this.project)
    };

    let from = this.templatePath('base/backend/src/main/java/app/');
    let to = this.destinationPath('backend/src/main/java/' + this.package.replace(/\./g, '/').toLowerCase() + '/' + this.project.toLowerCase() + '/');
    this.fs.copyTpl(from, to, template);

    from = this.templatePath('base/backend/src/main/resources/');
    to = this.destinationPath('backend/src/main/resources/');
    this.fs.copyTpl(from, to, template);

    from = this.templatePath('base/backend/src/main/webapp/');
    to = this.destinationPath('backend/src/main/webapp/');
    this.fs.copy(from, to);

    from = this.templatePath('base/backend/pom.xml');
    to = this.destinationPath('backend/pom.xml');
    this.fs.copyTpl(from, to, template);

    from = this.templatePath('base/backend/run-dev.sh');
    to = this.destinationPath('backend/run-dev.sh');
    this.fs.copyTpl(from, to);

    this.log('Backend successfully created.');
  }

  _updatePackageJson() {
    const log = this.log;
    const templatePath = this.destinationPath('frontend/package.json');
    this.fs.copy(templatePath, templatePath, {
      process: function (content) {
        const str = content.toString();
        const obj = JSON.parse(str);

        log('Add npm-scripts into package.json ...');
        obj.scripts['sw'] = 'node src/service-worker/rollup.js';
        obj.scripts['build:dev'] = 'ng build --prod --aot --environment=dev';

        log('Add dependencies into package.json ...');
        obj.dependencies['@demoiselle/http'] = '^2.0.0';
        obj.dependencies['@demoiselle/security'] = '^2.0.0';
        obj.dependencies['angular2-jwt'] = '^0.2.0';
        obj.dependencies['font-awesome'] = '^4.7.0';
        obj.dependencies['bootstrap'] = '^4.0.0-beta.2';
        obj.dependencies['ng2-toastr'] = '^4.1.2';
        obj.dependencies['ngx-bootstrap'] = '^2.0.0-beta.8';
        obj.dependencies['ngx-progressbar'] = '^2.1.1';
        obj.dependencies['simple-line-icons'] = '^2.4.1';
        obj.dependencies['@angular/service-worker'] = '^1.0.0-beta.16';

        log('Add devDependencies into package.json ...');
        obj.devDependencies['rollup'] = '^0.51.8';
        obj.devDependencies['rollup-plugin-commonjs'] = '^8.2.6';
        obj.devDependencies['rollup-plugin-node-resolve'] = '^3.0.0';

        return JSON.stringify(obj, null, 2);
      }
    });
    this.fs.commit(function () { });
  }

  _updateAngularCli() {
    const log = this.log;
    const templatePath = this.destinationPath('frontend/.angular-cli.json');
    this.fs.copy(templatePath, templatePath, {
      process: function (content) {
        const str = content.toString();
        const obj = JSON.parse(str);

        log('Add apps[0].assets into .angular-cli.json ...');
        obj.apps[0].assets.push('manifest.json');
        obj.apps[0].assets.push('humans.text');
        obj.apps[0].assets.push('background.js');
        obj.apps[0].assets.push('schema.json');

        log('Add apps[0].styles into .angular-cli.json ...');
        obj.apps[0].styles.push('scss/style.scss');

        log('Set apps[0].serviceWorker to "true" into .angular-cli.json ...');
        obj.apps[0].serviceWorker = true;

        return JSON.stringify(obj, null, 2);
      }
    });
    this.fs.commit(function () { });
  }
};

