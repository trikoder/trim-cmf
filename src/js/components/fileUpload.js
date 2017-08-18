var $ = require('jquery');
var _ = require('underscore');
var Dropzone = require('dropzone');
var translate = require('js/library/translate');

module.exports = require('js/library/view').extend({

    className: 'fileUploadType1',

    defaults: {
        url: '',
        mediaType: 'image',
        caption: translate('fileUpload.uploadImages'),
        iconClass: 'iconCloudUpload',
        removePreviewOnUpload: false,
        clickableSelector: '.handle',
        paramName: 'binary',
        onUpload: function() {},
        maxFiles: null,
        renderInitialMarkup: true,
        headers: null,
        formatErrorMessage: function(message) {
            return message;
        }
    },

    initialize: function(options) {

        this.options = $.extend(true, {}, _.result(this, 'defaults'), options);
        this.render();
        this.setupUpload();

        this.on('beforeRemove', function() {
            this.dropzone.destroy();
        });

    },

    render: function() {

        this.options.renderInitialMarkup && this.$el.html($(
            '<div class="handle">' + this.options.caption + '</div>'
        ).addClass(this.options.iconClass));

        return this;

    },

    setupUpload: function() {

        var clickableElements = this.$(this.options.clickableSelector).toArray();

        var dropzone = this.dropzone = new Dropzone(this.$el.get(0), {
            url: this.options.url,
            params: {'mediaType': this.options.mediaType},
            clickable: clickableElements.length ? clickableElements : true,
            maxFiles: this.options.maxFiles,
            paramName: this.options.paramName,
            headers: this.options.headers
        });

        dropzone.on('success', function(file, response) {

            this.options.onUpload(file, response);
            this.options.removePreviewOnUpload && dropzone.removeFile(file);

        }.bind(this)).on('error', function(file, errorMessage) {

            var message = this.options.formatErrorMessage(errorMessage);

            this.trigger('errorOnUpload', {'file': file, 'message': message});

            if (this.options.renderInitialMarkup) {

                $(file.previewElement).find('.dz-error-message').html(message);

            } else {

                this.options.removePreviewOnUpload && dropzone.removeFile(file);

            }

        }.bind(this));

    }

});
