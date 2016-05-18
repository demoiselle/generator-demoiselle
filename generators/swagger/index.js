'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var jsonQ = require("jsonq");

module.exports = yeoman.Base.extend({
    prompting: function () {

         var prompts = [{
                type: 'input',
                name: 'name',
                message: 'Caminho para o swagger.json'
            }];

        return this.prompt(prompts).then(function (props) {
            this.props = props;
        }.bind(this));
    },
    config: function () {

	console.log(this.props.name);
	
    var someData_notJSON = JSON.parse(this.props.name);
    console.log(someData_notJSON[0].red);

       //this.fs.copy(this.templatePath('frontend/.bowerrc'), this.destinationPath('frontend/.bowerrc'));
       //this.fs.copy(this.templatePath('frontend/.npmrc'), this.destinationPath('frontend/.npmrc'));

    },
    install: function () {
        //this.installDependencies();
    }
});
