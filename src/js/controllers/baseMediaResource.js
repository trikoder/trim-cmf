var $ = require('jquery');
var _ = require('underscore');
var pascalcase = require('to-case').pascal;
var camelcase = require('to-case').camel;
var FileUpload = require('js/components/fileUpload');
var IncludedAdmin = require('js/formElements/includedAdmin');
var Message = require('js/components/message');
var ResourceControls = require('js/components/resourceControls');
var router = require('js/app').get('router');
var translate = require('js/library/translate');
var EntityModel = require('js/library/entity').Model;
var BaseResource = require('js/controllers/baseResource');

module.exports = BaseResource.extend({

    resourceName: 'media',

    resourceConfigDefaults: {
        mapMediaTypeTo: 'mediaType',
        mediaTypes: ['image'],
        uploadUrl: function() {
            return router.apiUrl(this.resourceName) + '/upload';
        },
        prepareModelFromUpload: function(file, response, callback) {
            EntityModel.getFromApi({url: file.xhr.getResponseHeader('Location')}, callback, this);
        },
        fileUploadParamName: 'binary',
        fileUploadHeaders: null
    },

    initialize: function() {

        BaseResource.prototype.initialize.apply(this, arguments);

        this.resourceConfig = _.extend({}, this.resourceConfigDefaults, this.resourceConfig);

        this.prepareCreateMediaHandlers();

    },

    prepareCreateMediaHandlers: function() {

        _.each(this.resourceConfig.mediaTypes, function(mediaTypeConfig) {

            mediaTypeConfig = typeof mediaTypeConfig === 'string' ? {name: mediaTypeConfig} : mediaTypeConfig;

            var mediaTypeName = mediaTypeConfig.name;
            var mediaTypeDefaults = {
                createPageTitle: _.capitalize(mediaTypeName) + ' upload',
                createRouteName: ['resource', camelcase(this.resourceName), 'create' + pascalcase(mediaTypeName)].join('.'),
                uploadCaption: _.capitalize(mediaTypeName) + ' upload',
                hasUploadUi: true
            };

            var mediaTypeOptions = _.extend(mediaTypeDefaults, mediaTypeConfig);

            this['create' + pascalcase(mediaTypeName)] = function() {

                if (!this.options.isExternal) {
                    router.navigateToRoute(mediaTypeOptions.createRouteName);
                }

                if (mediaTypeOptions.hasUploadUi) {

                    this.setupUploadUi({
                        pageTitle: mediaTypeOptions.createPageTitle,
                        uploadCaption: mediaTypeOptions.uploadCaption,
                        mediaType: mediaTypeOptions.name,
                        setupEdit: function(rowEditHandler, includedAdmin) {

                            this['setup' + pascalcase(mediaTypeName) + 'Edit'](rowEditHandler, 'edit');

                        }.bind(this)
                    }, this);

                } else {

                    this.once('entityModelPrepared', function(entityModel) {
                        entityModel.set(this.resourceConfig.mapMediaTypeTo, mediaTypeName);
                        this.setPageTitle(mediaTypeOptions.createPageTitle);
                    });
                    this.create();

                }

            };

        }, this);

        return this;

    },

    setupEdit: function(editHandler, method, id) {

        var mediaType = editHandler.entityModel.get(this.resourceConfig.mapMediaTypeTo);
        var methodName = 'setup' + pascalcase(mediaType) + 'Edit';

        this[methodName](editHandler, method, id);

    },

    setupUploadUi: function(options) {

        var $container, fileUpload, includedAdmin;
        var controller = this;

        this.setPageTitle(options.pageTitle);

        this.cleanUpViews();
        this.resourceControls = this.addView(new ResourceControls());

        this.addToIndexControl().addControl({
            caption: translate('resourceControls.save'),
            className: 'accented iconFloppy',
            action: function() {
                includedAdmin && includedAdmin.saveRelated().done(function() {

                    controller.scrollTo(0, 300, function() {
                        controller.removeViews('messages').addView(new Message({
                            content: translate('baseResource.entitySavedMessage')
                        }), 'messages').prependTo($container.parent());
                        controller.trigger('entitiesUploadedAndUpdated', includedAdmin.modelCollection);
                    });

                });
            }
        });

        this.resourceControls.freeze();

        this.render();

        $container = $(
            '<div class="resourceEdit mediaUploadType1 resourceEditType1">\
                <div class="layoutContainer"></div>\
            </div>'
        ).appendTo(this.$el).find('.layoutContainer');

        fileUpload = this.addView(new FileUpload({
            url: this.resourceConfig.uploadUrl.call(controller, controller),
            paramName: this.resourceConfig.fileUploadParamName,
            headers: this.resourceConfig.fileUploadHeaders,
            removePreviewOnUpload: true,
            mediaType: options.mediaType,
            caption: options.uploadCaption || 'Upload',
            onUpload: function(file, response) {

                if (!includedAdmin) {

                    includedAdmin = this.addView(new IncludedAdmin({
                        options: {
                            name: 'media',
                            removeItems: false,
                            addItems: false,
                            setupEdit: options.setupEdit
                        }
                    }));

                    includedAdmin.render().appendTo($container);

                }

                this.resourceConfig.prepareModelFromUpload(file, response, function(model) {
                    includedAdmin.addNewIncludedItem(model);
                });

            }.bind(this),
            formatErrorMessage: function(message) {
                return $.parseJSON(message).join('<br />');
            }
        }));

        fileUpload.appendTo($container);

    }

});
