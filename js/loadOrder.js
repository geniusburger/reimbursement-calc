
loadOrder = [
    'js/3rd-party/knockout-3.2.0.min.js',
    'js/3rd-party/knockout.viewmodel.min.js',
    'js/util.js',
    'js/StorageManager.js',
    'js/Currency.js',
    'js/ko/CustomBindings.js',
    'js/ko/RowViewModel.js',
    'js/ko/PageViewModel.js',
    'js/rc.js',
    'js/3rd-party/jquery-1.11.0.min.js',
    'js/3rd-party/bootstrap.min.js'
];

// check if not in node
if( typeof exports !== 'undefined' && this.exports !== exports) {
    var fs = require("fs");
    var outputFile = 'master.min.js';

    String.prototype.startsWith = function (str){
        return this.indexOf(str) == 0;
    };
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
    String.prototype.insert = function( index, stringToInsert ) {
        return this.slice(0,index) + stringToInsert + this.slice(index);
    };

    var files = loadOrder.map(function(name){   // remove 'js/' from the beginning of the file names
        if( name.startsWith('js/')) {
            return name.substring(name.indexOf('/')+1);
        } else {
            return name;
        }
    }).filter(function(name) {  // remove non .js files
        return name.endsWith('.js');
    }).map(function(name) { // check for a minified version of .js files
        if( name.endsWith('.min.js')) {
            return name;
        } else {
            var minName = name.insert(name.lastIndexOf('.'), '.min');
            if( fs.existsSync(minName)) {
                return minName;
            } else {
                return name;
            }
        }
    });

    if( fs.existsSync(outputFile)) {
        fs.unlinkSync(outputFile);  // delete the output file
    }

    files.forEach(function(name){
        fs.appendFileSync(outputFile, fs.readFileSync(name));
        fs.appendFileSync(outputFile, '\n');
    });

} else {
    loadOrder.forEach(function(name) {
        document.writeln('<script src="' + name + '"></script>')
    });
}
