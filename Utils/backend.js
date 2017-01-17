const Util = require('./util');
// const _ = require('lodash');
// const path = require('path');

module.exports = class BackendUtil {

  constructor(vm) {
    this.util = new Util(vm);
  }

  createEntity(entity, config) {
    config = config || {};
    config.dest = config.dest || 'backend/src/';
    let template = entity;
    let from = 'backend/src/';
    let to = config.dest;
    this.util.copyTpl(from, to, template);
  }
};
