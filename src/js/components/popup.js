var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
var View = require('../library/view');
var translate = require('../library/translate');

var popupRegistry = _.extend({

    initialize: function() {

        var $body = $('body');
        var openedPopups = new Backbone.Collection();
        var normalizeLevel = function(num) {
            return num >= 2 ? 2 : num;
        };

        this.on('popupOpen', function(popup) {
            openedPopups.add(popup);
        }).on('popupClose', function(popup) {
            openedPopups.remove(popup);
        });

        this.listenTo(openedPopups, 'add remove', function() {

            $body.toggleClass('popupActive', openedPopups.length > 0);

        }).listenTo(openedPopups, 'add', function(popup) {

            popup.$el.addClass('level' + normalizeLevel(openedPopups.length));
            $body.addClass('popupLevel' + normalizeLevel(openedPopups.length));

        }).listenTo(openedPopups, 'remove', function(popup) {

            popup.$el.removeClass('level' + normalizeLevel(openedPopups.length + 1));
            $body.removeClass('popupLevel' + normalizeLevel(openedPopups.length + 1));

        });

        return this;

    }

}, Backbone.Events).initialize();

var Popup = View.extend({

    defaults: {
        className: 'popupType1',
        removeOnClose: false
    },

    initialize: function(options) {

        this.options = _.extend({}, this.defaults, options);

        this.trackingModel = new Backbone.Model();
        this.trackingModel.$el = this.$el;

        this.render().setContent(this.options.content);

    },

    events: {
        'click .popupCloseBtn': 'close'
    },

    setContent: function(content) {

        this.removeViews();

        if (content instanceof View) {
            this.addView(content);
            this.$content.html(content.$el);
        } else {
            this.$content.html(content);
        }

        return this;

    },

    render: function() {

        this.$el.addClass(this.options.className);

        var closeButtonCaption = translate('popup.closeButtonCaption');

        this.$el.append(
            '<div class="overlay"></div>' +
            '<div class="content"></div>' +
            '<button title="' + closeButtonCaption + '" class="popupCloseBtn nBtn icr iconClose" type="button">' +
                translate('popup.closeButtonCaption') +
            '</button>'
        );

        this.$content = this.$('.content');

        return this;

    },

    toggle: function() {

        this.inDom ? this.close() : this.open();

    },

    open: function() {

        if (!this.inDom) {

            popupRegistry.trigger('popupOpen', this.trackingModel);

            this.$el.appendTo('.appContainer');
            this.inDom = true;

        }

        return this;

    },

    close: function() {

        if (this.inDom) {

            if (this.options.removeOnClose) {
                if (this.options.removeOnClose instanceof View) {
                    this.options.removeOnClose.remove();
                }
                this.remove();
            } else {
                popupRegistry.trigger('popupClose', this.trackingModel);
                this.$el.detach();
            }

            this.inDom = false;

        }

        return this;

    },

    remove: function() {

        popupRegistry.trigger('popupClose', this.trackingModel);
        View.prototype.remove.apply(this, arguments);

    }

}, {
    open: function(options) {

        var PopupType = this;

        return (new PopupType(options)).open();

    }
});

module.exports = Popup;
