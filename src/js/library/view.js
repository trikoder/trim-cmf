var $ = require('jquery');
var _ = require('underscore');
var BaseView = require('backbone-base-view');
var keyboardJS = require('keyboardjs');

var oldRemove = BaseView.prototype.remove;

_.extend(BaseView.prototype, {

    parseEventVariables: false,

    setViewData: function(key, value) {

        var viewData = this.viewData = this.viewData || {};
        var params = _.isObject(key) ? key : _.object([key], [value]);

        _.each(params, function(paramValue, paramKey) {
            viewData[paramKey] = paramValue;
        });

        return this;

    },

    useLocalLoading: function(on) {

        if (on) {
            this.$loader = this.$loader || $(
                '<div class="loadingSpinnerLocal">' +
                    '<div class="loadingSpinner">' +
                        '<div class="rect1"></div>' +
                        '<div class="rect2"></div>' +
                        '<div class="rect3"></div>' +
                        '<div class="rect4"></div>' +
                        '<div class="rect5"></div>' +
                    '</div>' +
                '</div>'
            );
        } else {
            delete this.$loader;
        }

        return this;

    },

    loading: function(on) {

        BaseView.$loader = BaseView.$loader || $(
            '<div class="loadingSpinner">' +
                '<div class="rect1"></div>' +
                '<div class="rect2"></div>' +
                '<div class="rect3"></div>' +
                '<div class="rect4"></div>' +
                '<div class="rect5"></div>' +
            '</div>'
        );

        BaseView.$loaderTarget = BaseView.$loaderTarget || $('body');

        var $loader = this.$loader || BaseView.$loader;
        var $appendTarget = this.$loader ? this.$el : BaseView.$loaderTarget;

        if (on) {
            clearTimeout($loader.data('removeTimeout'));
            !$loader.data('active') && $loader.appendTo($appendTarget).data('active', true);
        } else {
            $loader.data('removeTimeout', setTimeout(function() {
                $loader.detach().data('active', false);
            }, 0));
        }

        return this;

    },

    followLink: function(e) {

        e.preventDefault();
        require('../app').get('router').navigateToUrl($(e.currentTarget), true);

        return this;

    },

    onKeyShortcut: function(shortcut, callback) {

        var callbackProxy = function(e) {

            var $target = $(e.target);

            if (!$target.is('input, textarea') && $target.closest('.cke_editable').length === 0) {
                callback.apply(this, arguments);
            }

        }.bind(this);

        this.onKeyShortcuts = this.onKeyShortcuts || {};
        this.onKeyShortcuts[shortcut] = this.onKeyShortcuts[shortcut] || [];
        this.onKeyShortcuts[shortcut].push(callbackProxy);

        keyboardJS.on(shortcut, callbackProxy);

        return this;

    },

    scrollTo: function($element, speed, callback) {

        var self = this;
        var offset = $element instanceof $ ? $element.offset().top : $element;
        var selector = 'html,body';

        if (this.options && this.options.scrollContainer) {
            selector = this.$(this.options.scrollContainer);
        }

        $(selector).animate({scrollTop: offset}, speed || 400).promise().done(function() {
            callback && callback.call(self);
        });

        return this;

    },

    remove: function() {

        oldRemove.apply(this, arguments);

        this.onKeyShortcuts && _.each(this.onKeyShortcuts, function(callbackArray, shortcut) {

            _.each(callbackArray, function(callback) {
                keyboardJS.off(shortcut, callback);
            });

        });

        return this;

    },

    handleValidateOptionsErrors: function(errorMessages) {

        if (errorMessages.length) {
            // eslint-disable-next-line
            console.warn(errorMessages.join(' '));
        }

    }

});

module.exports = BaseView;
