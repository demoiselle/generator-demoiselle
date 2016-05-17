'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

module.exports = yeoman.Base.extend({
    prompting: function () {

        var prompts = [{
                type: 'input',
                name: 'name',
                message: 'Qual o nome da nova funcionalidade?'
            }];

        return this.prompt(prompts).then(function (props) {
            this.props = props;
        }.bind(this));
    },
    config: function () {
        this.fs.copyTpl(
                this.templatePath('backend/src/main/java/app/business/_pojoBC.java'),
                this.destinationPath('backend/src/main/java/app/business/' + this.props.name + 'BC.java'), {
            name: this.props.name
        }
        );
        this.fs.copyTpl(
                this.templatePath('backend/src/main/java/app/entity/_pojo.java'),
                this.destinationPath('backend/src/main/java/app/entity/' + this.props.name + '.java'), {
            name: this.props.name
        }
        );
        this.fs.copyTpl(
                this.templatePath('backend/src/main/java/app/persistence/_pojoDAO.java'),
                this.destinationPath('backend/src/main/java/app/persistence/' + this.props.name + 'DAO.java'), {
            name: this.props.name
        }
        );
        this.fs.copyTpl(
                this.templatePath('backend/src/main/java/app/service/_pojoREST.java'),
                this.destinationPath('backend/src/main/java/app/service/' + this.props.name + 'REST.java'), {
            name: this.props.name
        }
        );

        this.fs.copyTpl(
                this.templatePath('frontend/app/scripts/controllers/_controller.js'),
                this.destinationPath('frontend/app/scripts/controllers/' + this.props.name + '.js'), {
            name: this.props.name
        }
        );

        this.fs.copyTpl(
                this.templatePath('frontend/app/scripts/services/_service.js'),
                this.destinationPath('frontend/app/scripts/services/' + this.props.name + '.js'), {
            name: this.props.name
        }
        );

    },
    install: function () {
        //this.installDependencies();
    }
});
