const Util = require('./util');
const _ = require('lodash');
const path = require('path');

module.exports = class BackendUtil {

  constructor(vm) {
    this.util = new Util(vm);
  }

  createCrud(entity, config) {
    config = config || {};
    config.dest = config.dest || 'backend/src/main/java/';
    const fromPath = 'backend/src/main/java/app/';

    const template = Object.assign(entity, {
      project: config.project,
      package: config.package
    });

    const files = [
      'entity/_pojo.java',
      'bc/_BC.java',
      'dao/_DAO.java',
      'service/_REST.java',
    ];

    files.map((file) => {
      let from = path.join(fromPath, file);
      let to = path.join(config.dest, _.replace(file, /_pojo/g, template.name.kebab));

      this.util.copyTpl(from, to, template);
    });
  }

  createFromEntity(entity, config) {
    config = config || {};
    config.dest = config.dest || 'backend/src/main/java/app/';
    const fromPath = 'backend/src/main/java/app/';
    const template = entity;
    const files = [
      'bc/_BC.java',
      'dao/_DAO.java',
      'service/_REST.java',
    ];

    files.map((file) => {
      let from = path.join(fromPath, file);
      let to = path.join(config.dest, _.replace(file, /_pojo/g, template.name.kebab));

      this.util.copyTpl(from, to, template);
    });
  }
};
