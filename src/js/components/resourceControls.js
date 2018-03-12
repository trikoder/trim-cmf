var _ = require('underscore');
var $ = require('jquery');
var View = require('../library/view');

var prepareControl = function(config) {

    return $(config.url ? '<a href="' + _.result(config, 'url') + '">' : '<button class="nBtn" type="button">')
        .text(config.caption)
        .attr('title', config.title)
        .addClass(config.className)
        .on('click', function(e) {
            if (config.action) {
                e.preventDefault();
                config.action.call(config.actionContext || this, this);
            }
        });

};

var Dropdown = View.extend({

    className: 'dropdownControls',

    initialize: function(options) {

        this.config = options.config;

    },

    events: {
        'click > .toggleBtn': function() {
            this.$el.hasClass('active') ? this.close() : this.open();
        },
        'click > .dropdown > button': 'close'
    },

    render: function() {

        var config = this.config;

        $('<button type="button" class="toggleBtn nBtn">' + config.caption + '</button>')
            .addClass(config.className)
            .appendTo(this.$el);

        var $dropdown = $('<div class="dropdown">').appendTo(this.$el);

        _.each(config.items, function(itemConfig) {
            prepareControl(_.extend({actionContext: config.actionContext}, itemConfig)).appendTo($dropdown);
        });

        return this;

    },

    open: function() {
        this.$el.addClass('active');
        this.addDismissListener('close');
    },

    close: function() {
        this.$el.removeClass('active');
        this.removeDismissListener('close');
    }

});

var ResourceControls = View.extend({

    tagName: 'nav',
    className: 'resourceControls',
    controlsCounter: 0,

    addControl: function(config) {

        if (!this.freezed) {
            prepareControl(config).appendTo(this.$el);
            this.controlsCounter++;
        }

        return this;

    },

    hasControls: function() {

        return this.controlsCounter > 0;

    },

    freeze: function() {

        this.freezed = true;
        return this;

    },

    unFreeze: function() {

        this.freezed = false;
        return this;

    },

    addDropdownControl: function(config) {

        this.addView(new Dropdown({config: config})).render().$el.appendTo(this.$el);
        this.controlsCounter++;

        return this;

    }

});

module.exports = ResourceControls;
