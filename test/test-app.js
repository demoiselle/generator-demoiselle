const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

describe('yo demoiselle:app', () => {
  before(() => {
    return helpers.run(path.join(__dirname, '../generators/app'))
      // .withArguments(['name-x'])
      .withOptions({ 'skip-install': true })
      .withPrompts({ project: 'Todo' })
      .toPromise();
  });

  it('DEVE criar os arquivos', () => {
    assert(false);
    // assert.file(['dummyfile.txt']);
  });
  // describe('quando gerar um projeto Blank', () => {});
  describe('quando gerar um projeto ToDo', () => {

    // it('DEVE passar nos testes', () => {
    //   // assert.file(['dummyfile.txt']);
    // });

    // it('DEVE compilar para produção', () => {
    //   // assert.file(['dummyfile.txt']);
    // });
  });
  // describe('quando gerar um projeto Store', () => {});
});
