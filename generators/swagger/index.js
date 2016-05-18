'use strict';
var yeoman = require('yeoman-generator');
var jsonQ = require("jsonq");

module.exports = yeoman.Base.extend({
    config: function () {
        this.indexFile = this.readFileAsString('swagger.json');
        var family = jsonQ(this.indexFile);
        var basePath = family.find('basePath').value();
        var definitions = family.find('definitions').value();
        var paths = family.find('paths').value();


        //console.log(servicos);
        //console.log(basePath);
        console.log(definitions);
        //console.log(paths[0]);
        //console.log(paths.length);
//        paths.forEach(function (item) {
//            console.log(item);
//        });
        //console.log(paths[0][0]);


        for (var i = 0; i < paths[0].length; i++) {
            //console.log(paths[i]);
            //console.log(family.find(paths[i]).value());
        }


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



    },
    install: function () {
        //this.installDependencies();
    }
});
