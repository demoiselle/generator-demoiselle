'use strict';
var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');

describe('generator-demoiselle:app', () => {
  describe('when generate a Todo project', () => {
    before(function () {
      return helpers.run(path.join(__dirname, '../generators/app'))
        .withPrompts({someAnswer: true})
        .toPromise();
    });

    it('create files', function () {
      assert.file([
        'dummyfile.txt'
      ]);
    });
  });
});
