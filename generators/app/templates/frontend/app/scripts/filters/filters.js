'use strict';

app.filter('tamanho', function() {
    return function humanFileSize(bytes) {
        var thresh = 1024;
        if (bytes < thresh)
            return bytes + ' B';
        var units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        var u = -1;
        do {
            bytes /= thresh;
            ++u;
        } while (bytes >= thresh);
        return bytes.toFixed(1) + ' ' + units[u];
    };
});


app.filter('tipoArquivo', function() {
    var tipos = {};
    var path = "images/filetypes/";
    tipos['image'] = path + "doc.png";
    tipos['doc'] = path + "doc.png";
    tipos['xls'] = path + "xls.png";
    tipos['zip'] = path + "zip.png";
    tipos['pdf'] = path + "pdf.png";
    tipos['unknow'] = path + "unknow.png";

    return function(tipo) {
        var url = tipos['unknow'];
        if (tipo.indexOf('image') > -1) {
            url = tipos['image'];
        } else if (tipo.indexOf('doc') > -1) {
            url = tipos['doc'];
        } else if (tipo.indexOf('odt') > -1) {
            url = tipos['odt'];
        } else if (tipo.indexOf('xls') > -1) {
            url = tipos['xls'];
        } else if (tipo.indexOf('zip') > -1) {
            url = tipos['zip'];
        } else if (tipo.indexOf('rar') > -1) {
            url = tipos['zip'];
        } else if (tipo.indexOf('tar') > -1) {
            url = tipos['zip'];
        } else if (tipo.indexOf('gz') > -1) {
            url = tipos['zip'];
        } else if (tipo.indexOf('pdf') > -1) {
            url = tipos['pdf'];
        }
        return url;
    };
});

app.filter('startFrom', function() {
    return function(input, start) {
        if (!input)
            return input;
        start = +start; //parse to int
        return input.slice(start);
    };
});

app.filter('range', function() {
    return function(input, total) {
        total = parseInt(total);
        for (var i = 0; i < total; i++)
            input.push(i);
        return input;
    };
});

app.filter('version', function(version) {
    return function(text) {
        return String(text).replace(/\%VERSION\%/mg, version);
    };
});

app.filter('trunk', function() {
    return function(value, wordwise, max, tail) {
        if (!value)
            return '';

        max = parseInt(max, 10);
        if (!max)
            return value;
        if (value.length <= max)
            return value;

        value = value.substr(0, max);
        if (wordwise) {
            var lastspace = value.lastIndexOf(' ');
            if (lastspace !== -1) {
                value = value.substr(0, lastspace);
            }
        }

        return value + (tail || ' …');
    };
});

app.filter('buscaPor', function() {
    return function(arr, searchString) {
        if (!searchString) {
            return arr;
        }
        var result = [];
        searchString = searchString.toLowerCase();
        angular.forEach(arr, function(objeto) {
            if (objeto.name.toLowerCase().indexOf(searchString) !== -1) {
                result.push(objeto);
            }
        });
        return result;
    };
});

