const Util = require('./util');
const _ = require('lodash');
const path = require('path');

module.exports = class BackendUtil {

    constructor(vm) {
        this.util = new Util(vm);
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
    }

    createFromEntity(entity, config) {
        config = config || {};
        config.dest = config.dest || 'backend/src/main/java/' + config.package.replace(/\./g, '/') + '/' + config.project + '/';
        const fromPath = 'backend/src/main/java/app/';
        const template = entity;
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
    }
};
