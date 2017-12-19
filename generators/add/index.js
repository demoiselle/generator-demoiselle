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
        this.argument('template', {required: false});
        this.argument('name', {required: false});

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


        if (!this.options.template) {
            prompts.push({
                type: 'list',
                name: 'template',
                message: 'O que você deseja adicionar ao projeto?',
                default: 'crud',
                choices: [{
                        name: 'Funcionalidade (CRUD)',
                        value: 'crud'
                    }/*, {
                     name: 'Componente apenas (frontend)',
                     value: 'component'
                     }, {
                     name: 'Página apenas (frontend)',
                     value: 'page'
                     }, {
                     name: 'Serviço',
                     value: 'service'
                     }*/]
            });
        }

        if (!this.options.name) {
            prompts.push({
                type: 'input',
                name: 'name',
                message: 'Dê um nome para a funcionalidade/entidade:',
                default: 'MyExample'
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

        return this.prompt(prompts).then(function (answers) {
            this.answers = answers;
            this.options.template = this.options.template || answers.template;
            this.options.name = this.options.name || answers.name;
            this.project = this.config.get('project') || answers.project;
            this.package = this.config.get('package') || answers.package;
            this.prefix = this.config.get('prefix') || answers.prefix;
            if (!this.options['skip-frontend'] && !this.options['skip-backend']) {
                this.options['skip-frontend'] = !(answers.skips.indexOf('frontend') > -1);
                this.options['skip-backend'] = !(answers.skips.indexOf('backend') > -1);
            }
            // store config values if needed
            if (!this.config.get('project')) {
                this.config.set('project', this.project);
            }
            if (!this.config.get('package')) {
                this.config.set('package', this.package);
            }
            if (!this.config.get('prefix')) {
                this.config.set('prefix', this.prefix);
            }


        }.bind(this));
    }

    /**
     * Where you write the generator specific files (routes, controllers, etc)
     */
    writing() {
        let fn = {
            crud: this._writeCrud,
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
        // this.log('[conflicts] ignored.');
    }

    /**
     * Where installation are run (npm, bower)
     */
    install() {
        // this.log('[install] ignored.');
    }

    /**
     * Called last, cleanup, say good bye, etc
     */
    end() {
        // this.log('[end] ignored.');
    }

    // ---------------
    // PRIVATE methods
    // ---------------

    _writeCrud() {
        let entity = {
            name: Util.createNames(this.options.name),
            properties: [{
                    name: 'id',
                    type: 'integer',
                    format: 'int32',
                    description: 'Unique identifier',
                    isReadOnly: true,
                    isPrimitive: true
                }, {
                    name: 'description',
                    type: 'string',
                    description: 'Description of entity',
                    isPrimitive: true
                }],
            hasCustomEntity: false
        };

        let configFrontend = {
            prefix: Util.createNames(this.prefix),
            project: Util.createNames(this.project)
        };
        let configBackend = {
            package: Util.createNames(this.package),
            project: Util.createNames(this.project)
        };

        // Generate Entity CRUD
        if (!this.options['skip-frontend']) {
            this.frontendUtil.createCrud(entity, configFrontend);
        }
        if (!this.options['skip-backend']) {
            this.backendUtil.createCrud(entity, configBackend);
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

