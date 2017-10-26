const Util = require('./util');
const _ = require('lodash');
const path = require('path');

module.exports = class FrontendUtil {

    constructor(vm) {
        this.util = new Util(vm);
        this.vm = vm;
        this.fs = vm.fs;
    }

    createCrud(entity, config) {
        config = config || {};
        config.dest = config.dest || 'frontend/src/app/';
        const fromPath = 'frontend/entity/';
        //const template = entity;
        const template = Object.assign(entity, {
            project: config.project,
            prefix: config.prefix
        });

        const files = [
            // ENTITY
            'index.ts',
            '_entity.module.ts',
            '_entity-routing.module.ts',
            '_entity.component.ts',
            '_entity.component.html',
            '_entity.component.scss',
            '_entity.model.ts',
            '_entity.service.ts',
            '_entity.resolver.ts',
            '_entity-edit.component.ts',
            '_entity-edit.component.html'

        ];
        files.map((file) => {
            let from = path.join(fromPath, file);
            let to = path.join(config.dest, template.name.lower, _.replace(file, /_entity/g, template.name.lower));

            this.util.copyTpl(from, to, template);
        });

        // Adicionar imports no app.module.ts
        //this._addModuleImports(template);

        // Adicionar children route
        this._addChildrenRoute(template);

    }

    createComponent(component, config) {
        config = config || {};
        config.dest = config.dest || 'frontend/src/app/';
        const fromPath = 'frontend/component/';
        const template = component;
        const files = [
            '_component.e2e-spec.ts',
            '_component.html',
            '_component.scss',
            '_component.spec.ts',
            '_component.ts'
        ];
        files.map((file) => {
            let from = path.join(fromPath, file);
            let to = path.join(config.dest, template.name.kebab, _.replace(file, /_component/g, template.name.kebab));

            this.util.copyTpl(from, to, template);
        });
    }

    createPage(page, config) {
        config = config || {};
        config.dest = config.dest || 'frontend/src/app/';
        const fromPath = 'frontend/page/';
        const template = page;
        const files = [
            '_page.e2e-spec.ts',
            '_page.html',
            '_page.ts'
        ];
        files.map((file) => {
            let from = path.join(fromPath, file);
            let to = path.join(config.dest, template.name.kebab, _.replace(file, /_page/g, template.name.kebab));

            this.util.copyTpl(from, to, template);
        });
    }

    createService(endpoint, config) {
        config = config || {};
        config.dest = config.dest || 'frontend/src/app/';
        const fromPath = 'frontend/provider/';
        const template = endpoint;
        const files = [
            '_provider.service.ts'
        ];
        files.map((file) => {
            let from = path.join(fromPath, file);
            let to = path.join(config.dest, template.name.kebab, _.replace(file, /_provider/g, template.name.kebab));

            this.util.copyTpl(from, to, template);
        });
    }

    /**
     * Importa um sub módulo no módulo principal app.module.ts
     */
    _addModuleImports(template) {

        var templatePath = this.vm.destinationPath('frontend/src/app/app.module.ts');
        this.fs.copy(templatePath, templatePath, {
            process: function (content) {

                // Utilizando RegExp enquanto não tem um bom parser para typescript
                var regEx = new RegExp('imports\\:\\s*\\t*\\r*\\n*\\[');
                var newContent = content.toString().replace(regEx, 'imports: [\n\t\t' + template.name.capital + 'Module,\n');
                newContent = 'import { ' + template.name.capital + 'Module } from \'./' + template.name.lower + '\';\n' + newContent;
                return newContent;

            }
        });
        this.fs.commit(function () { });

    }

    /**
     * Adiciona o carregamento do sub módulo como children em app-routing.module
     * @param {*} template 
     */
    _addChildrenRoute(template) {
        var templatePath = this.vm.destinationPath('frontend/src/app/app-routing.module.ts');
        this.fs.copy(templatePath, templatePath, {
            process: function (content) {

                var newChildRoute = `
        {
          path: '` + template.name.lower + `',
          loadChildren: './` + template.name.lower + '/' + template.name.lower + '.module#' + template.name.capital + `Module',
          data: {
            title: '` + template.name.capital + `',
            showInSidebar: true,
            icon: 'icon-diamond'
          }
        },
        `;

                // Utilizando RegExp enquanto não tem um bom parser para typescript
                var regEx = new RegExp('children\\:\\s*\\t*\\r*\\n*\\[');
                var newContent = content.toString().replace(regEx, 'children: [\n\t\t' + newChildRoute);
                return newContent;

            }
        });
        this.fs.commit(function () { });

    }
};
