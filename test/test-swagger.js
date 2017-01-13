const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

describe('yo demoiselle:swagger', () => {
  before(() => {
    return helpers.run(path.join(__dirname, '../generators/swagger'))
      .withArguments(['./../../test/swagger-examples/uber.yml'])
      .withOptions(
      {
        // input: './swagger-examples/uber.yml',
        'skip-install': true
      })
      // .withPrompts({ name: 'swagger' })
      .toPromise();
  });

  it('DEVE criar os arquivos', () => {
    assert.file([
      'dummyfile.txt'
    ]);
  });

  it('DEVE passar nos testes', () => {
  });

  it('DEVE compilar para produção', () => {
  });
});
