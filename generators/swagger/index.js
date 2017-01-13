const Generator = require('yeoman-generator');
const Util = require('../../Utils/util');
const FrontendUtil = require('../../Utils/frontend');
const SwaggerParser = new (require('swagger-parser'))();
const htmlWiring = require('html-wiring');
const jsonQ = require('jsonq');
const _ = require('lodash');
const filter = require('gulp-filter');
const htmlFilter = filter(['**/*.html'], { restore: true });
const htmlBeautify = require('gulp-prettify');
const jsBeautify = require('gulp-beautify');
// const cheerio = require('cheerio');

module.exports = class SwaggerGenerator extends Generator {

  constructor(args, opts) {
    super(args, opts);

    this.frontendUtil = new FrontendUtil(this);

    // Objeto que armazena as informações passadas ao copyTpl(,,this._template)
    this._template = {};

    // Arguments - passados direto pela cli (ex.: yo demoiselle:swagger custom-swagger.json)
    this.argument('swaggerPath', {
      desc: 'Caminho para o arquivo swagger',
      type: String,
      required: false
    });
    if (!this.swaggerPath) {
      this.swaggerPath = './swagger.json';
    }

    // Options - parecido com "argument", mas vão como "flags" (--option)
    this.option('skip-install');
  }

  /**
   * Your initialization methods (checking current project state, getting configs, etc)
   */
  initializing() {
    this.log('[initializing] done.');

    // Configure beautify
    this.registerTransformStream(htmlFilter);
    this.registerTransformStream(htmlBeautify());
    this.registerTransformStream(htmlFilter.restore);

    // Read swagger spec file
    let filePath = __dirname + this.options.swaggerPath;
    if (this.fs.exists(filePath)) {
      // this.swagger = htmlWiring.readFileAsString(filePath);
      let promise = SwaggerParser.parse(filePath);

      promise.then(function (api) {
        this.swagger = api;
        this.swaggerQ = jsonQ(this.swagger);
        this._readApiMetas();
        this._readEntities();
        // this._readEntpoints();
      }.bind(this))
        .catch(function (err) {
          console.log('[Swagger] Error:', err);
        });
    } else {
      throw new Error('Nenhum "swagger file" encontrado:' + filePath);
    }
  }

  /**
   * Where you prompt users for options (where you'd call this.prompt())
   * Examples: name of app? which frameworks? which template engine?
   */
  prompting() {
    this.log('[prompting] (not yet)');
    let prompts = [];

    if (this._entities && this._entities.length > 0) {
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
        message: 'Quais entidades você quer gerar?',
        choices: options
      });
    }

    return this.prompt(prompts).then(function (answers) {
      this.answers = answers;

      // Keep only checked entities
      this._entities = _.intersectionWith(this._entities, answers.entities, (entity, answer) => {
        return entity.name.capital === answer;
      });
    }.bind(this));
  }

  /**
  * Where you write the generator specific files (routes, controllers, etc)
  */
  writing() {
    this._writeEntities(this._entities);
  }

  /**
   * Where conflicts are handled (used internally)
   */
  conflicts() {
    this.log('[conflicts] done.');
  }

  /**
   * Where installation are run (npm, bower, mvn)
   */
  install() {
    this.log('[install] done.');
  }

  /**
   * Called last, cleanup, say good bye, etc
   */
  end() {
    this.log('[end] done.');
  }

  // ---------------
  // Private methods
  // ---------------

  _readApiMetas() {
    let info = this.swaggerQ.find('info').value()[0];
    let bashPath = this.swaggerQ.find('basePath').value()[0];
    let title = info.title;
    console.log('Gerando arquivos para o projeto:', title);
    console.log('API:', bashPath);
  }

  _readEntities() {
    this._entities = this._entities || [];

    let definitions = this.swaggerQ.find('definitions').value()[0];
    jsonQ.each(definitions, (key, value) => {
      let entity = {
        name: Util.createNames(key),
        properties: [],
        _entity: value
      };

      jsonQ.each(value.properties, (key, value) => {
        let property = {
          name: Util.createNames(key),
          type: value.type,
          format: value.format,
          description: value.description,
          isEnum: Array.isArray(value.enum)
          // htmlType: Util.getCommonType(value.type, value.format),
        };

        // STRG      -> input text, text area,
        // STR/DATE  -> o
        // BOOL      ->
        // ENUM      -> select/option
        // console.log('%s.%s (%s,%s)', entity.name.capital, property.name.camel, property.type, property.format);

        entity.properties.push(property);
      });

      this._entities.push(entity);
    });
  }

  /**
   * Para cada entidade encontrada, gerar o model equivalente.
   */
  _writeEntities(entities) {
    entities.forEach((entity) => {
      this.frontendUtil.createEntity(entity);
    });
  }
};

