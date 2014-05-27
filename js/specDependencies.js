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
    'modules/module'
    ], function ($, module) {

    function SpecDependencies() {
        var _this = this;

        this.options.pluginsOptions.specDependencies = $.extend(true, {

            DEPENDENCIES_ROOT_CLASS: "source_dep",
            USED_SPECS_CLASS: "source_used-specs",
            USED_BY_SPECS_CLASS: "source_used-by-specs",

            INFO_FILE: "info.json",
            URL_TO_DEPENDENCIES_FILE: "/data/spec_dependencies_tree.json",

            FILE_INFO_NOT_FOUND: "File info.json not found.",
            FILE_TREE_NOT_FOUND: "File spec_dependencies_tree.json not found.",

            USED_SPECS_HEAD: "This spec uses:",
            USED_BY_SPEC_HEAD: "This spec used by:"

        }, this.options.pluginsOptions.specDependencies);

        $(function(){
            _this.init();
        });

    }

    SpecDependencies.prototype = module.createInstance();
    SpecDependencies.prototype.constructor = SpecDependencies;

    SpecDependencies.prototype.init = function () {
        this.drawUsedSpecs();
        this.drawUsedBySpecs();
    };

    SpecDependencies.prototype.getInfoJSON = function() {
        var INFO_FILE = this.options.pluginsOptions.specDependencies.INFO_FILE,
            infoJSON;

        $.ajax({
            url: INFO_FILE,
            dataType: 'json',
            async: false,
            success: function(data) {
                infoJSON = data;
            }
        });

        if (infoJSON) return infoJSON;

        console.log(this.options.pluginsOptions.specDependencies.FILE_INFO_NOT_FOUND);
        return false;
    };

    SpecDependencies.prototype.getDependenciesTreeJSON = function() {
        var URL_TO_DEPENDENCIES_FILE = this.options.pluginsOptions.specDependencies.URL_TO_DEPENDENCIES_FILE,
            jsonTree;

        $.ajax({
            url: URL_TO_DEPENDENCIES_FILE,
            dataType: 'json',
            async: false,
            success: function(data) {
                jsonTree = data;
            }
        });

        if (jsonTree) return jsonTree;

        console.log(this.options.pluginsOptions.specDependencies.FILE_TREE_NOT_FOUND);
        return false;
    };

    SpecDependencies.prototype.getUsedSpecsList = function() {
        var infoFile = this.getInfoJSON(),
            specsList;

        if (infoFile) {
            specsList = infoFile["usedSpecs"];
            return specsList;
        }

        return false;
    };

    SpecDependencies.prototype.getUsedBySpecsList = function() {
        var jsonTree = this.getDependenciesTreeJSON(),
            specsList,
            currentUrl = window.location.pathname;

        if (jsonTree) {
            currentUrl = currentUrl.slice( 1, currentUrl.lastIndexOf('/') );
            specsList = jsonTree[currentUrl];
            return specsList;
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
            specUrl = _this.unifySpecPath(specUrl);
            title = _this.getTitleOfSpecByUrl(specUrl);

            res += '<a href="' + specUrl + '">' + title + '</a><br/>';
        });

        if ($('.' + USED_SPECS_CLASS).length === 0 && res != "") {
            header = '<p>' + HEADER + '</p>';
            _this.turnOnLayout();

            $('.' + ROOT_CLASS)
                .append('<p class="' + USED_SPECS_CLASS + '">' + header + res + '</p>');
        }
    };

    // Specs that use current spec
    SpecDependencies.prototype.drawUsedBySpecs = function() {
        var _this = this,
            specsList = this.getUsedBySpecsList(),

            USED_BY_SPECS_CLASS = this.options.pluginsOptions.specDependencies.USED_BY_SPECS_CLASS,
            ROOT_CLASS = this.options.pluginsOptions.specDependencies.DEPENDENCIES_ROOT_CLASS,
            HEADER = this.options.pluginsOptions.specDependencies.USED_BY_SPEC_HEAD,

            res = "",
            header = "",
            title = "";

        specsList && specsList.forEach(function(specUrl) {
            specUrl = _this.unifySpecPath(specUrl);
            title = _this.getTitleOfSpecByUrl(specUrl);

            res += '<a href="' + specUrl + '">' + title + '</a><br/>';
        });

        if ($('.' + USED_BY_SPECS_CLASS).length === 0 && res != "") {
            header = '<p>' + HEADER + '</p>';
            _this.turnOnLayout();

            $('.' + ROOT_CLASS)
                .append('<p class="' + USED_BY_SPECS_CLASS + '">' + header + res + '</p>');
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
        var INFO_FILE = this.options.pluginsOptions.specDependencies.INFO_FILE,
            title = "";

        $.ajax({
            url: url + '/' + INFO_FILE,
            dataType: 'json',
            async: false,
            success: function(data) {
                title = data["title"];
            }
        });

        if (title) return title;

        return url;
    };

    SpecDependencies.prototype.unifySpecPath = function(url) {
        if (url.charAt(0) != "/") url = "/" + url;
        if (url.charAt(url.length - 1) == "/") url = url.slice(0, -1);

        return url;
    };

    return new SpecDependencies();

});