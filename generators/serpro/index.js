'use strict';
var yeoman = require('yeoman-generator');

module.exports = yeoman.Base.extend({
    prompting: function () {

        var prompts = [{
                type: 'confirm',
                name: 'name',
                message: 'Inserir direcionador para o repositório interno do SERPRO?',
                default: true
            }];

        return this.prompt(prompts).then(function (props) {
            this.props = props;
        }.bind(this));
    },
    config: function () {
        this.fs.copy(this.templatePath('frontend/_bowerrc'), this.destinationPath('frontend/.bowerrc'));
        this.fs.copy(this.templatePath('frontend/_npmrc'), this.destinationPath('frontend/.npmrc'));
        this.fs.copy(this.templatePath('frontend/_jshintrc'), this.destinationPath('frontend/.jshintrc'));
    }
});
