'use strict';

const Util = require('./util');
const _ = require('lodash');
const path = require('path');

/**
 * Mapeia tipos Java para tipos Dart equivalentes.
 * @param {string} javaType - tipo Java da propriedade
 * @returns {string} tipo Dart correspondente
 */
function dartType(javaType) {
    const map = {
        'string': 'String',
        'integer': 'int',
        'int': 'int',
        'long': 'int',
        'double': 'double',
        'float': 'double',
        'boolean': 'bool',
        'date': 'DateTime',
        'localdate': 'DateTime',
        'localdatetime': 'DateTime',
        'bigdecimal': 'double',
        'uuid': 'String',
        'short': 'int',
        'number': 'num'
    };
    return map[(javaType || '').toLowerCase()] || javaType;
}

/**
 * Verifica se o tipo Java é um tipo primitivo/conhecido.
 * @param {object} property - propriedade da entidade { name, type }
 * @returns {boolean}
 */
function isPrimitive(property) {
    const primitives = [
        'string', 'integer', 'int', 'long', 'double', 'float',
        'boolean', 'date', 'localdate', 'localdatetime',
        'bigdecimal', 'uuid', 'short', 'number'
    ];
    return primitives.includes((property.type || '').toLowerCase());
}

/**
 * Determina o tipo de widget Flutter adequado para uma propriedade.
 * @param {object} property - propriedade da entidade { name, type }
 * @returns {string} tipo de widget: 'email', 'password', 'datePicker', 'number', 'switch', 'dropdown', 'text'
 */
function flutterWidgetType(property) {
    if (/e?mail/i.test(property.name)) return 'email';
    if (/pass/i.test(property.name)) return 'password';
    if (/^(date|localdate|localdatetime)$/i.test(property.type)) return 'datePicker';
    if (/^(integer|int|long|double|float|bigdecimal|number|short)$/i.test(property.type)) return 'number';
    if (/^boolean$/i.test(property.type)) return 'switch';
    if (!isPrimitive(property)) return 'dropdown';
    return 'text';
}

