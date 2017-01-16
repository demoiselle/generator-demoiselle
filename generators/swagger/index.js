const Generator = require('yeoman-generator');
const path = require('path');
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

/**
 * SwaggerGenerator é o gerador demoiselle que utiliza uma spec swagger como 'input'
 *
 * Estratégias:
 * 1) procura primeiro se um arquivo swagger.[json|yml] existe.
 * 1.1) caso não encontre, pergunta o caminho do arquivo.
 * 2) apresenta uma lista de entidades para criar os CRUDs
 * 3) apresenta uma lista de endpoints para criar os providers
 */
module.exports = class SwaggerGenerator extends Generator {

  constructor(args, opts) {
    super(args, opts);

    this.frontendUtil = new FrontendUtil(this);

    // Objeto que armazena as informações passadas aos arquivos templates
    this._template = {};

    // Arguments - passados direto pela cli (ex.: yo demoiselle:swagger custom-swagger.json)
    this.argument('swaggerPath', {
      desc: 'Caminho para o arquivo swagger',
      type: String,
      required: false
    });
    if (!this.options.swaggerPath) {
      this.options.swaggerPath = './swagger.json';
    }

    // Options - parecido com "argument", mas vão como "flags" (--option)
    this.option('skip-install');
    this.option('no-transform');
  }

  /**
   * Your initialization methods (checking current project state, getting configs, etc)
   */
  initializing() {
    this.log('[initializing] done.');

    // Configure beautify
    if(!this.options['skip-transform']){
      this.registerTransformStream(htmlFilter);
      this.registerTransformStream(htmlBeautify());
      this.registerTransformStream(htmlFilter.restore);
    }

    // Read swagger.json
    this._readSwaggerFile();
  }

  /**
   * Where you prompt users for options (where you'd call this.prompt())
   * Examples: name of app? which frameworks? which template engine?
   */
  prompting() {
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

  _readSwaggerFile() {
    let generator = this;
    let filePath = path.join(this.options.swaggerPath);
    if (this.fs.exists(filePath)) {
      let promise = SwaggerParser.parse(filePath);
      var done = this.async();

      promise.then(function (api) {
        generator.swagger = api;
        generator.swaggerQ = jsonQ(generator.swagger);
        generator._readApiMetas();
        generator._readEntities();
        // generator._readEntpoints();
        done();
      }).catch(function (err) {
        console.log('[Swagger] Error:', err);
        done();
      });
    } else {
      // console.log('Nenhum swagger file encontrado!');
      // console.log('__dirname', __dirname);
      // console.log('cwd:', process.cwd());
      // console.log('filePath:', filePath);
      throw new Error('Nenhum "swagger file" encontrado em ' + filePath);
    }
  }

  _readApiMetas() {
    // let info = this.swaggerQ.find('info').value()[0];
    // let bashPath = this.swaggerQ.find('basePath').value()[0];
    // console.log('Título:', info.title);
    // console.log('Versão:', info.version);
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

