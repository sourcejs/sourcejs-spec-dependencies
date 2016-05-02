/*
 *
 * Spec dependencies plugin
 *
 * @author Roman Alekseev jesprider@gmail.com
 *
 * */
"use strict";

// Registering load event
window.source = window.source || {};
window.source.loadEvents = window.source.loadEvents || {};
window.source.loadEvents.specDepencencies = window.source.loadEvents.specDepencencies || {
    finishEvent: 'specDepencenciesFinish',
    updateEvent: 'specDepencenciesUpdate'
};

sourcejs.amd.define([
    'jquery',
    'sourceModules/module',
    'sourceModules/css',
    'text!/api/specs/raw',
    'text!/api/specs',
    'sourceModules/utils'
], function ($, module, Css, fileTree, fileTreeFlat, utils) {

    function SpecDependencies() {
        var _this = this;

        var moduleCss = new Css("/node_modules/sourcejs-spec-dependencies/assets/css/specDependencies.css");

        this.options.pluginsOptions = this.options.pluginsOptions || this.options.plugins || {};
        this.options.pluginsOptions.specDependencies = $.extend(true, {

            DEPENDENCIES_ROOT_CLASS: "source_deps",
            USED_SPECS_CLASS: "source_deps_used-specs",
            USED_BY_SPECS_CLASS: "source_deps_used-by-specs",
            USED_BY_SPEC_HEAD_LINK_CLASS: "source_deps_h_expand",

            INFO_FILE: "info.json",
            URL_TO_DEPENDENCIES_FILE: "/data/spec_dependencies_tree.json",

            SPEC_INFO_NOT_FOUND: "Information about this spec not found.",
            FILE_TREE_NOT_FOUND: "File spec_dependencies_tree.json not found.",

            USED_SPECS_HEAD: "Most likely it uses",
            USED_BY_SPEC_HEAD: "This spec used by"

        }, this.options.pluginsOptions.specDependencies);

        this.moduleOpts = this.options.pluginsOptions.specDependencies;
        this.fileTree = JSON.parse(fileTree);
        this.fileTreeFlat = JSON.parse(fileTreeFlat);

        $(function() {
            _this.init();
        });
    }

    SpecDependencies.prototype = module.createInstance();
    SpecDependencies.prototype.constructor = SpecDependencies;

    SpecDependencies.prototype.init = function() {
        var _this = this,
            USED_BY_SPECS_CLASS = this.moduleOpts.USED_BY_SPECS_CLASS,
            USED_BY_SPEC_HEAD_LINK_CLASS = this.moduleOpts.USED_BY_SPEC_HEAD_LINK_CLASS;

        // waiting for template's rendering
        setTimeout(function() {
            _this.drawUsedSpecs();
            _this.getDependenciesTreeJSON();
        }, 200);

        utils.toggleBlock(USED_BY_SPEC_HEAD_LINK_CLASS, USED_BY_SPECS_CLASS);
    };

    // Let SourceJS know that all DOM operations from this plugins are done
    SpecDependencies.prototype.emitFinishEvent = function() {
        if (window.CustomEvent) {
            new CustomEvent('specDepencenciesFinish');
        } else {
            var event = document.createEvent('CustomEvent');
            event.initCustomEvent('specDepencenciesFinish', true, true);
        }
    };

    // Get classes of all elements inside .source_example
    SpecDependencies.prototype.getClassList = function() {
        var tags = $('.source_example *'),
            classNames = {},
            classList = [];

        for (var tg = 0; tg < tags.length; tg++) {
            var tag = tags[tg];

            if (tag.className) {
                var classes = tag.className.split(" ");
                for (var cn = 0; cn < classes.length; cn++){
                    var cName = classes[cn];
                    if (!classNames[cName] && cName.indexOf("_") == -1 && cName != "") {
                        classNames[cName] = true;
                    }
                }
            }
        }

        for (var name in classNames) classList.push(name);

        return classList;
    };

    SpecDependencies.prototype.getUsedSpecList = function() {
        var specPaths = this.fileTreeFlat,
            classList = this.getClassList(),
            specList = [],
            currentSpec = this.getCurrentUrlPath();

        for (var cn = 0; cn < classList.length; cn++) {
            var cName = classList[cn];

            for (var specPath in specPaths) {
                if (currentSpec == utils.unifySpecPath(specPath)) continue;

                var specCat = specPath.slice(specPath.lastIndexOf("/")+1);

                if (specCat == cName) {
                    specList.push(specPath);
                }
            }
        }

        return specList;
    };

    SpecDependencies.prototype.getDependenciesTreeJSON = function() {
        var URL_TO_DEPENDENCIES_FILE = this.moduleOpts.URL_TO_DEPENDENCIES_FILE,
            _this = this;

        $.ajax({
            url: URL_TO_DEPENDENCIES_FILE,
            dataType: 'json',
            success: function(data) {
                _this.handleDependenciesData(data);
            },
            error: function() {
                _this.handleDependenciesData();
            }
        });
    };

    SpecDependencies.prototype.handleDependenciesData = function(jsonTree) {
        if (jsonTree) {
            var specList;
            var currentUrl = this.getCurrentUrlPath();

            specList = jsonTree[currentUrl];
            return this.drawUsedBySpecs(specList);
        } else {
            console.log(this.moduleOpts.FILE_TREE_NOT_FOUND);

            this.emitFinishEvent();
        }

        return false;
    };

    // Specs that used in current spec
    SpecDependencies.prototype.drawUsedSpecs = function() {
        var _this = this,
            specList = this.getUsedSpecList(),

            USED_SPECS_CLASS = this.moduleOpts.USED_SPECS_CLASS,
            ROOT_CLASS = this.moduleOpts.DEPENDENCIES_ROOT_CLASS,
            HEADER = this.moduleOpts.USED_SPECS_HEAD,

            res = "",
            header = "",
            title = "";

        specList && specList.forEach(function(specUrl) {
            specUrl = utils.unifySpecPath(specUrl);
            title = _this.getTitleOfSpecByUrl(specUrl);

            res += '<li><a href="' + specUrl + '" class="source_a_s source_a_fs-m">' + title + '</a></li>';
        });

        if ($('.' + USED_SPECS_CLASS).length === 0 && res != "") {
            header = '<p>' + HEADER + '</p>';
            _this.turnOnLayout();

            $('.' + ROOT_CLASS)
                .append(header + '<ul class="' + USED_SPECS_CLASS + '">' + res + '</ul>');
        }
    };

    // Specs that use current spec
    SpecDependencies.prototype.drawUsedBySpecs = function(specList) {
        var _this = this,

            USED_BY_SPECS_CLASS = this.moduleOpts.USED_BY_SPECS_CLASS,
            ROOT_CLASS = this.moduleOpts.DEPENDENCIES_ROOT_CLASS,
            HEADER = this.moduleOpts.USED_BY_SPEC_HEAD,
            USED_BY_SPEC_HEAD_LINK_CLASS = this.moduleOpts.USED_BY_SPEC_HEAD_LINK_CLASS,

            res = "",
            header = "",
            title = "";

        specList && specList.forEach(function(specUrl) {
            specUrl = utils.unifySpecPath(specUrl);
            title = _this.getTitleOfSpecByUrl(specUrl);

            res += '<li><a href="' + specUrl + '" class="source_a_s source_a_fs-m">' + title + '</a><li/>';
        });

        if ($('.' + USED_BY_SPECS_CLASS).length === 0 && res != "") {
            header = '<p><a href="#" class="' + USED_BY_SPEC_HEAD_LINK_CLASS + '" onclick="return false;">' + HEADER + '</a></p>';
            _this.turnOnLayout();

            $('.' + ROOT_CLASS)
                .append(header + '<ul class="' + USED_BY_SPECS_CLASS + '">' + res + '</ul>');
        }

        this.emitFinishEvent();
    };

    SpecDependencies.prototype.turnOnLayout = function() {
        var ROOT_CLASS = this.moduleOpts.DEPENDENCIES_ROOT_CLASS,
            SECTION_CLASS = this.options.SECTION_CLASS;

        if($('.' + ROOT_CLASS).length === 0) {
            $('.' + SECTION_CLASS).first().before('<div class="' + ROOT_CLASS + '"></div>');
        }
    };

    SpecDependencies.prototype.getTitleOfSpecByUrl = function(url) {
        var fileTree = this.fileTree,
            urlArr = this.getCurrentUrlPathArray(url),
            title;

        for (var i = 0; i < urlArr.length; i++) {
            fileTree = fileTree[urlArr[i]];
        }

        title = fileTree["specFile"]["title"];

        if (title) return title;

        return url;
    };

    SpecDependencies.prototype.getCurrentUrlPath = function() {
        var currentUrl = window.location.pathname;
        currentUrl = utils.unifySpecPath(currentUrl);

        return currentUrl;
    };

    SpecDependencies.prototype.getCurrentUrlPathArray = function(urlToProceed) {
        var currentUrl = urlToProceed || this.getCurrentUrlPath(),
            urlArr;

        if (currentUrl.charAt(0) == '/') {
            urlArr = currentUrl.slice(1).split('/');
        } else {
            urlArr = currentUrl.split('/');
        }

        return urlArr;
    };

    return new SpecDependencies();

});