module.exports = class MobileUtil {

    constructor(vm) {
        this.util = new Util(vm);
        this.vm = vm;
        this.fs = vm.fs;
    }

    /**
     * Gera telas CRUD Flutter para uma entidade.
     * Cria: _entity_list_screen.dart, _entity_form_screen.dart,
     *       _entity_service.dart, _entity_model.dart, _entity_provider.dart
     * @param {object} entity - entidade com name (objeto com lower, capital, kebab, camel, snake) e properties
     * @param {object} config - configuração com dest, project, prefix
     */
    createCrud(entity, config) {
        config = config || {};
        config.dest = config.dest || 'mobile/lib/';
        const fromPath = 'mobile/entity/';

        const template = Object.assign({}, entity, {
            project: config.project,
            prefix: config.prefix,
            dartType: dartType,
            flutterWidgetType: flutterWidgetType,
            isPrimitive: isPrimitive
        });

        const files = [
            { src: '_entity_list_screen.dart', dest: 'screens/' },
            { src: '_entity_form_screen.dart', dest: 'screens/' },
            { src: '_entity_service.dart', dest: 'services/' },
            { src: '_entity_model.dart', dest: 'models/' },
            { src: '_entity_provider.dart', dest: 'providers/' }
        ];

        files.forEach((file) => {
            const from = path.join(fromPath, file.src);
            const fileName = _.replace(file.src, /_entity/g, _.snakeCase(template.name.lower));
            const to = path.join(config.dest, file.dest, fileName);
            this.util.copyTpl(from, to, template);
        });

        this._addRoute(template);
        this._addI18nKeys(template);
        this._addDashboardCard(template);
        this._addDrawerItem(template);
    }

    /**
     * Gera uma tela Flutter genérica.
     * @param {object} screen - tela com name (objeto com lower, capital, kebab, camel, snake)
     * @param {object} config - configuração com dest
     */
    createScreen(screen, config) {
        config = config || {};
        config.dest = config.dest || 'mobile/lib/screens/';
        const fromPath = 'mobile/screen/';
        const template = Object.assign({}, screen);

        const files = [
            '_screen.dart'
        ];

        files.forEach((file) => {
            const from = path.join(fromPath, file);
            const fileName = _.replace(file, /_screen/g, _.snakeCase(template.name.lower) + '_screen');
            const to = path.join(config.dest, fileName);
            this.util.copyTpl(from, to, template);
        });
    }

    /**
     * Gera um service Dart para comunicação HTTP.
     * @param {object} endpoint - endpoint com name (objeto com lower, capital, kebab, camel, snake)
     * @param {object} config - configuração com dest
     */
    createService(endpoint, config) {
        config = config || {};
        config.dest = config.dest || 'mobile/lib/services/';
        const fromPath = 'mobile/service/';
        const template = Object.assign({}, endpoint);

        const files = [
            '_service.dart'
        ];

        files.forEach((file) => {
            const from = path.join(fromPath, file);
            const fileName = _.replace(file, /_service/g, _.snakeCase(template.name.lower) + '_service');
            const to = path.join(config.dest, fileName);
            this.util.copyTpl(from, to, template);
        });
    }

    /**
     * Gera um model Dart com serialização JSON (fromJson/toJson).
     * @param {object} entity - entidade com name e properties
     * @param {object} config - configuração com dest
     */
    createModel(entity, config) {
        config = config || {};
        config.dest = config.dest || 'mobile/lib/models/';
        const fromPath = 'mobile/model/';

        const template = Object.assign({}, entity, {
            dartType: dartType,
            flutterWidgetType: flutterWidgetType,
            isPrimitive: isPrimitive
        });

        const files = [
            '_model.dart'
        ];

        files.forEach((file) => {
            const from = path.join(fromPath, file);
            const fileName = _.replace(file, /_model/g, _.snakeCase(template.name.lower) + '_model');
            const to = path.join(config.dest, fileName);
            this.util.copyTpl(from, to, template);
        });
    }

    /**
     * Adiciona rota no go_router (lib/routes/app_router.dart).
     * @param {object} template - template com name (objeto com lower, capital, camel)
     * @private
     */
    _addRoute(template) {
        const routerPath = this.vm.destinationPath('mobile/lib/routes/app_router.dart');
        this.fs.copy(routerPath, routerPath, {
            process: function (content) {
                const contentStr = content.toString();
                // Avoid duplicate routes
                if ((new RegExp(template.name.lower, 'i')).test(contentStr)) {
                    return content;
                }

                const newRoute = `
      GoRoute(
        path: '/${template.name.lower}',
        name: '${template.name.lower}',
        builder: (context, state) => const ${template.name.capital}ListScreen(),
        routes: [
          GoRoute(
            path: 'create',
            name: '${template.name.lower}-create',
            builder: (context, state) => const ${template.name.capital}FormScreen(),
          ),
          GoRoute(
            path: ':id/edit',
            name: '${template.name.lower}-edit',
            builder: (context, state) => ${template.name.capital}FormScreen(
              id: state.pathParameters['id'],
            ),
          ),
        ],
      ),`;

                // Insert route into the routes array
                const regEx = new RegExp('routes\\s*:\\s*\\[');
                const newContent = contentStr.replace(regEx, 'routes: [\n' + newRoute);
                return newContent;
            }
        });
        this.fs.commit(function () { });
    }

    /**
     * Adiciona chaves de tradução nos arquivos ARB (app_pt.arb, app_en.arb).
     * @param {object} template - template com name e properties
     * @private
     */
    _addI18nKeys(template) {
        const arbFiles = [
            { path: 'mobile/lib/l10n/app_pt.arb', titleSuffix: 'Lista de ', createPrefix: 'Novo ', editPrefix: 'Editar ' },
            { path: 'mobile/lib/l10n/app_en.arb', titleSuffix: '', createPrefix: 'New ', editPrefix: 'Edit ' }
        ];

        arbFiles.forEach((arbFile) => {
            const arbPath = this.vm.destinationPath(arbFile.path);
            const entityName = template.name.capital;
            const entityLower = template.name.lower;

            this.fs.copy(arbPath, arbPath, {
                process: function (content) {
                    let json;
                    try {
                        json = JSON.parse(content.toString());
                    } catch (e) {
                        json = {};
                    }

                    // Avoid duplicates
                    if (json[entityLower + 'Title']) {
                        return content;
                    }

                    const titleValue = arbFile.titleSuffix
                        ? arbFile.titleSuffix + entityName
                        : entityName + ' List';

                    json[entityLower + 'Title'] = titleValue;
                    json[entityLower + 'Create'] = arbFile.createPrefix + entityName;
                    json[entityLower + 'Edit'] = arbFile.editPrefix + entityName;

                    // Add field labels from properties
                    if (template.properties) {
                        template.properties.forEach(function (prop) {
                            const key = entityLower + 'Field' + prop.name.charAt(0).toUpperCase() + prop.name.slice(1);
                            json[key] = prop.name.charAt(0).toUpperCase() + prop.name.slice(1);
                        });
                    }

                    return JSON.stringify(json, null, 2);
                }
            });
            this.fs.commit(function () { });
        });
    }

    /**
     * Adiciona card de estatísticas no DashboardScreen para a nova entidade.
     * @param {object} template - template com name (objeto com lower, capital)
     * @private
     */
    _addDashboardCard(template) {
        const dashboardPath = this.vm.destinationPath('mobile/lib/screens/dashboard_screen.dart');
        this.fs.copy(dashboardPath, dashboardPath, {
            process: function (content) {
                const contentStr = content.toString();
                // Avoid duplicates
                if ((new RegExp(template.name.lower + 'Count', 'i')).test(contentStr)) {
                    return content;
                }

                const newCard = `
            _buildStatCard(
              context,
              title: AppLocalizations.of(context)!.${template.name.lower}Title,
              icon: Icons.list_alt,
              route: '/${template.name.lower}',
            ),`;

                // Insert card into the dashboard grid
                const regEx = new RegExp('// ENTITY_STATS_CARDS');
                const newContent = contentStr.replace(regEx, '// ENTITY_STATS_CARDS\n' + newCard);
                return newContent;
            }
        });
        this.fs.commit(function () { });
    }

    /**
     * Adiciona item de navegação no AppDrawer para a nova entidade.
     * @param {object} template - template com name (objeto com lower, capital)
     * @private
     */
    _addDrawerItem(template) {
        const drawerPath = this.vm.destinationPath('mobile/lib/widgets/app_drawer.dart');
        this.fs.copy(drawerPath, drawerPath, {
            process: function (content) {
                const contentStr = content.toString();
                // Avoid duplicates
                if ((new RegExp("'/" + template.name.lower + "'")).test(contentStr)) {
                    return content;
                }

                const newItem = `
          ListTile(
            leading: const Icon(Icons.list_alt),
            title: Text(AppLocalizations.of(context)!.${template.name.lower}Title),
            onTap: () {
              Navigator.pop(context);
              context.go('/${template.name.lower}');
            },
          ),`;

                // Insert item into the drawer list
                const regEx = new RegExp('// ENTITY_DRAWER_ITEMS');
                const newContent = contentStr.replace(regEx, '// ENTITY_DRAWER_ITEMS\n' + newItem);
                return newContent;
            }
        });
        this.fs.commit(function () { });
    }
};

// Export helper functions for use in templates and tests
module.exports.dartType = dartType;
module.exports.flutterWidgetType = flutterWidgetType;
module.exports.isPrimitive = isPrimitive;
