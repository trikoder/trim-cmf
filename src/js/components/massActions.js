var $ = require('jquery');
var _ = require('underscore');
var SelectInput = require('../formElements/select');
var CheckboxInput = require('../formElements/checkbox');
var EntityCollection = require('../library/entity').Collection;
var prompt = require('simpleprompt').simplePrompt;
var translate = require('../library/translate');

module.exports = require('../library/view').extend({

    tagName: 'form',
    className: 'massActionsType1',

    assignOptions: true,

    optionRules: {
        actions: {type: Array, default: function() { return []; }},
        mapSelectedCaptionsTo: {type: [String, Function], default: 'id'}
    },

    initialize: function(options) {

        this.selectedCollection = new EntityCollection();

        this.listenTo(this.selectedCollection, 'add remove reset', function() {
            this.renderSelected();
        });

    },

    addAction: function(actionConfig) {

        this.options.actions.push(actionConfig);
        return this;

    },

    resetSelectedModels: function(models) {

        this.selectedCollection.reset(models);
        return this;

    },

    updateSelectedRowControls: function() {

        _.each(this.getGroupViews('selectRowControls'), function(view) {

            if (this.selectedCollection.get(view.model.get('id'))) {
                view.setValue(true, {render: true});
            }

        }, this);

        return this;

    },

    events: {

        'click .removeItem': function(e) {

            setTimeout(function() {
                this.removeSelectedItem($(e.target).attr('data-id'));
            }.bind(this), 0);

        },

        'click .toggleSelectedItems': function() {

            this.$el.hasClass('activeDropdown') ? this.closeSelectedItems() : this.openSelectedItems();

        },

        submit: function(e) {

            e.preventDefault();

            var actionDefinition = this.options.actions[this.selectView.getValue()];

            if (actionDefinition.confirm) {

                prompt({
                    message: actionDefinition.confirm === true ? translate('prompt.defaultMessage') : actionDefinition.confirm,
                    confirm: function() {
                        this.runAction(actionDefinition);
                    },
                    context: this,
                    cancelText: translate('prompt.cancelText'),
                    acceptText: translate('prompt.acceptText')
                });

            } else {

                this.runAction(actionDefinition);

            }

        }

    },

    openSelectedItems: function() {

        this.$el.addClass('activeDropdown');
        this.addDismissListener('closeSelectedItems');

        return this;

    },

    closeSelectedItems: function() {

        this.$el.removeClass('activeDropdown');
        this.removeDismissListener('closeSelectedItems');

        return this;

    },

    runAction: function(actionDefinition) {

        var self = this;
        var selectedItemModels = this.selectedCollection.slice();
        var actionDeferreds;
        var updateMessage = actionDefinition.updateMessage;

        if (selectedItemModels.length === 0 || this.actionInProgress) {
            return;
        }

        if (actionDefinition.action) {

            actionDeferreds = _.map(selectedItemModels, function(model) {
                return actionDefinition.action(model);
            });

        } else if (actionDefinition.massAction) {

            actionDeferreds = actionDefinition.massAction(selectedItemModels);

        } else if (actionDefinition.updateAttributes) {

            actionDeferreds = this.updateCollection(selectedItemModels, actionDefinition.updateAttributes);

        }

        if (actionDeferreds && actionDeferreds.length) {

            this.actionInProgress = true;
            this.loading(true);

            return $.when.apply($, _.map(actionDeferreds, function(deferred) {

                var waitDeferred = $.Deferred();
                deferred.always(function() { waitDeferred.resolve(); });
                return waitDeferred;

            })).done(function() {

                self.loading(false);
                self.actionInProgress = false;

                if (updateMessage) {

                    var failedModels = _.filter(selectedItemModels, function(model, index) {
                        return actionDeferreds[index].state() === 'rejected';
                    });

                    self.trigger('message', failedModels.length ? {
                        status: 'error',
                        text: typeof updateMessage.error === 'function' ? updateMessage.error({
                            failedItemsCount: failedModels.length,
                            doneItemsCount: selectedItemModels.length - failedModels.length,
                            selectedItemsCount: selectedItemModels.length,
                            selectedModels: selectedItemModels,
                            rejectedModels: failedModels,
                            rejectedDeferreds: _.filter(actionDeferreds, function(deferred) {
                                return deferred && deferred.state && deferred.state() === 'rejected';
                            })
                        }) : updateMessage.error,
                        failedModels: failedModels
                    } : {
                        status: 'success',
                        text: typeof updateMessage.success === 'function' ? updateMessage.success({
                            doneItemsCount: selectedItemModels.length - failedModels.length,
                            selectedItemsCount: selectedItemModels.length,
                            selectedModels: selectedItemModels
                        }) : updateMessage.success,
                    });

                }

                if (actionDefinition.onComplete) {
                    actionDefinition.onComplete(actionDeferreds, selectedItemModels);
                }

                self.resetSelectedModels([]);

            });

        }

    },

    render: function() {

        this.$el.empty();

        this.selectView = this.addView(new SelectInput({options: {
            attributes: {
                label: {className: 'label'},
                inputWrapper: {className: 'selectType1'},
                wrapper: {className: 'selectCont'}
            },
            selectOptions: _.map(this.options.actions, function(action, index) {
                return {caption: action.caption, value: index};
            })
        }})).render().prependTo(this.$el);

        $('<button />').text(translate('massActions.confirmButtonCaption')).appendTo(this.$el);

        return this;

    },

    renderSelected: function() {

        if (!this.$selectedItemsDropdown) {
            this.$selectedItemsDropdown = $('<div />').addClass('selectedItems').appendTo(this.$el);
            this.$selectedItemsToggleBtn = $('<a class="toggleSelectedItems iconArrowDown"></a>').appendTo(this.$selectedItemsDropdown);
            this.$selectedItemsList = $('<ul />').appendTo(this.$selectedItemsDropdown);
        }

        this.$selectedItemsToggleBtn.text(
            translate('massActions.selectedItemsCaption') + ': ' + this.selectedCollection.length
        );

        this.$selectedItemsList.html(this.selectedCollection.map(function(model) {

            var caption = '';

            if (typeof this.options.mapSelectedCaptionsTo === 'function') {
                caption = this.options.mapSelectedCaptionsTo(model);
            } else {
                caption = this.options.mapSelectedCaptionsTo === 'id' ? 'ID: ' + model.get('id') : model.get(this.options.mapSelectedCaptionsTo);
            }

            return '<li>' +
                        '<button class="nBtn removeItem iconClose" data-id="' + model.get('id') + '" type="button">' + caption + '</button>' +
                    '</li>';
        }, this).join(''));

        if (this.selectedCollection.length === 0) {
            this.$el.removeClass('activeDropdown');
        }

        this.$selectedItemsDropdown.toggleClass('withItems', this.selectedCollection.length > 0);

        return this;

    },

    updateModel: function(model, changedAttributes) {

        return model.saveOnly({attributes: changedAttributes});

    },

    updateCollection: function(collection, changedAttributes) {

        return _.map(collection, function(model) {

            return this.updateModel(model, changedAttributes);

        }, this);

    },

    getSelectRowElement: function(options) {

        var selectRowControl = this.addView(new CheckboxInput(_.extend({
            options: {attributes: {input: {className: 'checkboxType1 massActionCheckbox'}}}
        }, options)), 'selectRowControls');

        var model = options.model;

        if (this.selectedCollection.get(model.get('id'))) {
            selectRowControl.setValue(true);
        }

        this.listenTo(selectRowControl, 'change', function(value) {
            this.selectedCollection[selectRowControl.getValue() ? 'add' : 'remove'](model);
        });

        return selectRowControl.render().$el;

    },

    getSelectAllElement: function(options) {

        var selectAllControl = this.addView(new CheckboxInput(_.extend({
            options: {attributes: {input: {className: 'checkboxType1 massActionSelectAll'}}}
        }, options)), 'selectAllControls');

        this.listenTo(selectAllControl, 'change', function() {

            var shouldSelectAll = selectAllControl.getValue();

            _.each(this.getGroupViews('selectRowControls'), function(selectRowControl) {
                selectRowControl.setValue(shouldSelectAll, {render: true});
            });

        });

        return selectAllControl.render().$el;

    },

    removeSelectedItem: function(id) {

        id = String(id);
        this.selectedCollection.remove(id);

        _.chain(this.getGroupViews('selectRowControls')).filter(function(view) {
            return view.model.get('id') === id;
        }).each(function(view) {
            view.setValue(false, {render: true});
        });

    },

    removeSelectControls: function() {

        return this.removeViews('selectAllControls').removeViews('selectRowControls');

    }

});
