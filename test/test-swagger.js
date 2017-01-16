const fse = require('fs-extra');
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

describe('yo demoiselle:swagger', () => {
  let swaggerGenerator;

  beforeEach(() => {
    swaggerGenerator = helpers
      .run(require.resolve('../generators/swagger'))
      .withOptions({
        'skip-install': true,
        'skip-transform': true
      });
  });

  describe('quando usar o uber.yml', () => {
    beforeEach((done) => {
      swaggerGenerator
        .inTmpDir(function (dir) {
          fse.copySync(path.join(__dirname, '../test/swagger-examples'), dir);
        })
        .withArguments(['uber.yml'])
        .withPrompts({
          entities: ['Product']
        })
        .on('end', done);
    });

    it('DEVE criar os arquivos da entidade "Product"', () => {
      let baseFiles = [
        'frontend/src/app/entity/product/product.ts',
        'frontend/src/app/entity/product/product.html',
        'frontend/src/app/entity/product/shared/product.model.ts',
        'frontend/src/app/entity/product/shared/product.service.ts',
        'frontend/src/app/entity/product/shared/product.service.spec.ts',
        'frontend/src/app/entity/product/details/product-details.ts',
        'frontend/src/app/entity/product/details/product-details.html',
        'frontend/src/app/entity/product/form/product-form.ts',
        'frontend/src/app/entity/product/form/product-form.html',
        'frontend/src/app/entity/product/list/product-list.ts',
        'frontend/src/app/entity/product/list/product-list.html'
      ];
      assert.file(baseFiles);
      // assert.file('nao-existe.file');
    });

    it('NÃO DEVE criar os arquivos da entidade "Activity"', () => {
      assert.noFile('frontend/src/app/entity/activity/activity.ts');
    });

    // it('DEVE criar os providers (frontend) para consumir serviços', () => {
    //   assert(false);
    // });
  });


  // it('DEVE passar nos testes', () => {
  // });

  // it('DEVE compilar para produção', () => {
  // });
});
