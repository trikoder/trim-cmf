var _ = require('underscore');
var $ = require('jquery');
var BaseAdmin = require('../controllers/baseAdmin');
var ListHandler = require('../components/resourceList');
var EditHandler = require('../components/resourceEdit');
var ResourceControls = require('../components/resourceControls');
var EntityModel = require('../library/entity').Model;
var router = require('../app').get('router');
var translate = require('../library/translate');
var prompt = require('simpleprompt').simplePrompt;

module.exports = BaseAdmin.extend({

    className: 'resourceController',

    defaults: {
        isExternal: false,
        scrollContainer: undefined,
        entityCreatedMessage: translate('baseResource.entityCreatedMessage'),
        entitySavedMessage: translate('baseResource.entitySavedMessage'),
        resourceListHandler: ListHandler,
        resourceEditHandler: EditHandler
    },

    createRequiresDraft: false,
    createRelatedStrategy: 'relatedFirst',

    initialize: function(options) {

        this.options = _.extend({}, this.defaults, options);

        if (!this.resourceName) {
            throw new Error('Please set resource name on controller');
        }

        if (!this.options.isExternal) {
            this.setNavSelected(this.resourceName);
        }

    },

    events: {
        'click > .headerType1 > .title > a': function(e) {
            e.preventDefault();
            this.openIndex();
        }
    },

    index: function(params) {

        this.cleanUpViews();
        this.setPageTitle(translate('baseResource.indexTitle'));
        this.resourceControls = this.addView(new ResourceControls());

        var ListHandlerType = this.options.resourceListHandler;

        var listHandler = this.listHandler = this.addView(
            new ListHandlerType(this.getListHandlerOptions(params))
        );

        this.listenTo(listHandler, 'apiError', this.showSystemError);

        this.options.beforeSetupList && this.options.beforeSetupList(this, listHandler);
        this.setupList(listHandler);

        if (params && _.isObject(params)) {

            params.filters && listHandler.filters.setDefinitionValues(params.filters);
            params.page && listHandler.pagination.setPage(params.page);
            params.sort && listHandler.sort.setSort(params.sort);

        }

        if (this.includeApiData && this.includeApiData.index) {
            listHandler.includeApiData(this.includeApiData.index);
        }

        this.render();
        listHandler.appendTo(this.$el).getData(listHandler.render);

    },

    getListHandlerOptions: function(params) {

        return {
            resourceName: this.resourceName,
            resourceUrl: this.options.isExternal ? undefined : this.getIndexUrl(params),
            resourceCaption: this.resourceCaption,
            apiUrl: router.apiUrl(this.resourceName),
            useUrl: !this.options.isExternal,
            editUrl: this.getEditUrl.bind(this),
            openEdit: this.openEdit.bind(this),
            createUrl: this.getCreateUrl.bind(this),
            openCreate: this.openCreate.bind(this)
        };

    },

    create: function(queryParams) {

        var controller = this;

        this.cleanUpViews();

        if (this.createRequiresDraft) {

            var draftEntityModel = EntityModel.create().setType(this.resourceName);

            this.loading(true);

            draftEntityModel.save().done(function() {
                controller.loading(false);
                controller.openEdit(draftEntityModel.get('id'));
            });

        } else {

            this.resourceControls = this.addView(new ResourceControls());
            this.setPageTitle(translate('baseResource.createTitle'));

            var EditHandlerType = this.options.resourceEditHandler;

            var editHandler = this.editHandler = this.addView(new EditHandlerType({
                tagName: 'form',
                className: 'resourceEdit resourceEditType1',
                resourceName: this.resourceName,
                apiUrl: router.apiUrl(this.resourceName),
                saveStrategy: this.createRelatedStrategy,
                afterSave: function(model) {

                    controller.openEdit(model.get('id'));

                    controller.listenToOnce(controller.editHandler, 'afterRender', function() {
                        controller.editHandler.renderMessage({content: controller.options.entityCreatedMessage});
                        controller.trigger('entityCreated', controller.editHandler.entityModel);
                    });

                }
            }));

            this.listenTo(editHandler, 'apiError', this.showSystemError);

            editHandler.prepareEntityModel(function(entityModel) {

                controller.trigger('entityModelPrepared', entityModel);

                controller.runSetupEdit(editHandler, 'create', null).done(function() {
                    controller.render();
                    editHandler.appendTo(controller).render();
                }).fail(function(errorMessage) {
                    controller.showSystemError(errorMessage);
                });

            });

        }

    },

    runSetupEdit: function(editHandler, method, id) {

        return $.when(this.setupEdit ? this.setupEdit(editHandler, method, id) : $.Deferred().reject());

    },

    edit: function(id) {

        var controller = this;

        this.cleanUpViews();
        this.resourceControls = this.addView(new ResourceControls());

        this.setPageTitle(translate('baseResource.editTitle'));

        var EditHandlerType = this.options.resourceEditHandler;

        var editHandler = this.editHandler = this.addView(new EditHandlerType({
            tagName: 'form',
            className: 'resourceEdit resourceEditType1',
            resourceName: this.resourceName,
            resourceId: id,
            apiUrl: router.apiUrl(this.resourceName, id),
            afterSave: function() {

                controller.scrollTo(0, 300, function() {
                    editHandler.renderLayout(function() {
                        editHandler.renderMessage({content: controller.options.entitySavedMessage});
                        controller.trigger('entityUpdated', editHandler.entityModel);
                    });
                });

            }
        }));

        this.listenTo(editHandler, 'apiError', this.showSystemError);
        this.listenTo(editHandler, 'entityNotFound', function() {
            this.trigger('404error');
        });

        if (this.includeApiData && this.includeApiData.edit) {
            editHandler.includeApiData(this.includeApiData.edit);
        }

        editHandler.prepareEntityModel(function(entityModel) {

            controller.trigger('entityModelPrepared', entityModel);

            controller.runSetupEdit(editHandler, 'edit', id).done(function() {
                controller.render();
                editHandler.appendTo(controller).render();
            }).fail(function(errorMessage) {
                controller.showSystemError(errorMessage);
            });

        });

    },

    render: function() {

        BaseAdmin.prototype.render.apply(this, arguments);

        if (this.resourceControls.hasControls()) {
            this.resourceControls.appendTo(this.$('> .headerType1'));
        }

        return this;

    },

    openIndex: function(params) {

        if (!this.options.isExternal) {
            router.navigateToUrl(this.getIndexUrl(params));
        }

        this.index(params);

    },

    openEdit: function(id) {

        if (!this.options.isExternal) {
            router.navigateToUrl(this.getEditUrl(id));
        }

        this.edit(id);

    },

    openCreate: function(queryParams) {

        if (!this.options.isExternal) {
            router.navigateToUrl(this.getCreateUrl(queryParams));
        }

        this.create(queryParams);

    },

    getCreateUrl: function(queryParams) {

        return router.url('resource.' + this.resourceName + '.create', null, queryParams);

    },

    getEditUrl: function(id) {

        return router.url('resource.' + this.resourceName + '.edit', {id: id});

    },

    getIndexUrl: function(params) {

        return router.url('resource.' + this.resourceName + '.index', null, this.getIndexUrlQueryParams(params));

    },

    getIndexUrlQueryParams: function(params) {

        var queryParams = params ? _.extend(
            {},
            params.filters,
            (params.page ? {page: params.page} : null),
            (params.sort ? {sort: params.sort} : null)
        ) : null;

        return _.isEmpty(queryParams) ? null : queryParams;

    },

    addDropdownControl: function(config) {

        this.resourceControls.addDropdownControl(_.extend({
            className: 'accented iconPlus',
            caption: translate('resourceControls.dropdownToggle'),
            actionContext: this
        }, config));

        return this;

    },

    addControl: function(config) {

        this.resourceControls.addControl(_.extend({actionContext: this}, config));
        return this;

    },

    addCreateControl: function(caption) {

        return this.addControl({
            caption: caption || translate('resourceControls.create'),
            url: this.getCreateUrl(),
            className: 'accented iconPlus',
            action: function() {
                this.openCreate();
            }
        });

    },

    addSaveControl: function(caption) {

        return this.addControl({
            caption: caption || translate('resourceControls.save'),
            className: 'accented iconFloppy',
            action: function() {
                this.editHandler.save();
            }
        });

    },

    addToIndexControl: function(caption) {

        return this.addControl({
            caption: caption || translate('resourceControls.toIndex'),
            className: 'withLeftIcon iconArrowLeft2',
            action: function() {
                this.openIndex(this.listHandler ? this.listHandler.getLastState() : undefined);
            }
        });

    },

    showSystemError: function(message) {

        prompt({
            message: message || translate('validation.serverError'),
            moduleClass: 'prompt_box withAcceptOnly',
            closeOnOverlayClick: true,
            acceptText: translate('prompt.continueText')
        });

    }

});
