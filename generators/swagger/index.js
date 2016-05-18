'use strict';
var yeoman = require('yeoman-generator');
var jsonQ = require("jsonq");
var fs = require("fs");

//module.exports = yeoman.Base.extend({
 //   config: function () {
        this.swagger = fs.readFileSync('swagger.json', 'utf-8');
          //  this.readFileAsString('swagger.json');
        var family = jsonQ(this.swagger);
        var basePath = family.find('basePath').value();
        var definitions = family.find('definitions').value();
        var paths = family.find('paths').value();
        var properties = family.find('definitions').find('User').find('properties').value();

//   console.log(paths);
//        console.log(properties);
//        console.log(definitions);

        jsonQ.each(paths[0], function (key, value) {
            console.log(key);

            var services = family.find('paths').find(key).value();

            jsonQ.each(services[0], function (key2, value2) {
                console.log(key2);
//                this.fs.copyTpl(
//                    this.templatePath('frontend/app/scripts/services/_service.js'),
//                    this.destinationPath('frontend/app/scripts/services/' + this.props.name.toLowerCase() + '.js'), {
//                    classe: key
//                }
//            );
            });



            console.log('---------------------------');
        });

        jsonQ.each(definitions[0], function (key, value) {
            console.log(key);

            var properties = family.find('definitions').find(key).find('properties').value();

            jsonQ.each(properties[0], function (key2, value2) {
                console.log(key2);
            });

            var name = family.find('paths', function () {
                return this[0].toLowerCase() == 'm'
            });

             console.log('---------------------------');
        });

//
//        jsonQ.each(paths[0], function (key, value) {
//            console.log(key);
//            jsonQ.each(value, function (key2, value2) {
//                console.log(key2);
//            });
//            console.log('---------------------------');
//        });


//        this.fs.copyTpl(
//            this.templatePath('frontend/app/scripts/controllers/_controller.js'),
//            this.destinationPath('frontend/app/scripts/controllers/' + this.props.name.toLowerCase() + '.js'), {
//            name: this.props.name
//        }
//        );
//
//        this.fs.copyTpl(
//            this.templatePath('frontend/app/scripts/services/_service.js'),
//            this.destinationPath('frontend/app/scripts/services/' + this.props.name.toLowerCase() + '.js'), {
//            name: this.props.name
//        }
//        );
//
//        this.fs.copyTpl(
//            this.templatePath('frontend/app/scripts/routes/_route.js'),
//            this.destinationPath('frontend/app/scripts/routes/' + this.props.name.toLowerCase() + '.js'), {
//            name: this.props.name
//        }
//        );
//
//        this.fs.copyTpl(this.templatePath('frontend/app/views/view/view-edit.html'),
//            this.destinationPath('frontend/app/views/' + this.props.name.toLowerCase() + '/edit.html'), {
//            name: this.props.name
//        });
//        this.fs.copyTpl(this.templatePath('frontend/app/views/view/view-list.html'),
//            this.destinationPath('frontend/app/views/' + this.props.name.toLowerCase() + '/list.html'), {
//            name: this.props.name
//        });
//
//        var pu = cheerio.load(this.readFileAsString('frontend/app/index.html'), {xmlMode: false});
//        pu('<li><a href="#' + this.props.name.toLowerCase() + '"><i class="glyphicon glyphicon-stats"></i>' + this.props.name + '</a></li>').appendTo('#menu');
//        this.fs.write('frontend/app/index.html', pu.html());



   // }
//});
