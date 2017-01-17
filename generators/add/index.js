const Generator = require('yeoman-generator');
// const BackendUtil = require('../../Utils/backend');
// const _ = require('lodash');

/**
 * yo demoiselle:add entity-name
 *
 * Demoiselle generator for new entities.
 */
module.exports = class AddGenerator extends Generator {

  constructor(args, opts) {
    super(args, opts);

    // Arguments - passados direto pela cli (ex.: yo demoiselle:add my-feature)
    this.argument('entity', {
      desc: 'Nome da entidade a ser criada. (ex.: Pessoa)',
      type: String,
      required: false
    });

    // Options - parecido com "argument", mas vão como "flags" (--option)
    this.option('output', {
      desc: '[backend,frontend] - Camadas a serem geradas',
      alias: 'o',
      type: String
    });
  }

  /**
   * Your initialization methods (checking current project state, getting configs, etc)
   */
  initializing() {
    this.log('[initializing] done.');
  }

  /**
   * Where you prompt users for options (where you'd call this.prompt())
   * Examples: name of app? which frameworks? which template engine?
   */
  prompting() {
    let prompts = [];

    if (!this.options.entity) {
      prompts.push({
        type: 'input',
        name: 'entity',
        message: 'Dê um nome para a nova entidade:',
        default: 'Todo'
      });
    }

    if (this.options.output) {
      this.options.output = this.options.output.split(',');
    } else {
      prompts.push({
        type: 'checkbox',
        name: 'output',
        message: 'Quais camadas você quer gerar?',
        choices: [{
          name: 'Backend - Demoiselle 3 Server JEE7 (REST)',
          value: 'backend',
          short: 'backend',
          checked: true
        }, {
          name: 'Frontend - Angular2',
          value: 'frontend',
          short: 'frontend',
          checked: true
        }]
      });
    }

    return this.prompt(prompts).then(function (answers) {
      this.answers = answers;
      this.name = this.options.entity || answers.entity;
      this.output = this.options.output || answers.output;
    }.bind(this));
  }

  /**
   * Where you write the generator specific files (routes, controllers, etc)
   */
  writing() {
    // entityName
    let entity = {
      name: super._buildTemplateName(this.name),
      properties: []
    };

    // Generate Frontend CRUD?
    super._generateFrontendEntity(entity);
    super._generateFrontendEntityShared(entity);
    super._generateFrontendEntityList(entity);
    super._generateFrontendEntityForm(entity);
    super._generateFrontendEntityDetails(entity);
  }

  /**
   * Where conflicts are handled (used internally)
   */
  conflicts() {
    this.log('[conflicts] done.');
  }

  /**
   * Where installation are run (npm, bower)
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
  // PRIVATE methods
  // ---------------

  // _generateBackend(name) {
  //   let template = super._buildTemplateName(name);
  //   let backendFileMap = {
  //     'backend/src/main/java/app/business/_pojoBC.java': 'backend/src/main/java/app/business/' + template.name.capital + 'BC.java',
  //     'backend/src/main/java/app/entity/_pojo.java': 'backend/src/main/java/app/entity/' + template.name.capital + '.java',
  //     'backend/src/main/java/app/persistence/_pojoDAO.java': 'backend/src/main/java/app/persistence/' + template.name.capital + 'DAO.java',
  //     'backend/src/main/java/app/service/_pojoREST.java': 'backend/src/main/java/app/service/' + template.name.capital + 'REST.java'
  //   };
  //   this._generateFiles(backendFileMap, template);
  //   // include feature on persistence XML
  //   let persistenceXML = cheerio.load(htmlWiring.readFileAsString('backend/src/main/resources/META-INF/persistence.xml'), {xmlMode: true});
  //   persistenceXML('jta-data-source').after('<class>app.entity.' + template.name.capital + '</class>');
  //   this.fs.write('backend/src/main/resources/META-INF/persistence.xml', persistenceXML.html());
  // }
};

