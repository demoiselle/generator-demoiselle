'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

module.exports = yeoman.Base.extend({
    prompting: function () {
        // Have Yeoman greet the user.
        this.log(yosay(
                'Bem vindo ao ' + chalk.red('generator-demoiselle') + ' crie sua app aqui!!!'
                ));

        var prompts = [{
                type: 'input',
                name: 'name',
                message: 'Qual o nome da sua app?',
                default: this.appname
            }];

        return this.prompt(prompts).then(function (props) {
            this.props = props;
        }.bind(this));
    },
    config: function () {
        this.fs.copyTpl(
                this.templatePath('frontend/_package.json'),
                this.destinationPath('frontend/package.json'), {
            name: this.props.name
        }
        );
        this.fs.copyTpl(
                this.templatePath('frontend/_bower.json'),
                this.destinationPath('frontend/bower.json'), {
            name: this.props.name
        }
        );

        this.fs.copy(this.templatePath('frontend/Gruntfile.js'), this.destinationPath('frontend/Gruntfile.js'));
        this.fs.copy(this.templatePath('frontend/app'), this.destinationPath('frontend/app'));

        this.fs.copy(this.templatePath('backend/'), this.destinationPath('backend/'));

    },
    install: function () {
        //this.installDependencies();
    }
});

