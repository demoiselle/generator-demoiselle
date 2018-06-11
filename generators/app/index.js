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
    const skipInstall = this.options['skip-install'];

    if (skipInstall) {
      this.log('[install] Ignorado.');

      if (!this.options['skip-backend']) {
        this.log('[install] TO-DO: execute manualmente "mvn install" na pasta "/backend".')
      }

      if (!this.options['skip-frontend']) {
        this.log('[install] TO-DO: execute manualmente "npm install" na pasta "/frontend".')
      }
    } else {
      if (!this.options['skip-backend']) {
        this.spawnCommand('mvn', ['install'], { cwd: 'backend' });
      }

      if (!this.options['skip-frontend']) {
        this.spawnCommand('npm', ['install'], { cwd: 'frontend' });
      }
    }
  }

  /**
   * Called last. What can you do? cleanup, say good bye, etc .
   */
  end() {
    this.log(yosay(
      'Estamos pronto para ' + chalk.green('ligar as turbinas') + '.'
    ));
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
    this.fs.copyTpl(from, to, template);

    from = this.templatePath('base/frontend/src/scss/');
    to = this.destinationPath('frontend/src/scss/');
    this.fs.copyTpl(from, to, template);

    from = this.templatePath('base/frontend/src/styles.css');
    to = this.destinationPath('frontend/src/styles.css');
    this.fs.copyTpl(from, to, template);

    from = this.templatePath('base/frontend/src/index.html');
    to = this.destinationPath('frontend/src/index.html');
    this.fs.copyTpl(from, to, template);

    from = this.templatePath('base/frontend/src/ngsw-config.json');
    to = this.destinationPath('frontend/src/ngsw-config.json');
    this.fs.copyTpl(from, to);

    from = this.templatePath('base/frontend/src/manifest.json');
    to = this.destinationPath('frontend/src/manifest.json');
    this.fs.copyTpl(from, to);

    from = this.templatePath('base/frontend/src/sw-app.js');
    to = this.destinationPath('frontend/src/sw-app.js');
    this.fs.copyTpl(from, to);

    from = this.templatePath('base/frontend/src/sw-push.js');
    to = this.destinationPath('frontend/src/sw-push.js');
    this.fs.copyTpl(from, to);

    from = this.templatePath('base/frontend/src/humans.txt');
    to = this.destinationPath('frontend/src/humans.txt');
    this.fs.copyTpl(from, to);

    from = this.templatePath('base/frontend/src/background.js');
    to = this.destinationPath('frontend/src/background.js');
    this.fs.copyTpl(from, to);

    from = this.templatePath('base/frontend/.prettierrc');
    to = this.destinationPath('frontend/.prettierrc');
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

    from = this.templatePath('base/backend/src/main/webapp/WEB-INF');
    to = this.destinationPath('backend/src/main/webapp/WEB-INF');
    this.fs.copyTpl(from, to, template);

    from = this.templatePath('base/backend/src/main/webapp/META-INF');
    to = this.destinationPath('backend/src/main/webapp/META-INF');
    this.fs.copyTpl(from, to, template);

    from = this.templatePath('base/backend/pom.xml');
    to = this.destinationPath('backend/pom.xml');
    this.fs.copyTpl(from, to, template);

    from = this.templatePath('base/backend/run-dev.sh');
    to = this.destinationPath('backend/run-dev.sh');
    this.fs.copyTpl(from, to, template);

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
        obj.scripts['postbuild'] = 'npm run sw';
        obj.scripts['postbuild:dev'] = 'npm run sw';

        log('Add dependencies into package.json ...');
        obj.dependencies['@angular/service-worker'] = '^6.0.4';
        obj.dependencies['@demoiselle/http'] = '^3.0.0';
        obj.dependencies['@demoiselle/security'] = '^3.0.0';
        obj.dependencies['font-awesome'] = '^4.7.0';
        obj.dependencies['bootstrap'] = '^4.0.0-beta.2';
        obj.dependencies['ngx-toastr'] = '^8.7.3';
        obj.dependencies['ngx-bootstrap'] = '^2.0.0-beta.8';
        obj.dependencies['ngx-progressbar'] = '^2.1.1';
        obj.dependencies['simple-line-icons'] = '^2.4.1';
        obj.dependencies['animate.css'] = '^3.5.2';
        obj.dependencies['angularx-social-login'] = '^1.2.0';


        log('Add devDependencies into package.json ...');
        // obj.devDependencies['xxxxxx'] = '^0.51.8';

        return JSON.stringify(obj, null, 2);
      }
    });
    this.fs.commit(function () { });
  }

  _updateAngularCli() {
    const log = this.log;
    const templatePath = this.destinationPath('frontend/angular.json');
    this.fs.copy(templatePath, templatePath, {
      process: function (content) {
        const str = content.toString();
        const obj = JSON.parse(str);

        log('Add assets into angular.json ...');
        obj.projects.frontend.architect.build.options.assets.push('src/manifest.json');
        obj.projects.frontend.architect.build.options.assets.push('src/humans.txt');
        obj.projects.frontend.architect.build.options.assets.push('src/background.js');
        obj.projects.frontend.architect.build.options.assets.push('src/schema.json');
        obj.projects.frontend.architect.build.options.assets.push('src/sw-app.js');
        obj.projects.frontend.architect.build.options.assets.push('src/sw-push.js');

        log('Add styles into angular.json ...');
        obj.projects.frontend.architect.build.options.styles.push('src/scss/style.scss');

        log('Set serviceWorker to "true" into angular.json ...');
        obj.projects.frontend.architect.build.configurations.production.serviceWorker = true;
        obj.projects.frontend.architect.build.configurations.production.ngswConfigPath = 'src/ngsw-config.json';

        return JSON.stringify(obj, null, 2);
      }
    });
    this.fs.commit(function () { });
  }
};

