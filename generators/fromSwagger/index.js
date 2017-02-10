const Generator = require('yeoman-generator');
const path = require('path');
const Util = require('../../Utils/util');
const FrontendUtil = require('../../Utils/frontend');
const BackendUtil = require('../../Utils/backend');
const SwaggerParser = new (require('swagger-parser'))();
const jsonQ = require('jsonq');
const _ = require('lodash');
const filter = require('gulp-filter');
const htmlFilter = filter(['**/*.html'], { restore: true });
const htmlBeautify = require('gulp-prettify');
const tsFilter = filter(['**/*.ts'], { restore: true });
const tsBeautify = require('gulp-typescript-formatter');
// const htmlWiring = require('html-wiring');
// const cheerio = require('cheerio');

/**
 * SwaggerGenerator é o gerador demoiselle que utiliza uma spec swagger como 'input'
 *
 * yo demoiselle:swagger swagger.json
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
    this.backendUtil = new BackendUtil(this);
    Util.changeRootPath(this);

    // Objeto que armazena as informações passadas aos arquivos templates
    this._template = {};
    this._entities = [];

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
    this.option('no-transform');
    this.option('skip-frontend');
    this.option('skip-backend');
  }

  /**
   * Your initialization methods (checking current project state, getting configs, etc)
   */
  initializing() {
    this.log('[initializing] done.');

    // Configure beautify
    if (!this.options['skip-transform']) {
      // HTML
      this.registerTransformStream(htmlFilter);
      this.registerTransformStream(htmlBeautify());
      this.registerTransformStream(htmlFilter.restore);
      // TS
      this.registerTransformStream(tsFilter);
      this.registerTransformStream(tsBeautify({
        tslint: false, // use tslint.json file?
        tsfmt: false, // use tsfmt.json file? Overrides settings in tslint.json (at least indentSize)
        editorconfig: false
      }));
      this.registerTransformStream(tsFilter.restore);
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
        message: 'Quais entidades você quer gerar?',
        choices: options
      });
    } else {
      this.log('Nenhuma entidade encontrada.');
    }

    if (!this.config.get('project')) {
            console.log('Nome do projeto não encontrado na configuração...')
            prompts.push({
                type: 'input',
                name: 'project',
                message: 'Informe o nome do seu projeto:',
                default: 'app'
            });
        }
        if (!this.config.get('package')) {
            console.log('Package do backend não encontrado na configuração...')
            prompts.push({
                type: 'input',
                name: 'package',
                message: 'Informe o package do backend:',
                default: 'org.demoiselle'
            });
        }
        if (!this.config.get('prefix')) {
            console.log('Prefixo dos componentes não encontrado na configuração...')
            prompts.push({
                type: 'input',
                name: 'prefix',
                message: 'Informe um prefixo para seus componentes:',
                default: 'my'
            });
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
      this.options['skip-frontend'] = !(answers.skips.indexOf('frontend') > -1);
      this.options['skip-backend'] = !(answers.skips.indexOf('backend') > -1);

      this.project = this.config.get('project') || answers.project;
      this.package = this.config.get('package') || answers.package;
      this.prefix = this.config.get('prefix') || answers.prefix;

    }.bind(this));
  }

  /**
  * Where you write the generator specific files (routes, controllers, etc)
  */
  writing() {
    this._writeEntities();
    this._writeEndpoints();
  }

  /**
   * Where conflicts are handled (used internally)
   */
  conflicts() {
    // this.log('[conflicts] step ignored.');
  }

  /**
   * Where installation are run (npm, bower, mvn)
   */
  install() {
    // this.log('[install] step ignored.');
  }

  /**
   * Called last, cleanup, say good bye, etc
   */
  end() {
    // this.log('[end] step ignored.');
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
        generator._readEndpoints();
        done();
      }).catch(function (err) {
        console.log('[Swagger] Error:', err);
        done();
      });
    } else {
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
  _writeEntities() {
    this._entities.forEach((entity) => {

      if (!this.options['skip-frontend']) {
        this.frontendUtil.createCrud(entity, {
          project: Util.createNames(this.project),
          prefix: Util.createNames(this.prefix)
        });
      }

      if (!this.options['skip-backend']) {
        this.backendUtil.createCrud(entity, {
            package: Util.createNames(this.package),
            project: Util.createNames(this.project)
        });
      }
    });
  }

  _readEndpoints() {
    let generator = this;
    generator._endpoints = generator._endpoints || [];

    let paths = generator.swaggerQ.find('paths').value()[0];
    jsonQ.each(paths, (key, value) => {
      let endpoint = {
        name: Util.createNames(key),
        methods: [],
        _endpoint: value
      };

      let swaggerEndpoint = jsonQ(value).value()[0];
      jsonQ.each(swaggerEndpoint, (key, value) => {
        let method = {
          name: Util.createNames(key),
          value: value
        };
        endpoint.methods.push(method);
      });

      generator._endpoints.push(endpoint);
    });
  }

  _writeEndpoints() {
    this._endpoints.forEach((endpoint) => {

      if (!this.options['skip-frontend']) {
        this.frontendUtil.createService(endpoint);
      }

      // if (!this.options['skip-backend']) {
      //   this.backendUtil.createService(endpoint);
      // }
    });
  }
};

