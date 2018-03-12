var $ = require('jquery');
var _ = require('underscore');
var EntityModel = require('../library/entity').Model;
var BaseElement = require('../formElements/baseElement');
var ExternalAmin = require('../formElements/externalAdmin');
var translate = require('../library/translate');
var FileUpload = require('../components/fileUpload');
var oneImageTemplate = require('templates/formElements/media.jst');

require('simple-lightbox');

var BaseMedia = ExternalAmin.extend({

    elementType: 'media',

    defaults: function() {

        var parentDefaults = ExternalAmin.prototype.defaults;

        return _.extend({}, typeof parentDefaults === 'function' ? parentDefaults.call(this) : parentDefaults, {
            mapThumbnailTo: 'thumbnailUrl',
            mapPreviewTo: 'originalUrl',
            changeImageCaption: translate('formElements.media.changeImageCaption'),
            chooseImageCaption: translate('formElements.media.chooseImageCaption'),
            uploadImageCaption: translate('formElements.media.uploadImageCaption'),
            separatorCaption: translate('formElements.media.separatorCaption'),
            allowUpload: true,
            assignWhenEditDone: false,
            fileUploadParamName: 'binary',
            fileUploadHeaders: null,
            formatErrorMessage: function(message) {
                return message;
            }
        });

    },

    events: function() {

        return _.extend({
            'click .openBtn': function() {
                this.open({onSelect: this.options.onSelect});
            },
            'click .editBtn': 'openEdit',
            'click .removeBtn': 'unsetRelation',
            'click .zoomInBtn': function(e) {
                $.simpleLightbox.open({items: [$(e.currentTarget).data('image-url')]});
            }
        }, !this.options.allowUpload ? {
            'click .placeholderImage': function() {
                this.open({onSelect: this.options.onSelect});
            }
        } : null);

    },

    render: function() {

        this.removeViews();
        this.$el.empty();

        BaseElement.prototype.render.call(this);

        if (this.options.relation.type === 'hasOne') {
            this.renderOneRelation();
        }

        // No support for rendering many relations yet

        return this;

    },

    renderOneRelation: function() {

        this.bootstrapHasOneModel(function(model) {

            this.$inputWrapper.empty().addClass('mediaInputType1');

            var thumbImage = model && model.get(this.options.mapThumbnailTo);
            var largeImage = model && model.get(this.options.mapPreviewTo);

            this.$inputWrapper.html(oneImageTemplate.render({
                hasImage: Boolean(thumbImage),
                largeImageUrl: largeImage,
                thumbImageUrl: thumbImage,
                hasUpload: this.options.allowUpload,
                chooseImageCaption: this.options.chooseImageCaption,
                changeImageCaption: this.options.changeImageCaption,
                separatorCaption: this.options.separatorCaption,
                uploadImageCaption: this.options.uploadImageCaption
            }));

            if (this.options.allowUpload) {
                this.setupImageUploadElement();
            }

        });

    },

    getUploadUrl: function() {

        // extending component should return upload url here
        return 'upload';

    },

    getEditControllerParams: function(mediaModel) {

        return {
            controllerName: this.options.relation.resourceName,
            controllerMethod: 'edit',
            controllerMethodParams: [mediaModel.get('id')]
        };

    },

    setupImageUploadElement: function() {

        var fileUpload = this.addView(new FileUpload({
            el: this.$inputWrapper,
            url: this.getUploadUrl(),
            mediaType: 'image',
            clickableSelector: '.fileUploadHandle, .placeholderImage',
            removePreviewOnUpload: true,
            renderInitialMarkup: false,
            maxFiles: 1,
            paramName: this.options.fileUploadParamName,
            headers: this.options.fileUploadHeaders,
            onUpload: function(file, response) {
                this.prepareModelFromUpload(file, response, this.whenModelIsUploaded.bind(this));
            }.bind(this),
            formatErrorMessage: this.options.formatErrorMessage
        }));

        this.listenTo(fileUpload, 'errorOnUpload', function(data) {

            require.ensure([], function() {

                var prompt = require('simpleprompt').simplePrompt;

                prompt({
                    message: data.message,
                    moduleClass: 'prompt_box withAcceptOnly',
                    closeOnOverlayClick: true,
                    acceptText: 'Nastavi'
                });

            });

        });

        return this;

    },

    prepareModelFromUpload: function(file, response, callback) {

        EntityModel.getFromApi({url: file.xhr.getResponseHeader('Location')}, callback, this);

    },

    whenModelIsUploaded: function(mediaModel) {

        if (this.options.assignWhenEditDone) {

            this.open(_.extend(this.getEditControllerParams(mediaModel), {
                afterControllerSetup: function(controller) {

                    this.listenTo(controller, 'entityUpdated', function(entityModel) {
                        if (entityModel.get('id') === mediaModel.get('id')) {
                            this.assignMediaModel(entityModel);
                            this.popup.remove();
                        }
                    });

                }
            }));

        } else {

            // defer for dropzone cleanup
            _.defer(function() {
                this.assignMediaModel(mediaModel);
            }.bind(this));

        }

    },

    assignMediaModel: function(mediaModel) {

        this.selectedModel = mediaModel;
        this.setValue(mediaModel.get('id'));
        this.render();

    }

});

module.exports = BaseMedia;
