const Util = require('./util');
const _ = require('lodash');
const path = require('path');
const cheerio = require('cheerio');

module.exports = class BackendUtil {

    constructor(vm) {
        this.util = new Util(vm);
        this.vm = vm;
        this.fs = vm.fs;
    }

    createCrud(entity, config) {
        config = config || {};
        config.dest = config.dest || 'backend/src/main/java/' + config.package.lower.replace(/\./g, '/') + '/' + config.project.lower + '/';
        const fromPath = 'backend/src/main/java/app/';

        const template = Object.assign(entity, {
            project: config.project,
            package: config.package
        });

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
    }

    createFromEntity(entity, config) {
        config = config || {};
        config.dest = config.dest || 'backend/src/main/java/' + config.package.lower.replace(/\./g, '/') + '/' + config.project.lower + '/';
        const fromPath = 'backend/src/main/java/app/';
        const template = Object.assign(entity, {
            project: config.project,
            package: config.package
        });
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
