'use strict';
var yeoman = require('yeoman-generator');
var jsonQ = require("jsonq");
var htmlWiring = require('html-wiring');
var cheerio = require('cheerio');

module.exports = yeoman.Base.extend({
    config: function () {
        this.swagger = htmlWiring.readFileAsString('swagger.json');
        var family = jsonQ(this.swagger);
        var definitions = family.find('definitions').value();
        var paths = family.find('paths').value();

        var lote = {};
        lote.basePath = family.find('basePath').value();
        lote.entidades = [];
        lote.servicos = [];

        jsonQ.each(definitions[0], function (key, value) {
            var entidade = {};
            entidade.propriedades = [];
            entidade.nome = key;

            var properties = family.find('definitions').find(key).find('properties').value();

            jsonQ.each(properties[0], function (key2, value2) {
                entidade.propriedades.push(key2);
            });

            lote.entidades.push(entidade);
        });

        jsonQ.each(paths[0], function (key, value) {
            var servico = {};
            servico.comandos = [];
            servico.caminho = key;

            var services = family.find('paths').find(key).value();

            jsonQ.each(services[0], function (key2, value2) {
                servico.comandos.push(key2);
            });

            lote.servicos.push(servico);
        });


        var html = cheerio.load(htmlWiring.readFileAsString('frontend/app/index.html'), {xmlMode: false});

        lote.entidades.forEach(function (item) {
            console.log('Entidade: ' + item.nome + ' : ' + item.propriedades);
            this.fs.copyTpl(
                    this.templatePath('frontend/app/scripts/routes/_route.js'),
                    this.destinationPath('frontend/app/scripts/routes/' + item.nome.toLowerCase() + '.js'), {
                name: item.nome
            });
            console.log('--- Route: ok');

            this.fs.copyTpl(
                    this.templatePath('frontend/app/scripts/controllers/_controller.js'),
                    this.destinationPath('frontend/app/scripts/controllers/' + item.nome.toLowerCase() + '.js'), {
                name: item.nome
            }
            );
            console.log('--- Controller: ok');

            this.fs.copyTpl(
                    this.templatePath('frontend/app/scripts/services/_service.js'),
                    this.destinationPath('frontend/app/scripts/services/' + item.nome.toLowerCase() + '.js'), {
                entityName: item.nome
            }
            );
            console.log('--- Service: ok*(ainda somente apps Demoiselle)');

            this.fs.copyTpl(this.templatePath('frontend/app/views/view/view-edit.html'),
                    this.destinationPath('frontend/app/views/' + item.nome.toLowerCase() + '/edit.html'), {
                props: item
            });
            console.log('--- View-edit: ok');

            this.fs.copyTpl(this.templatePath('frontend/app/views/view/view-list.html'),
                    this.destinationPath('frontend/app/views/' + item.nome.toLowerCase() + '/list.html'), {
                props: item
            });
            console.log('--- View-list: ok');

            html('<li><a href="#' + item.nome.toLowerCase() + '"><i class="glyphicon glyphicon-stats"></i>' + item.nome + '</a></li>').appendTo('#menu');


        }.bind(this));

        this.fs.write('frontend/app/index.html', html.html());

//        lote.servicos.forEach(function (item) {
//            this.fs.copyTpl(
//                    this.templatePath('frontend/app/scripts/services/_service.js'),
//                    this.destinationPath('frontend/app/scripts/services/' + item.caminho.split("/")[1].toLowerCase() + '.js'), {
//                entityName: item.caminho.split("/")[1].charAt(0).toUpperCase() + item.caminho.split("/")[1].slice(1)
//            }
//            );
//            console.log('Services: ' + item.caminho.split("/")[1].charAt(0).toUpperCase() + item.caminho.split("/")[1].slice(1));
//        }.bind(this));

    }
});
