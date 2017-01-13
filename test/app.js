const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

describe('yo demoiselle:app', () => {
  // describe('quando gerar um projeto Blank', () => {});
  describe('quando gerar um projeto ToDo', () => {
    before(() => {
      return helpers.run(path.join(__dirname, '../generators/app'))
        .withPrompts({ someAnswer: true })
        .toPromise();
    });

    it('DEVE criar os arquivos', () => {
      assert.file([
        'dummyfile.txt'
      ]);
    });

    it('DEVE passar nos testes', () => {
      // assert.file(['dummyfile.txt']);
    });

    it('DEVE compilar para produção', () => {
      // assert.file(['dummyfile.txt']);
    });
  });
  // describe('quando gerar um projeto Store', () => {});
});
