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

        const template = Object.assign(entity, {
            project: config.project,
            prefix: config.prefix
        });

        const files = [
            '_entityList.vue',
            '_entityForm.vue',
            '_entity.service.js',
            '_entity.routes.js'
        ];
        files.map((file) => {
            let from = path.join(fromPath, file);
            let to = path.join(config.dest, template.name.lower, _.replace(file, /_entity/g, template.name.lower));

            this.util.copyTpl(from, to, template);
        });

        // Adicionar rota no Vue Router
        this._addChildrenRoute(template);

        // Adicionar chaves de tradução i18n
        this._addI18nKeys(template);

        // Adicionar card no dashboard
        this._addDashboardCard(template);
    }

    createComponent(component, config) {
        config = config || {};
        config.dest = config.dest || 'frontend/src/app/';
        const fromPath = 'frontend/component/';
        const template = component;
        const files = [
            '_component.vue',
            '_component.spec.js'
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
            '_page.vue'
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
            '_provider.composable.js'
        ];
        files.map((file) => {
            let from = path.join(fromPath, file);
            let to = path.join(config.dest, template.name.kebab, _.replace(file, /_provider/g, template.name.kebab));

            this.util.copyTpl(from, to, template);
        });
    }

    /**
     * Adiciona rota da entidade como children no Vue Router (src/router/index.js)
     * @param {object} template - template com name (objeto com lower, capital)
     * @private
     */
    _addChildrenRoute(template) {
        const routerPath = this.vm.destinationPath('frontend/src/router/index.js');
        this.fs.copy(routerPath, routerPath, {
            process: function (content) {
                const contentStr = content.toString();

                // Avoid duplicates
                if ((new RegExp(template.name.lower, 'i')).test(contentStr)) {
                    return content;
                }

                const importStatement = `import ${template.name.capital}Routes from '@/app/${template.name.lower}/${template.name.lower}.routes.js';\n`;

                const spreadRoutes = `      ...${template.name.capital}Routes,`;

                // Add import at the top of the file (after last import)
                const importRegEx = new RegExp('(import [^;]+;[\\r\\n]+)(?!import)', 'm');
                let newContent = contentStr.replace(importRegEx, '$1' + importStatement);

                // Add route spread in children array
                const childrenRegEx = new RegExp('// CRUD routes will be added here by the generator');
                newContent = newContent.replace(childrenRegEx, spreadRoutes + '\n      // CRUD routes will be added here by the generator');

                return newContent;
            }
        });
        this.fs.commit(function () { });
    }

    /**
     * Adiciona chaves de tradução i18n nos arquivos pt-BR.json e en.json
     * @param {object} template - template com name (objeto com lower, capital) e properties
     * @private
     */
    _addI18nKeys(template) {
        const i18nFiles = [
            { path: 'frontend/src/i18n/pt-BR.json', titleSuffix: 'Lista de ', createPrefix: 'Novo ', editPrefix: 'Editar ', entityLabel: '' },
            { path: 'frontend/src/i18n/en.json', titleSuffix: '', createPrefix: 'New ', editPrefix: 'Edit ', entityLabel: '' }
        ];

        i18nFiles.forEach((i18nFile) => {
            const filePath = this.vm.destinationPath(i18nFile.path);
            const entityName = template.name.capital;
            const entityLower = template.name.lower;

            this.fs.copy(filePath, filePath, {
                process: function (content) {
                    let json;
                    try {
                        json = JSON.parse(content.toString());
                    } catch (e) {
                        json = {};
                    }

                    // Avoid duplicates
                    if (json[entityLower]) {
                        return content;
                    }

                    const titleValue = i18nFile.titleSuffix
                        ? i18nFile.titleSuffix + entityName
                        : entityName + ' List';

                    const entityKeys = {
                        title: titleValue,
                        create: i18nFile.createPrefix + entityName,
                        edit: i18nFile.editPrefix + entityName,
                        entityName: entityName,
                        fields: {}
                    };

                    // Add field labels from properties
                    if (template.properties) {
                        template.properties.forEach(function (prop) {
                            entityKeys.fields[prop.name] = prop.name.charAt(0).toUpperCase() + prop.name.slice(1);
                        });
                    }

                    json[entityLower] = entityKeys;

                    // Also add dashboard entity label
                    if (!json.dashboard) {
                        json.dashboard = { entities: {} };
                    }
                    if (!json.dashboard.entities) {
                        json.dashboard.entities = {};
                    }
                    json.dashboard.entities[entityLower] = entityName;

                    // Also add menu entry
                    if (!json.menu) {
                        json.menu = {};
                    }
                    json.menu[entityLower] = entityName;

                    return JSON.stringify(json, null, 2);
                }
            });
            this.fs.commit(function () { });
        });
    }

    /**
     * Adiciona card de estatísticas no DashboardView.vue para a nova entidade.
     * @param {object} template - template com name (objeto com lower, capital)
     * @private
     */
    _addDashboardCard(template) {
        const dashboardPath = this.vm.destinationPath('frontend/src/views/DashboardView.vue');
        this.fs.copy(dashboardPath, dashboardPath, {
            process: function (content) {
                const contentStr = content.toString();

                // Avoid duplicates
                if ((new RegExp("'" + template.name.lower + "'", 'i')).test(contentStr)) {
                    return content;
                }

                const newCard = `
      <div class="stat-card">
        <div class="stat-icon">📦</div>
        <div class="stat-info">
          <span class="stat-count">{{ entityCounts['${template.name.lower}'] || 0 }}</span>
          <span class="stat-label">{{ $t('dashboard.entities.${template.name.lower}') }}</span>
        </div>
      </div>`;

                // Insert card before the marker comment
                const regEx = new RegExp('<!-- ENTITY_DASHBOARD_CARDS -->');
                const newContent = contentStr.replace(regEx, newCard + '\n      <!-- ENTITY_DASHBOARD_CARDS -->');
                return newContent;
            }
        });
        this.fs.commit(function () { });
    }
};
