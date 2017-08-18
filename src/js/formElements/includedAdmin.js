var $ = require('jquery');
var _ = require('underscore');
var BaseElement = require('js/formElements/baseElement');
var EditHandler = require('js/components/resourceEdit');
var EntityModel = require('js/library/entity').Model;
var EntityCollection = require('js/library/entity').Collection;
var HiddenInput = require('js/formElements/hidden');
var router = require('js/app').get('router');
var translate = require('js/library/translate');
var dragula = require('dragula');

module.exports = BaseElement.extend({

    elementType: 'includedAdmin',

    defaults: {
        updatePosition: false,
        removeItems: true,
        addItems: true,
        bulkSave: false,
        setupEdit: function() {}
    },

    initialize: function() {

        BaseElement.prototype.initialize.apply(this, arguments);

        if (this.options.updatePosition === true) {
            this.options.updatePosition = 'position';
        }

        this.on('beforeRemove', function() {
            this.drake && this.drake.destroy();
        });

    },

    events: {
        'click > .addItemBtn': function(e) {
            this.addNewIncludedItem();
        }
    },

    removeRow: function(model) {

        var rowView = this.getViewByModel(model);

        rowView.$el.slideUp(function() {

            this.modelCollection.remove(model);
            rowView.remove();
            this.collectionToValue();
            this.options.updatePosition && this.updatePositions();

        }.bind(this));

    },

    render: function() {

        BaseElement.prototype.render.call(this);

        this.$inputWrapper.empty().addClass('includedAdminElement');

        if (!this.modelCollection) {
            this.setModelCollection(this.entityModel && this.entityModel.get(this.options.relation.name || this.getName()) || new EntityCollection());
        }

        this.modelCollection.each(this.addRowView, this);

        if (this.options.updatePosition) {
            this.updatePositions().setupSort();
        }

        this.renderControls();

        return this;

    },

    setModelCollection: function(collection) {

        this.modelCollection = collection;

        if (this.options.updatePosition) {
            collection.comparator = this.options.updatePosition;
            collection.sort();
        }

        return this;

    },

    renderControls: function() {

        if (this.options.addItems) {
            this.$el.append('<button type="button" class="includedAdminBtn addItemBtn nBtn icr iconPlus">' + translate('formElements.includedAdmin.addButtonCaption') + '</button>');
        }

        return this;

    },

    collectionToValue: function() {

        return this.setValue(this.modelCollection.map(function(model) {
            return model.get('id');
        }));

    },

    addRowView: function(model) {

        var options = this.options;
        var resourceName = options.relation && options.relation.resourceName || this.getName();

        var editHandler = this.addView(new EditHandler({
            className: 'includedAdminRow',
            model: model,
            resourceName: resourceName,
            useLoader: false,
            focusErrors: false,
            elementAttributes: options.elementAttributes,
            apiUrl: router.apiUrl(resourceName, model.isNew() ? undefined : model.get('id'))
        }), 'rows');

        this.setupEdit ? this.setupEdit(editHandler, this) : options.setupEdit.call(this, editHandler, this);

        if (model.isNew()) {
            editHandler.addField(HiddenInput, {
                name: this.entityModel.getType(),
                relation: {type: 'hasOne', resourceName: this.entityModel.getType()}
            });
        }

        if (options.updatePosition) {
            editHandler.addField(HiddenInput, {
                name: options.updatePosition
            });
        }

        editHandler.prepareEntityModel(function() {

            editHandler.render();
            this.prepareRowControls(editHandler, model);

        }.bind(this));

        editHandler.$el.appendTo(this.$inputWrapper);

        return editHandler;

    },

    prepareRowControls: function(editHandler, model) {

        var $controls;

        if (this.options.updatePosition || this.options.removeItems) {

            $controls = $('<div class="itemControls">');

            editHandler.$el.addClass('withControls');

            if (this.options.updatePosition) {
                $('<a role="button" class="sortHandle control icr iconSort">').appendTo($controls);
            }

            if (this.options.removeItems) {
                $('<button type="button" class="removeIncludedItemBtn control nBtn icr iconTrash">')
                    .on('click', function() { this.removeRow(model); }.bind(this))
                    .appendTo($controls);
            }

            $controls.appendTo(editHandler.$el);

        }

        return $controls;

    },

    setupSort: function() {

        this.drake && this.drake.destroy();

        this.drake = dragula([this.$inputWrapper.get(0)], {
            moves: function(el, source, handle, sibling) {
                var $handle = $(handle);
                return $handle.is('.sortHandle') && $handle.closest('.includedAdminElement').is(this.$inputWrapper);
            }.bind(this),
            mirrorContainer: this.$inputWrapper.get(0),
            direction: 'vertical'
        });

        this.drake.on('drop', this.updatePositions.bind(this));

        return this;

    },

    updatePositions: function() {

        _.each(this.getGroupViews('rows'), function(rowView) {
            rowView.getFieldInstance(this.options.updatePosition).setValue(rowView.$el.index());
        }, this);

        return this;

    },

    addNewIncludedItem: function(model) {

        var addModel = function(rowModel) {
            this.modelCollection.add(rowModel);
            this.addRowView(rowModel);
            this.options.updatePosition && this.updatePositions();
        }.bind(this);

        model ? addModel(model) : this.prepareNewModel(addModel);

        return this;

    },

    prepareNewModel: function(callback) {

        var model = EntityModel.create().setType(this.options.relation.resourceName || this.getName());
        var reverseRelationName = this.entityModel.getType();

        model.setRelation(reverseRelationName, {
            type: reverseRelationName,
            id: this.entityModel.get('id')
        });

        callback && callback.call(this, model);

    },

    saveRelated: function() {

        if (this.options.bulkSave) {

            return this.bulkSaveRelated();

        } else {

            return this.when(_.map(this.getGroupViews('rows'), function(rowView) {
                return rowView.save();
            }), this.collectionToValue);

        }

    },

    bulkSaveRelated: function() {

        var patchData = _.map(this.getGroupViews('rows'), function(rowView) {

            var model = rowView.entityModel;

            rowView.mapFieldValuesToModel();

            if (model.isNew()) {
                model.apiData.data.id = model.cid;
            }

            return model.prepareSyncData(model.preparePersistedKeys(rowView.getEditableEntityKeys()));

        });

        return this.when($.ajax({

            url: this.options.bulkSave.url,
            data: JSON.stringify({data: patchData}),
            type: 'PUT',
            contentType: 'application/vnd.api+json'

        }), this.onBulkSaveSucess, this.onBulkSaveFail);

    },

    onBulkSaveSucess: function(response) {

        this.setModelCollection(EntityCollection.createFromApiData(response));
        this.collectionToValue();
        this.rerender();

    },

    onBulkSaveFail: function(response) {

        if (!response && !response.responseJSON && !response.responseJSON.errors) {
            return;
        }

        var editHandlerRows = this.getGroupViews('rows');
        var groupedErrors = {};

        _.invoke(editHandlerRows, 'removeErrorMessages');

        // group errors by id
        _.each(response.responseJSON.errors, function(error) {

            var entityId = error.source.parameter;

            groupedErrors['forId' + entityId] = groupedErrors['forId' + entityId] || {
                id: entityId.toString(),
                errors: []
            };

            groupedErrors['forId' + entityId].errors.push(error);

        });

        // find item by id and display error messages
        _.each(groupedErrors, function(errorGroup) {

            var editHandlerRow = _.find(editHandlerRows, function(row) {
                var rowModel = row.entityModel;
                var modelId = rowModel.isNew() ? rowModel.cid : rowModel.get('id');
                return modelId === errorGroup.id;
            });

            editHandlerRow && editHandlerRow.displayErrorMessages(errorGroup.errors);

        });

    }

});
