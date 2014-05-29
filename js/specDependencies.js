/*
 *
 * Spec deoendencies plugin
 *
 * @author Roman Alekseev
 *
 * */
"use strict";

define([
    'jquery',
    'modules/module',
    'modules/css',
    'modules/parseFileTree',
    'modules/utils'
], function ($, module, Css, pft, utils) {

    function SpecDependencies() {
        var _this = this;

        var moduleCss = new Css("sourcejs-spec-dependencies/css/specDependencies.css");

        this.options.pluginsOptions.specDependencies = $.extend(true, {

            DEPENDENCIES_ROOT_CLASS: "source_deps",
            USED_SPECS_CLASS: "source_deps_used-specs",
            USED_BY_SPECS_CLASS: "source_deps_used-by-specs",

            INFO_FILE: "info.json",
            URL_TO_DEPENDENCIES_FILE: "/data/spec_dependencies_tree.json",

            SPEC_INFO_NOT_FOUND: "Information about this spec not found.",
            FILE_TREE_NOT_FOUND: "File spec_dependencies_tree.json not found.",

            USED_SPECS_HEAD: "This spec uses:",
            USED_BY_SPEC_HEAD: "This spec used by:",

            tempSpecList: {}

        }, this.options.pluginsOptions.specDependencies);

        $(function(){
            _this.init();
        });

    }

    SpecDependencies.prototype = module.createInstance();
    SpecDependencies.prototype.constructor = SpecDependencies;

    SpecDependencies.prototype.init = function () {
        this.drawUsedSpecs();
        this.getDependenciesTreeJSON();
    };

    SpecDependencies.prototype.getSpecInfo = function() {
        var fileTree = pft.getParsedJSON(),
            currentUrlArr = this.getCurrentUrlPathArray(),

            specInfo;

        for (var i = 0; i < currentUrlArr.length; i++) {
            fileTree = fileTree[currentUrlArr[i]];
        }

        specInfo = fileTree["specFile"];

        if (specInfo) return specInfo;

        console.log(this.options.pluginsOptions.specDependencies.SPEC_INFO_NOT_FOUND);
        return false;
    };

    SpecDependencies.prototype.getDependenciesTreeJSON = function() {
        var URL_TO_DEPENDENCIES_FILE = this.options.pluginsOptions.specDependencies.URL_TO_DEPENDENCIES_FILE,
            _this = this;

        $.ajax({
            url: URL_TO_DEPENDENCIES_FILE,
            dataType: 'json',
            success: function(data) {
                _this.getUsedBySpecsList(data);
            },
            error: function() {
                console.log(_this.options.pluginsOptions.specDependencies.FILE_TREE_NOT_FOUND);
            }
        });
    };

    SpecDependencies.prototype.getUsedSpecsList = function() {
        var infoFile = this.getSpecInfo(),
            specsList;

        if (infoFile) {
            specsList = infoFile["usedSpecs"];
            return specsList;
        }

        return false;
    };

    SpecDependencies.prototype.getUsedBySpecsList = function(jsonTree) {
        var specsList,
            currentUrl = window.location.pathname;

        if (jsonTree) {
            currentUrl = currentUrl.slice( 1, currentUrl.lastIndexOf('/') );
            specsList = jsonTree[currentUrl];
            return this.drawUsedBySpecs(specsList);
        }

        return false;
    };

    // Specs that used in current spec
    SpecDependencies.prototype.drawUsedSpecs = function() {
        var _this = this,
            specsList = this.getUsedSpecsList(),

            USED_SPECS_CLASS = this.options.pluginsOptions.specDependencies.USED_SPECS_CLASS,
            ROOT_CLASS = this.options.pluginsOptions.specDependencies.DEPENDENCIES_ROOT_CLASS,
            HEADER = this.options.pluginsOptions.specDependencies.USED_SPECS_HEAD,

            res = "",
            header = "",
            title = "";

        specsList && specsList.forEach(function(specUrl) {
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
    SpecDependencies.prototype.drawUsedBySpecs = function(specsList) {
        var _this = this,

            USED_BY_SPECS_CLASS = this.options.pluginsOptions.specDependencies.USED_BY_SPECS_CLASS,
            ROOT_CLASS = this.options.pluginsOptions.specDependencies.DEPENDENCIES_ROOT_CLASS,
            HEADER = this.options.pluginsOptions.specDependencies.USED_BY_SPEC_HEAD,

            res = "",
            header = "",
            title = "";

        specsList && specsList.forEach(function(specUrl) {
            specUrl = utils.unifySpecPath(specUrl);
            title = _this.getTitleOfSpecByUrl(specUrl);

            res += '<li><a href="' + specUrl + '" class="source_a_s source_a_fs-m">' + title + '</a><li/>';
        });

        if ($('.' + USED_BY_SPECS_CLASS).length === 0 && res != "") {
            header = '<p>' + HEADER + '</p>';
            _this.turnOnLayout();

            $('.' + ROOT_CLASS)
                .append(header + '<ul class="' + USED_BY_SPECS_CLASS + '">' + res + '</ul>');
        }
    };

    SpecDependencies.prototype.turnOnLayout = function() {
        var ROOT_CLASS = this.options.pluginsOptions.specDependencies.DEPENDENCIES_ROOT_CLASS,
            SECTION_CLASS = this.options.SECTION_CLASS;

        if($('.' + ROOT_CLASS).length === 0) {
            $('.' + SECTION_CLASS).first().before('<div class="' + ROOT_CLASS + '"></div>');
        }
    };

    SpecDependencies.prototype.getTitleOfSpecByUrl = function(url) {
        var fileTree = pft.getParsedJSON(),
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

        urlArr = currentUrl.slice(1).split('/');

        return urlArr;
    };

    return new SpecDependencies();

});