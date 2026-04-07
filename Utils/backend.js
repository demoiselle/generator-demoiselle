const Util = require('./util');
const QueryGeneratorUtil = require('./queryGenerator');
const _ = require('lodash');
const path = require('path');
const cheerio = require('cheerio');

module.exports = class BackendUtil {

    constructor(vm) {
        this.util = new Util(vm);
        this.vm = vm;
        this.fs = vm.fs;
        this.queryGenerator = new QueryGeneratorUtil();
    }

    createCrud(entity, config) {
        config = config || {};
        config.dest = config.dest || 'backend/src/main/java/' + config.package.lower.replace(/\./g, '/') + '/' + config.project.lower + '/';
        const fromPath = 'backend/src/main/java/app/';
        const packages = config.packages || [];

        const template = Object.assign(entity, {
            project: config.project,
            package: config.package,
            packages: packages
        });

        // Ensure properties are available for export endpoints in REST template
        if (!template.properties) {
            template.properties = [];
        }

        const files = [
            'entity/_pojo.java',
            'bc/_pojoBC.java',
            'dao/_pojoDAO.java',
            'service/_pojoREST.java',
        ];

        files.map((file) => {
            let from = path.join(fromPath, file);
            let to = path.join(config.dest, _.replace(file, /_pojo/g, template.name.capital));

            this.util.copyTpl(from, to, template);
        });

        this._addEntityToPersistenceXml(template);
        if (packages.includes('dashboard')) {
            this._addEntityToDashboardStats(template);
        }
    }

    createFromEntity(entity, config) {
        config = config || {};
        config.dest = config.dest || 'backend/src/main/java/' + config.package.lower.replace(/\./g, '/') + '/' + config.project.lower + '/';
        const fromPath = 'backend/src/main/java/app/';
        const packages = config.packages || [];

        // Generate query methods from entity properties using QueryGeneratorUtil
        const queryMethods = this.queryGenerator.generateQueryMethods(entity.properties || []);

        const template = Object.assign(entity, {
            project: config.project,
            package: config.package,
            packages: packages,
            queryMethods: queryMethods
        });

        // Ensure properties are available for export endpoints in REST template
        if (!template.properties) {
            template.properties = [];
        }

        const files = [
            'bc/_pojoBC.java',
            'dao/_pojoDAO.java',
            'service/_pojoREST.java',
        ];
        
        files.map((file) => {
            let from = path.join(fromPath, file);
            let to = path.join(config.dest, _.replace(file, /_pojo/g, template.name.capital));

            this.util.copyTpl(from, to, template);
        });

        this._addEntityToPersistenceXml(template);
        if (packages.includes('dashboard')) {
            this._addEntityToDashboardStats(template);
        }
    }

    /**
     * Adiciona a entidade ao DashboardREST.java — injeta DAO e contagem no endpoint /dashboard/stats.
     * Modifica o arquivo DashboardREST.java existente para:
     * 1. Adicionar import do DAO da entidade
     * 2. Adicionar @Inject do DAO
     * 3. Adicionar contagem da entidade no mapa de stats
     * @param {object} template - template com name, package, project
     * @private
     */
    _addEntityToDashboardStats(template) {
        const dashboardPath = this.vm.destinationPath('backend/src/main/java/' + template.package.lower.replace(/\./g, '/') + '/' + template.project.lower + '/service/DashboardREST.java');
        const entityName = template.name.capital;
        const entityLower = template.name.lower;
        const packageLower = template.package.lower;
        const projectLower = template.project.lower;

        this.fs.copy(dashboardPath, dashboardPath, {
            process: function (content) {
                let contentStr = content.toString();

                // Avoid duplicates — check if this entity's DAO is already injected
                if (contentStr.indexOf(entityName + 'DAO') !== -1) {
                    return content;
                }

                // 1. Add import for the entity's DAO (before the class declaration)
                const importStatement = `import ${packageLower}.${projectLower}.dao.${entityName}DAO;\n`;
                const importRegEx = /^(import [^;]+;\s*\n)(?!import)/m;
                contentStr = contentStr.replace(importRegEx, '$1' + importStatement);

                // 2. Add @Inject for the DAO at the marker comment
                const daoInject = `    @Inject\n    private ${entityName}DAO ${entityLower}DAO;\n\n`;
                contentStr = contentStr.replace(
                    '// ENTITY_STATS_INJECT',
                    `${daoInject}    // ENTITY_STATS_INJECT`
                );

                // 3. Add count call in the stats method at the marker comment
                const countLine = `            stats.put("${entityLower}", ${entityLower}DAO.count());\n`;
                contentStr = contentStr.replace(
                    '// ENTITY_COUNT_INJECT',
                    `${countLine}            // ENTITY_COUNT_INJECT`
                );

                return contentStr;
            }
        });
        this.fs.commit(function () { });
    }

    _addEntityToPersistenceXml(template) {
        var templatePath = this.vm.destinationPath('backend/src/main/resources/META-INF/persistence.xml');
        this.fs.copy(templatePath, templatePath, {
            process: function (content) {
                let puName = template.project.lower + 'PU';
                let xml = cheerio.load(content.toString(), {
                    xmlMode: true
                });
                let node = xml('persistence-unit[name='+ puName +']');
                if (node.length < 1) { // if not found the app PU, get the first one
                    node = xml('persistence-unit');
                }

                let lastClassNode = xml(node).find('class').last();
                lastClassNode.after('\n\t<class>' + template.package.lower + '.' + template.project.lower + '.entity.' + template.name.capital + '</class>');

                return xml.html();
            }
        });
        this.fs.commit(function () { });
    }
};
