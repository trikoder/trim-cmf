var $ = require('jquery');
var BaseElement = require('../formElements/baseElement');
var translate = require('../library/translate');
var Dropzone = require('dropzone');
var template = require('templates/formElements/fileAttachment.jst');

require('simple-lightbox');

module.exports = BaseElement.extend({

    elementType: 'fileAttachment',

    defaults: {
        acceptedFiles: null,
        mapThumbnailTo: null,
        mapCurrentFileUrlTo: null,
        addFileCaption: translate('formElements.fileAttachment.addFileCaption'),
        changeFileCaption: translate('formElements.fileAttachment.changeFileCaption')
    },

    initialize: function() {

        BaseElement.prototype.initialize.apply(this, arguments);

        this.clientThumbnail = undefined;
        this.selectedFile = undefined;

        this.on('beforeRemove', function() {
            if (this.dropzone) {
                this.dropzone.disable();
                this.dropzone.destroy();
            }
        });

    },

    events: {
        'click .removeBtn': function() {
            this.clientThumbnail = undefined;
            this.selectedFile = undefined;
            this.renderElement();
        },
        'click .fileUploadClickable': function(e) {
            e.preventDefault();
            this.dropzone.hiddenFileInput.click();
        },
        'click .zoomInBtn': function(e) {
            e.preventDefault();
            $.simpleLightbox.open({items: [$(e.currentTarget).attr('href')]});
        }
    },

    getFile: function() {

        return this.selectedFile;

    },

    render: function() {

        BaseElement.prototype.render.call(this);
        this.dropzone && this.dropzone.destroy();
        this.renderElement().setupUpload();

        return this;

    },

    renderElement: function() {

        var options = this.options;
        var isFileSelected = Boolean(this.selectedFile);
        var currentFileUrl = options.mapCurrentFileUrlTo && this.entityModel && this.entityModel.get(options.mapCurrentFileUrlTo);
        var thumbnailUrl = this.clientThumbnail || (!isFileSelected && options.mapThumbnailTo && this.entityModel && this.entityModel.get(options.mapThumbnailTo));

        this.$inputWrapper.empty().addClass('fileAttachmentType1').html(template.render({
            isFileSelected: isFileSelected,
            selectedFileName: isFileSelected && this.selectedFile.name,
            thumbnailUrl: thumbnailUrl,
            currentFileUrl: currentFileUrl,
            currentFileIsImage: currentFileUrl && currentFileUrl.split('?')[0].match(/.(jpg|jpeg|png|gif)$/i),
            textControlCaption: isFileSelected || currentFileUrl ? options.changeFileCaption : options.addFileCaption
        }));

        return this;

    },

    setupUpload: function() {

        var dropzone = this.dropzone = new Dropzone(this.$inputWrapper.get(0), {
            url: '/dummy-post-url',
            acceptedFiles: this.options.acceptedFiles,
            clickable: true,
            maxFiles: 1,
            uploadMultiple: false,
            createImageThumbnails: true,
            autoProcessQueue: false,
            autoDiscover: false,
            thumbnailWidth: null,
            thumbnailHeight: null,
            previewsContainer: $('<div class="hidden" />').insertAfter(this.$inputWrapper).get(0)
        });

        dropzone.hiddenFileInput.removeAttribute('multiple');

        dropzone.on('addedfile', function(file) {
            this.clientThumbnail = undefined;
            this.selectedFile = file;
            this.renderElement();
        }.bind(this)).on('thumbnail', function(file, dataUrl) {
            if (file === this.selectedFile) {
                this.clientThumbnail = dataUrl;
                this.renderElement();
            }
        }.bind(this));

        return this;

    }

});
