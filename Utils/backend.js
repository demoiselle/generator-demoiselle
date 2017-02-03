const Util = require('./util');
const _ = require('lodash');
const path = require('path');

module.exports = class BackendUtil {

  constructor(vm) {
    this.util = new Util(vm);
  }

  createEntity(entity) {
    const fromPath = 'backend/src/main/java/app/';
    const template = entity;
    const files = [
      'entity/_pojo.java',
      'business/_pojoBC.java',
      'persistence/_pojoDAO.java',
      'service/_pojoREST.java',
    ];

    files.map((file) => {
      let from = path.join(fromPath, file);
      let to = path.join(fromPath, _.replace(file, /_pojo/g, template.name.kebab));

      this.util.copyTpl(from, to, template);
    });
  }

  createFromEntity(entity) {
    const fromPath = 'backend/src/main/java/app/';
    const template = entity;
    const files = [
      'business/_pojoBC.java',
      'persistence/_pojoDAO.java',
      'service/_pojoREST.java',
    ];

    files.map((file) => {
      let from = path.join(fromPath, file);
      let to = path.join(fromPath, _.replace(file, /_pojo/g, template.name.kebab));

      this.util.copyTpl(from, to, template);
    });
  }
};
