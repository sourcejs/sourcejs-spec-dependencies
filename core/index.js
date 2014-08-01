var fs = require('fs');
var path = require('path');

var includedDirs = global.opts.core.specDependenciesTree.includedDirs || [];
var sourceRoot = global.opts.core.common.pathToUser;
var infoFile = "info.json";

// configuration for function timeout
var CRON = global.opts.core.fileTree.cron;
var CRON_PROD = global.opts.core.fileTree.cronProd;
var CRON_REPEAT_TIME = global.opts.core.fileTree.cronRepeatTime;

var specDependenciesTree = function(dir) {
    var outputJSON = {},
        specsDirs = {};

    includedDirs.forEach(function(includedDir) {
        specsDirs = fs.readdirSync(dir + '/' + includedDir);

        specsDirs.forEach(function(specDir) {
            var pathToInfo = dir + '/' + includedDir + '/' + specDir;

            if (fs.existsSync(pathToInfo + '/' + infoFile)) {
                var fileJSON = JSON.parse(fs.readFileSync(pathToInfo + '/' + infoFile, "utf8"));

                if (fileJSON['usedSpecs']) {
                    fileJSON['usedSpecs'].forEach(function(usedSpec){
                        outputJSON[usedSpec] = outputJSON[usedSpec] || [];
                        outputJSON[usedSpec].push('/' + includedDir + '/' + specDir);
                    });
                }
            }
        });
    });

    return outputJSON;
};

var SpecDependenciesWrite = function() {
    var outputFile = global.app.get('user') + "/" + global.opts.core.specDependenciesTree.outputFile;
    var outputPath = path.dirname(outputFile);

    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath);
    }

    fs.writeFile(outputFile, JSON.stringify(specDependenciesTree(sourceRoot), null, 4), function (err) {
        if (err) {
            console.log('Error writing file tree of dependecies: ', err);
        } else {
            console.log("Spec dependencies JSON saved to " + outputFile);
        }
    });
};

SpecDependenciesWrite();

// setcron
if (CRON || (global.MODE === 'production' && CRON_PROD)) {
    setInterval(function(){
        SpecDependenciesWrite();
    }, CRON_REPEAT_TIME);
}