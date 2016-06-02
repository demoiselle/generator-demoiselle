'use strict';
var yeoman = require('yeoman-generator');
var cheerio = require('cheerio');
var htmlWiring = require('html-wiring');
var fs = require('fs');

module.exports = yeoman.Base.extend({
    prompting: function () {

        var prompts = [{
                type: 'input',
                name: 'name',
                message: 'Qual o nome do pacote onde estão as entidades ?',
                default: 'entity'
            }];

        return this.prompt(prompts).then(function (props) {
            this.props = props;
        }.bind(this));
    },
    config: function () {

        var dir = 'backend/src/main/java/app/';
        fs.readdirSync(dir + this.props.name).forEach(function (file) {

            var entityName = file.split('.')[0];
            var fileName = dir + this.props.name + '/' + file;

            if (entityName !== 'User') {

                var entidade = {};
                entidade.propriedades = [];
                entidade.nome = entityName;

                fs.readFileSync(fileName).toString().split('\n').forEach(function (line) {
                    if (line.indexOf('private') > -1) {
                        if (line.trim().split(' ')[2].replace(';', '') !== 'final')
                            entidade.propriedades.push(line.trim().split(' ')[2].replace(';', ''));
                    }
                });

                console.log('Entidade: ' + entityName);

                this.fs.copyTpl(
                        this.templatePath('backend/src/main/java/app/business/_pojoBC.java'),
                        this.destinationPath('backend/src/main/java/app/business/' + entityName + 'BC.java'), {
                    name: entityName
                }
                );
                console.log('--- BC ok');

                this.fs.copyTpl(
                        this.templatePath('backend/src/main/java/app/persistence/_pojoDAO.java'),
                        this.destinationPath('backend/src/main/java/app/persistence/' + entityName + 'DAO.java'), {
                    name: entityName
                }
                );
                console.log('--- DAO ok');
                this.fs.copyTpl(
                        this.templatePath('backend/src/main/java/app/service/_pojoREST.java'),
                        this.destinationPath('backend/src/main/java/app/service/' + entityName + 'REST.java'), {
                    name: entityName
                }
                );
                console.log('--- Rest ok');
                this.fs.copyTpl(
                        this.templatePath('frontend/app/scripts/routes/_route.js'),
                        this.destinationPath('frontend/app/scripts/routes/' + entityName.toLowerCase() + '.js'), {
                    name: entityName
                });
                console.log('--- Route: ok');

                this.fs.copyTpl(
                        this.templatePath('frontend/app/scripts/controllers/_controller.js'),
                        this.destinationPath('frontend/app/scripts/controllers/' + entityName.toLowerCase() + '.js'), {
                    name: entityName
                }
                );
                console.log('--- Controller: ok');

                this.fs.copyTpl(
                        this.templatePath('frontend/app/scripts/services/_service.js'),
                        this.destinationPath('frontend/app/scripts/services/' + entityName.toLowerCase() + '.js'), {
                    name: entityName
                }
                );
                console.log('--- Service: ok*(ainda somente apps Demoiselle)');

                this.fs.copyTpl(this.templatePath('frontend/app/views/view/view-edit.html'),
                        this.destinationPath('frontend/app/views/' + entityName.toLowerCase() + '/edit.html'), {
                    props: entidade
                });
                console.log('--- View-edit: ok');

                this.fs.copyTpl(this.templatePath('frontend/app/views/view/view-list.html'),
                        this.destinationPath('frontend/app/views/' + entityName.toLowerCase() + '/list.html'), {
                    props: entityName
                });
                console.log('--- View-list: ok');

                var pu = cheerio.load(htmlWiring.readFileAsString('frontend/app/index.html'), {xmlMode: false});
                pu('<li><a href="#' + entityName.toLowerCase() + '"><i class="glyphicon glyphicon-stats"></i>' + entityName + '</a></li>').appendTo('#menu');
                this.fs.write('frontend/app/index.html', pu.html());
            }

        }.bind(this));

    }
});
