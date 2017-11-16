const Generator = require('yeoman-generator');
const Util = require('../../Utils/util');
const chalk = require('chalk');
const yosay = require('yosay');

//var execSync = require('child_process').execSync;

/**
 * yo demoiselle <project-name>
 *
 * Demoiselle generator for new projects.
 */
module.exports = class PushGenerator extends Generator {
    constructor(args, opts) {
        super(args, opts);

        //this.frontendUtil = new FrontendUtil(this);
        //this.backendUtil = new BackendUtil(this);

        // Muda o caminho dos arquivos de templates.
        Util.changeRootPath(this);

        // Arguments - passados direto pela cli (ex.: yo demoiselle:fromEntity my-feature)
        // ...

        // Options - parecido com "argument", mas vão como "flags" (--option)
        this.option('skip-frontend');
        this.option('skip-backend');

    }

    /**
     * Your initialization methods (checking current project state, getting configs, etc)
     */
    initializing() {

    }

    /**
     * Where you prompt users for options (where you'd call this.prompt())
     * Examples: name of app? which frameworks? which template engine?
     */
    prompting() {
        let prompts = [];

        if (!this.config.get('project')) {
            console.log('Nome do projeto não encontrado na configuração...')
            prompts.push({
                type: 'input',
                name: 'project',
                message: 'Informe o nome do seu projeto:',
                default: 'app'
            });
        }
        if (!this.config.get('package')) {
            console.log('Package do backend não encontrado na configuração...')
            prompts.push({
                type: 'input',
                name: 'package',
                message: 'Informe o package do backend:',
                default: 'org.demoiselle'
            });
        }
        if (!this.config.get('prefix')) {
            console.log('Prefixo dos componentes não encontrado na configuração...')
            prompts.push({
                type: 'input',
                name: 'prefix',
                message: 'Informe um prefixo para seus componentes:',
                default: 'app'
            });
        }

        if (!this.options['skip-frontend'] && !this.options['skip-backend']) {
            prompts.push({
                type: 'checkbox',
                name: 'skips',
                message: 'Você quer gerar arquivos para:',
                choices: [
//                    {
//                        name: 'frontend',
//                        checked: true
//                    }, 
                    {
                        name: 'backend',
                        checked: true
                    }]
            });
        }

        return this.prompt(prompts).then(function (answers) {
            this.answers = answers;
           
            //this.options['skip-frontend'] = !(answers.skips.indexOf('frontend') > -1);
            this.options['skip-backend'] = !(answers.skips.indexOf('backend') > -1);

            this.project = this.config.get('project') || answers.project;
            this.package = this.config.get('package') || answers.package;
            this.prefix = this.config.get('prefix') || answers.prefix;

        }.bind(this));
    }

    /**
     * Where you write the generator specific files (routes, controllers, etc)
     */
    writing() {
        // Generate Project
//        if (!this.options['skip-frontend']) {
//            this._generateProjectFrontend();
//        } else {
//            this.log('[writing] frontend ignored.');
//        }

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
        
    }

    // ---------------
    // PRIVATE methods
    // ---------------

//    _generateProjectFrontend() {
//        let template = {
//            project: Util.createNames(this.project),
//            prefix: Util.createNames(this.prefix)
//        };
//
//        this.log('Creating angular/cli frontend! please wait...');
//        this.log(execSync('ng new frontend --skip-install --skip-git').toString());
//
//        this._addDependenciesToPackageJson();
//        this._addCustomStylesToAngularCli();
//        this._addCustomImportsToAngularCli();
//
//        // replacing src folders and styles.css
//
//        this.fs.delete(this.destinationPath('frontend/src/app'));
//        this.fs.delete(this.destinationPath('frontend/src/assets'));
//        this.fs.delete(this.destinationPath('frontend/src/environments'));
//        this.fs.delete(this.destinationPath('frontend/src/styles.css'));
//        this.fs.delete(this.destinationPath('frontend/src/index.html'));
//        this.fs.commit(function () { });
//
//        let from = this.templatePath('base/frontend/src/app/');
//        let to = this.destinationPath('frontend/src/app/');
//        this.fs.copyTpl(from, to, template);
//
//        from = this.templatePath('base/frontend/src/assets/');
//        to = this.destinationPath('frontend/src/assets/');
//        this.fs.copy(from, to);
//
//        from = this.templatePath('base/frontend/src/environments/');
//        to = this.destinationPath('frontend/src/environments/');
//        this.fs.copy(from, to);
//
//        from = this.templatePath('base/frontend/src/scss/');
//        to = this.destinationPath('frontend/src/scss/');
//        this.fs.copyTpl(from, to, template);
//
//        from = this.templatePath('base/frontend/src/styles.css');
//        to = this.destinationPath('frontend/src/styles.css');
//        this.fs.copyTpl(from, to, template);
//
//        from = this.templatePath('base/frontend/src/index.html');
//        to = this.destinationPath('frontend/src/index.html');
//        this.fs.copyTpl(from, to, template);
//
//        from = this.templatePath('base/frontend/src/manifest.json');
//        to = this.destinationPath('frontend/src/manifest.json');
//        this.fs.copyTpl(from, to);
//
//        from = this.templatePath('base/frontend/src/humans.txt');
//        to = this.destinationPath('frontend/src/humans.txt');
//        this.fs.copyTpl(from, to);
//        
//        from = this.templatePath('base/frontend/src/background.js');
//        to = this.destinationPath('frontend/src/background.js');
//        this.fs.copyTpl(from, to);
//
//    }

    _generateProjectBackend() {
        this.log('Creating Push backend ...');

        let template = {
            package: Util.createNames(this.package),
            project: Util.createNames(this.project)
        };

        let from = this.templatePath('push/src/main/java/app/');
        let to = this.destinationPath('backend/src/main/java/' + this.package.replace(/\./g, '/').toLowerCase() + '/' + this.project.toLowerCase() + '/');
        this.fs.copyTpl(from, to, template);

        this.log('Backend successfully created.');
    }


};

