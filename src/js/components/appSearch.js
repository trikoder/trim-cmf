var $ = require('jquery');
var router = require('../app').get('router');
var Fuse = require('fuse.js');
var Fastsearch = require('fastsearch').fastsearch;
var translate = require('../library/translate');

module.exports = require('../library/view').extend({

    tagName: 'form',
    className: 'appSearchType1 iconSearch',

    assignOptions: true,

    optionRules: {
        items: Array
    },

    initialize: function(options) {

        this.options = options;
        this.render().setupSearch();

    },

    render: function() {

        this.$input = $('<input placeholder="' + translate('appSearch.placeholder') + '" />').appendTo(this.$el);
        return this;

    },

    setupSearch: function() {

        var self = this;

        this.fastsearch = new Fastsearch(this.$input, {
            noResultsText: 'Nema rezultata',
            responseFormat: {label: 'caption'},
            typeTimeout: 0,
            focusFirstItem: true,
            preventSubmit: true,
            onItemSelect: function($item, model) {
                router.navigateToUrl(model.url, true);
                self.fastsearch.clear();
                self.close();
            }
        });

        this.fastsearch.getResults = function(callback) {

            var fuse = self.fuse = self.fuse || new Fuse(self.options.items, {keys: ['caption'], threshold: 0.4});

            callback(fuse.search(self.$input.val()));

        };

    },

    open: function() {

        if (!this.inDom) {
            this.$el.appendTo('body');
            this.$input.focus();
            this.inDom = true;
            this.addDismissListener('close');
        }

    },

    close: function() {

        if (this.inDom) {
            this.$el.detach();
            this.inDom = false;
            this.fastsearch.clear();
            this.removeDismissListener('close');
        }

    }

});
