var fs = require('fs');
var deepExtend = require('deep-extend');
var path = require('path');

var globalConfig = global.opts.plugins && global.opts.plugins.specDependenciesTree ? global.opts.plugins.specDependenciesTree : {};

var config = {
    includedDirs: ['specs'],
    outputFile: "data/spec_dependencies_tree.json",

    // cron
    cron: false,
    cronProd: true,
    cronRepeatTime: 60000,

    // file from parser get info
    infoFile: "info.json",
    sourceRoot: global.opts.core.common.pathToUser
};
// Overwriting base options
deepExtend(config, global.opts.core.specDependenciesTree, globalConfig);

var specDependenciesTree = function(dir) {
    var outputJSON = {},
        specsDirs = {};

    config.includedDirs.forEach(function(includedDir) {
        specsDirs = fs.readdirSync(dir + '/' + includedDir);

        specsDirs.forEach(function(specDir) {
            var pathToInfo = dir + '/' + includedDir + '/' + specDir;

            if (fs.existsSync(pathToInfo + '/' + config.infoFile)) {
                var fileJSON = JSON.parse(fs.readFileSync(pathToInfo + '/' + config.infoFile, "utf8"));

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
    var outputFile = global.app.get('user') + "/" + config.outputFile;
    var outputPath = path.dirname(outputFile);

    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath);
    }

    fs.writeFile(outputFile, JSON.stringify(specDependenciesTree(config.sourceRoot), null, 4), function (err) {
        if (err) {
            console.log('Error writing file tree of dependecies: ', err);
        } else {
            console.log("Spec dependencies JSON saved to " + outputFile);
        }
    });
};

SpecDependenciesWrite();

// Running by cron
if (config.cron || (global.MODE === 'production' && config.cronProd)) {
    setInterval(function () {
        SpecDependenciesWrite();
    }, config.cronRepeatTime);
}