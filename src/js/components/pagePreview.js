var $ = require('jquery');
var _ = require('underscore');
var Popup = require('./popup');
var View = require('../library/view');

var PagePreview = View.extend({

    className: 'pagePreviewType1',

    assignOptions: true,

    optionRules: {
        screenSizes: {type: Array, default: function() {
            return [320, 728, 1024, 1300];
        }},
        url: String,
        removeOnClose: {type: Boolean, default: false}
    },

    initialize: function() {

        this.options.screenSizes.unshift('100%');

        this.popup = this.addView(new Popup({
            className: 'popupType1 modDark',
            removeOnClose: this.options.removeOnClose ? this : false,
            content: this.$el
        }));

        this.render();

    },

    events: {
        'click .sizeControls > button': function(e) {
            this.adjustPreviewWidth(this.options.screenSizes[$(e.target).index()]);
        }
    },

    render: function() {

        var $controls = $('<div>').addClass('controls').appendTo(this.$el);
        var $sizeControls = $('<div>').addClass('sizeControls').appendTo($controls);
        var $pageContainerWrap = $('<div>').addClass('pageContainerWrap').appendTo(this.$el);

        this.$urlInput = $('<input disabled="disabled" type="text" />').val(this.options.url).addClass('previewUrl').appendTo($controls);
        this.$pageContainer = $('<div>').addClass('pageContainer').appendTo($pageContainerWrap);
        this.$iframe = $('<iframe src="' + this.options.url + '" frameborder="0"></iframe>').appendTo(this.$pageContainer);

        _.each(this.options.screenSizes, function(size) {
            $('<button type="button">').text(size).addClass('nBtn').appendTo($sizeControls);
        });

        this.$sizeButtons = $sizeControls.find('button');
        this.$sizeButtons.first().addClass('active');

    },

    setUrl: function(url) {

        this.options.url = url;
        this.$iframe.attr('src', url);
        this.$urlInput.val(url);

        return this;

    },

    adjustPreviewWidth: function(width) {

        this.$pageContainer.css('width', width);

        var widthIndex = _.indexOf(this.options.screenSizes, width);

        if (widthIndex >= 0) {
            this.$sizeButtons.eq(widthIndex).addClass('active').siblings().removeClass('active');
        }

    },

    toggle: function() {

        this.popup.toggle();
        return this;

    },

    open: function() {

        this.popup.open();
        return this;

    },

    close: function() {

        this.popup.close();
        return this;

    }

}, {
    create: function(options) {

        return new PagePreview(options);

    }
});

module.exports = PagePreview;
