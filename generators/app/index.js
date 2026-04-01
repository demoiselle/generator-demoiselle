const Generator = require('yeoman-generator');
const Util = require('../../Utils/util');
const chalk = require('chalk');
const yosay = require('yosay');

var execSync = require('child_process').execSync;

/**
 * yo demoiselle <project-name>
 *
 * Gerador Demoiselle 4.0 — Jakarta EE + Vue.js 3 + Flutter
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
    this.option('skip-mobile');
  }

  /**
   * Your initialization methods (checking current project state, getting configs, etc)
   */
  initializing() {
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

    if (!this.options['skip-frontend'] && !this.options['skip-backend'] && !this.options['skip-mobile']) {
      prompts.push({
        type: 'checkbox',
        name: 'skips',
        message: 'Você quer gerar arquivos para:',
        choices: [{
          name: 'backend',
          checked: true
        }, {
          name: 'frontend',
          checked: true
        }, {
          name: 'mobile',
          checked: false
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
      if (!this.options['skip-frontend'] && !this.options['skip-backend'] && !this.options['skip-mobile']) {
        this.options['skip-frontend'] = !(answers.skips.indexOf('frontend') > -1);
        this.options['skip-backend'] = !(answers.skips.indexOf('backend') > -1);
        this.options['skip-mobile'] = !(answers.skips.indexOf('mobile') > -1);
      }
      if (!this.options['skip-install']) {
        this.options['skip-install'] = !answers['do-install'];
      }

      // store config values for later use
      this.config.set('project', this.project);
      this.config.set('package', this.package);
      this.config.set('prefix', this.prefix);
      this.config.set('mobile', !this.options['skip-mobile']);

    }.bind(this));
  }

  /**
   * Where you write the generator specific files (routes, controllers, etc)
   */
  writing() {
    // Verificar ferramentas necessárias
    this._checkRequiredTools();

    // Generate Project
    if (!this.options['skip-frontend']) {
      this._generateProjectFrontend();
    } else {
      this.log(chalk.yellow('[escrita] Frontend ignorado.'));
    }

    if (!this.options['skip-backend']) {
      this._generateProjectBackend();
    } else {
      this.log(chalk.yellow('[escrita] Backend ignorado.'));
    }

    if (!this.options['skip-mobile']) {
      this._generateProjectMobile();
    } else {
      this.log(chalk.yellow('[escrita] Mobile ignorado.'));
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
      this.log(chalk.yellow('[instalação] Ignorado.'));

      if (!this.options['skip-backend']) {
        this.log(chalk.cyan('[instalação] Execute manualmente "mvn install" na pasta "/backend".'));
      }

      if (!this.options['skip-frontend']) {
        this.log(chalk.cyan('[instalação] Execute manualmente "npm install" na pasta "/frontend".'));
      }

      if (!this.options['skip-mobile']) {
        this.log(chalk.cyan('[instalação] Execute manualmente "flutter pub get" na pasta "/mobile".'));
      }
    } else {
      if (!this.options['skip-backend']) {
        this.spawnCommand('mvn', ['install'], { cwd: 'backend' });
      }

      if (!this.options['skip-frontend']) {
        this.spawnCommand('npm', ['install'], { cwd: 'frontend' });
      }

      if (!this.options['skip-mobile']) {
        this.spawnCommand('flutter', ['pub', 'get'], { cwd: 'mobile' });
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

  /**
   * Verifica se as ferramentas necessárias estão instaladas no sistema.
   * Exibe mensagens descritivas em português para cada ferramenta ausente.
   * @private
   */
  _checkRequiredTools() {
    const tools = [];

    if (!this.options['skip-frontend'] || !this.options['skip-backend']) {
      tools.push({
        cmd: 'node --version',
        name: 'Node.js',
        message: 'Node.js não foi encontrado. Instale em https://nodejs.org/'
      });
    }

    if (!this.options['skip-backend']) {
      tools.push({
        cmd: 'mvn --version',
        name: 'Maven',
        message: 'Apache Maven não foi encontrado. Instale em https://maven.apache.org/install.html'
      });
    }

    if (!this.options['skip-frontend']) {
      tools.push({
        cmd: 'npx vite --version',
        name: 'Vite',
        message: 'Vite não foi encontrado. Instale com "npm install -g vite" ou será usado via npx.'
      });
    }

    if (!this.options['skip-mobile']) {
      tools.push({
        cmd: 'flutter --version',
        name: 'Flutter SDK',
        message: 'Flutter SDK não foi encontrado. Instale em https://docs.flutter.dev/get-started/install'
      });
    }

    tools.forEach((tool) => {
      try {
        execSync(tool.cmd, { stdio: 'ignore' });
      } catch (e) {
        this.log(chalk.red(`⚠ ${tool.message}`));
      }
    });
  }

  /**
   * Gera o projeto frontend Vue.js 3 copiando o template base.
   * Substitui a geração via `ng new` (Angular) por cópia direta do template Vue.js.
   * @private
   */
  _generateProjectFrontend() {
    this.log(chalk.cyan('Criando projeto frontend Vue.js 3...'));

    let template = {
      project: Util.createNames(this.project),
      prefix: Util.createNames(this.prefix)
    };

    // Copiar template base Vue.js para frontend/
    let from = this.templatePath('base/frontend/');
    let to = this.destinationPath('frontend/');
    this.fs.copyTpl(from, to, template, {}, { globOptions: { dot: true } });

    // Atualizar package.json com dependências Vue.js 3
    this._updatePackageJson();

    this.log(chalk.green('Projeto frontend Vue.js 3 criado com sucesso.'));
  }

  /**
   * Gera o projeto backend Demoiselle 4 (Jakarta EE).
   * @private
   */
  _generateProjectBackend() {
    this.log(chalk.cyan('Criando projeto backend Demoiselle 4...'));

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

    this.log(chalk.green('Projeto backend Demoiselle 4 criado com sucesso.'));
  }

  /**
   * Gera o projeto mobile Flutter copiando o template base.
   * @private
   */
  _generateProjectMobile() {
    this.log(chalk.cyan('Criando projeto mobile Flutter...'));

    let template = {
      project: Util.createNames(this.project),
      prefix: Util.createNames(this.prefix)
    };

    // Copiar template base Flutter para mobile/
    let from = this.templatePath('base/mobile/');
    let to = this.destinationPath('mobile/');
    this.fs.copyTpl(from, to, template, {}, { globOptions: { dot: true } });

    // Atualizar pubspec.yaml com dependências Flutter
    this._updatePubspecYaml();

    this.log(chalk.green('Projeto mobile Flutter criado com sucesso.'));
  }

  /**
   * Atualiza o package.json do frontend com dependências Vue.js 3.
   * @private
   */
  _updatePackageJson() {
    const log = this.log.bind(this);
    const templatePath = this.destinationPath('frontend/package.json');
    this.fs.copy(templatePath, templatePath, {
      process: function (content) {
        const str = content.toString();
        let obj;
        try {
          obj = JSON.parse(str);
        } catch (e) {
          return content;
        }

        log(chalk.cyan('Atualizando dependências Vue.js 3 no package.json...'));

        // Garantir que as dependências Vue.js 3 estejam presentes
        obj.dependencies = obj.dependencies || {};
        obj.dependencies['vue'] = obj.dependencies['vue'] || '^3.4.0';
        obj.dependencies['vue-router'] = obj.dependencies['vue-router'] || '^4.3.0';
        obj.dependencies['pinia'] = obj.dependencies['pinia'] || '^2.1.0';
        obj.dependencies['axios'] = obj.dependencies['axios'] || '^1.6.0';
        obj.dependencies['vue-i18n'] = obj.dependencies['vue-i18n'] || '^9.9.0';
        obj.dependencies['@vueuse/core'] = obj.dependencies['@vueuse/core'] || '^10.7.0';

        obj.devDependencies = obj.devDependencies || {};
        obj.devDependencies['vite'] = obj.devDependencies['vite'] || '^5.0.0';
        obj.devDependencies['@vitejs/plugin-vue'] = obj.devDependencies['@vitejs/plugin-vue'] || '^5.0.0';

        return JSON.stringify(obj, null, 2);
      }
    });
    this.fs.commit(function () { });
  }

  /**
   * Atualiza o pubspec.yaml do projeto mobile Flutter com dependências.
   * @private
   */
  _updatePubspecYaml() {
    const log = this.log.bind(this);
    const pubspecPath = this.destinationPath('mobile/pubspec.yaml');
    this.fs.copy(pubspecPath, pubspecPath, {
      process: function (content) {
        let str = content.toString();

        log(chalk.cyan('Verificando dependências Flutter no pubspec.yaml...'));

        // Verificar se as dependências essenciais estão presentes
        const requiredDeps = [
          'dio', 'flutter_riverpod', 'go_router',
          'flutter_secure_storage', 'intl',
          'firebase_messaging', 'file_picker',
          'image_picker', 'share_plus', 'shared_preferences'
        ];

        requiredDeps.forEach(function (dep) {
          if (str.indexOf(dep + ':') === -1) {
            // Adicionar dependência na seção dependencies
            const depsRegex = /dependencies:\s*\n/;
            if (depsRegex.test(str)) {
              str = str.replace(depsRegex, 'dependencies:\n  ' + dep + ': any\n');
            }
          }
        });

        return str;
      }
    });
    this.fs.commit(function () { });
  }
};
