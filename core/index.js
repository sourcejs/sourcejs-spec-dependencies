var fs = require('fs');

var OUTPUT_SPEC_DEPENDENCIES_FILE = global.opts.core.specDependenciesTree.outputFile || 'data/spec_dependencies_tree.json';
var specDepsIncludedDirs = global.opts.core.specDependenciesTree.includedDirs || [];
var sourceRoot = global.opts.core.common.pathToUser;
var INFO_FILE = "info.json";

// configuration for function timeout
var CRON = global.opts.core.fileTree.cron;
var CRON_PROD = global.opts.core.fileTree.cronProd;
var CRON_REPEAT_TIME = global.opts.core.fileTree.cronRepeatTime;

var specDependenciesTree = function(dir) {
    var outputJSON = {},
        specsDirs = {};

    specDepsIncludedDirs.forEach(function(includedDir) {
        specsDirs = fs.readdirSync(dir + '/' + includedDir);

        specsDirs.forEach(function(specDir) {
            var pathToInfo = dir + '/' + includedDir + '/' + specDir;

            if (fs.existsSync(pathToInfo + '/' + INFO_FILE)) {
                var fileJSON = JSON.parse(fs.readFileSync(pathToInfo + '/' + INFO_FILE, "utf8"));

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
    fs.writeFile(global.app.get('user') + "/" + OUTPUT_SPEC_DEPENDENCIES_FILE, JSON.stringify(specDependenciesTree(sourceRoot), null, 4), function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("Spec dependencies JSON saved to " + global.opts.core.common.pathToUser+"/"+OUTPUT_SPEC_DEPENDENCIES_FILE);
        }
    });
};

SpecDependenciesWrite();

// setcron
if (CRON || (global.MODE === 'production' && CRON_PROD)) {
    setInterval(function(){
        GlobalWrite();
    }, CRON_REPEAT_TIME);
}