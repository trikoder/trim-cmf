var _ = require('underscore');
var BaseAdmin = require('js/controllers/baseAdmin');
var EditHandler = require('js/components/resourceEdit');
var ResourceControls = require('js/components/resourceControls');
var app = require('js/app');
var translate = require('js/library/translate');
var EntityModel = require('js/library/entity').Model;

module.exports = BaseAdmin.extend({

    defaults: {
        isExternal: false,
        scrollContainer: undefined,
        entitySavedMessage: translate('baseResource.entitySavedMessage'),
        resourceEditHandler: EditHandler
    },

    initialize: function(options) {

        this.options = _.extend({}, this.defaults, options);

        if (!this.options.isExternal) {
            this.setNavSelected(this.resourceName);
        }

        this.setViewData('projectCaption', app.get('mainNavigation').getProjectCaption());

        this.setupModel(this.edit);

    },

    setupModel: function(callback) {

        callback.call(this, EntityModel.create());

    },

    render: function() {

        BaseAdmin.prototype.render.apply(this, arguments);

        if (this.resourceControls.hasControls()) {
            this.resourceControls.appendTo(this.$('> .headerType1'));
        }

    },

    edit: function(entityModel) {

        var controller = this;

        this.cleanUpViews();
        this.resourceControls = this.addView(new ResourceControls());

        this.setPageTitle(translate('baseResource.editTitle'));

        var EditHandlerType = this.options.resourceEditHandler;

        var editHandler = this.editHandler = this.addView(new EditHandlerType({
            tagName: 'form',
            className: 'resourceEdit resourceEditType1',
            model: entityModel,
            afterUpdate: function() {
                controller.scrollTo(0, 300, function() {
                    editHandler.renderLayout(function() {
                        editHandler.renderMessage({content: controller.options.entitySavedMessage});
                        controller.trigger('entityUpdated', editHandler.entityModel);
                    });
                });
            }
        }));

        this.listenTo(editHandler, 'apiError', this.showSystemError);

        if (this.includeApiData && this.includeApiData.edit) {
            editHandler.includeApiData(this.includeApiData.edit);
        }

        editHandler.prepareEntityModel(function() {

            controller.setupEdit(editHandler, 'edit', entityModel.get('id'));
            controller.render();
            editHandler.appendTo(controller).render();

        });

    },

    addDropdownControl: function(config) {

        this.resourceControls.addDropdownControl(_.extend({
            className: 'accented iconPlus',
            caption: translate('resourceControls.dropdownToggle')
        }, config, {actionContext: this}));

        return this;

    },

    addControl: function(config) {

        this.resourceControls.addControl(_.extend(config, {actionContext: this}));
        return this;

    },

    addSaveControl: function(caption) {

        return this.addControl({
            caption: caption || translate('resourceControls.save'),
            className: 'accented iconFloppy',
            action: function() {
                this.editHandler.save();
            }
        });

    }

});
