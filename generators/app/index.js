const Generator = require('yeoman-generator');
const Util = require('../../Utils/util');
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

        // Change the path to the Util/templates
        Util.changeRootPath(this);

        // Arguments - passados direto pela cli (ex.: yo demoiselle my-project myprefix)
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
                name: 'prefix',
                message: 'Dê um prefixo para os seus componentes:',
                default: 'my'
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
                name: 'skip-install',
                message: 'Deseja instalar as dependências (isso pode demorar alguns minutos)?',
                default: false
            });
        }

        return this.prompt(prompts).then(function (answers) {
            this.answers = answers;
            this.name = this.options.project || answers.project;
            this.prefix = this.options.prefix || answers.prefix;
            this.options['skip-frontend'] = !(answers.skips.indexOf('frontend') > -1);
            this.options['skip-backend'] = !(answers.skips.indexOf('backend') > -1);

            if (!this.options['skip-install']) {
                this.options['skip-install'] = answers['skip-install'];
            }
        }.bind(this));
    }

    /**
     * Where you write the generator specific files (routes, controllers, etc)
     */
    writing() {
        // Generate Project
        if (!this.options['skip-frontend']) {
            this._generateTodoProjectFrontend();
        } else {
            this.log('[writing] frontend ignored.');
        }

        if (!this.options['skip-backend']) {
            this._generateTodoProjectBackend();
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
            this.spawnCommand('npm', ['install'], {cwd: 'frontend'});
            this.spawnCommand('mvn', ['install'], {cwd: 'frontend'});
        } else {
            this.log('[install] ignored.');
        }
    }

    // ---------------
    // PRIVATE methods
    // ---------------

    _generateTodoProjectFrontend() {
        let template = {
            name: Util.createNames(this.name),
            prefix: Util.createNames(this.prefix)
        };

        let from = this.templatePath('base/frontend/');
        let to = this.destinationPath('frontend/');
        this.fs.copyTpl(from, to, template);
    }

    _generateTodoProjectBackend() {
        let template = {
            name: Util.createNames(this.name)
        };

        let from = this.templatePath('base/backend/');
        let to = this.destinationPath('backend/');
        this.fs.copyTpl(from, to, template);
    }
};

