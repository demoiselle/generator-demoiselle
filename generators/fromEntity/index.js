const Generator = require('yeoman-generator');
const Util = require('../../Utils/util');
const FrontendUtil = require('../../Utils/frontend');
const BackendUtil = require('../../Utils/backend');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');

/**
 * yo demoiselle:fromEntity
 *
 * Demoiselle generator for new entities.
 */
module.exports = class FromEntityGenerator extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this._entities = [];
    this.frontendUtil = new FrontendUtil(this);
    this.backendUtil = new BackendUtil(this);

    // Muda o caminho dos arquivos de templates.
    Util.changeRootPath(this);

    // Arguments - passados direto pela cli (ex.: yo demoiselle:fromEntity my-feature)
    this.argument('entity-path', {
      desc: 'Caminho do pacote de entidades',
      type: String,
      required: false
    });

    // Options - parecido com "argument", mas vão como "flags" (--option)
    this.option('skip-frontend');
    this.option('skip-backend');
  }

  /**
   * Your initialization methods (checking current project state, getting configs, etc)
   */
  initializing() {
  }

  /**
   * Where you prompt users for options (where you'd call this.prompt())
   * Examples: name of app? which frameworks? which template engine?
   */
  prompting() {
    let prompts = [];

    if (!this.options['entity-path']) {
      prompts.push({
        type: 'input',
        name: 'entity-path',
        message: 'Qual o caminho da sua pasta de entidades?',
        default: 'backend/src/main/java/org/demoiselle/app/entity/'
      });
    }

    if (this._entities.length > 0) {
      let options = [];
      this._entities.forEach(entity => {
        options.push({
          name: entity.name.capital,
          checked: true
        });
      });

      prompts.push({
        type: 'checkbox',
        name: 'entities',
        message: 'Para quais entidades você quer gerar os arquivos?',
        choices: options
      });
    } else {
      this.log('Nenhuma entidade encontrada.');
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
      // Keep only checked entities
      this._entities = _.intersectionWith(this._entities, answers.entities, (entity, answer) => {
        return entity.name.capital === answer;
      });
      if(!this.options['entity-path']){
        this.options['entity-path'] = answers['entity-path'];
      }
      this.options['skip-frontend'] = !(answers.skips.indexOf('frontend') > -1);
      this.options['skip-backend'] = !(answers.skips.indexOf('backend') > -1);
    }.bind(this));
  }

  /**
   * Where you write the generator specific files (routes, controllers, etc)
   */
  writing() {
    // Find and read entity files
    this._readEntities();

    // Create files
    this._writeEntities();
  }

  _readEntities() {
    const generator = this;
    const dir = this.options['entity-path'];
    this._entityPath = path.normalize(dir);

    fs.readdirSync(this._entityPath).forEach(function (entityFilename) {

      let filePath = path.join(generator._entityPath, entityFilename);
      let entityName = entityFilename.split('.')[0];

      let template = {
        name: Util.createNames(entityName),
        properties: []
      };

      template.properties = generator._extractPropertiesFromFile(filePath);
      generator._entities.push(template);
    });
  }

  _writeEntities() {
    this._entities.forEach((entity) => {

      if (!this.options['skip-frontend']) {
        this.frontendUtil.createEntity(entity);
      }

      if (!this.options['skip-backend']) {
        this.backendUtil.createFromEntity(entity, {
          dest: path.resolve(this._entityPath, '../')
        });
      }
    });
  }

  _extractPropertiesFromFile(filePath) {
    let fileContent = fs.readFileSync(filePath).toString();
    return this._extractPropertiesFromContent(fileContent);
  }

  _extractPropertiesFromContent(stringContent) {
    let properties = [];
    let propertyRegex = /private\s+(\w+)\s+(\w+)\s*;/g;
    let match;
    while (match = propertyRegex.exec(stringContent)) {
      // matched text: match[0]
      // match start: match.index
      // capturing group n: match[n]
      // group 1: property type
      // group 2: property name
      let property = {
        type: match[1],
        name: match[2]
      };
      properties.push(property);
    }
    return properties;
  }
}
