var $ = require('jquery');
var _ = require('underscore');
var BaseElement = require('../formElements/baseElement');
var ButtonListElement = require('../listElements/button');
var serviceContainer = require('../library/serviceContainer');
var EntityModel = require('../library/entity').Model;
var Popup = require('../components/popup');
var pascalcase = require('to-case').pascal;
var translate = require('../library/translate');

var ExternalAmin = BaseElement.extend({

    elementType: 'externalAdmin',

    defaults: {
        mapCaptionTo: 'name',
        relation: {type: 'hasOne'},
        placeholderText: translate('formElements.externalAdmin.placeholderText'),
        showEditControl: false,
        controller: undefined,
        controllerMethod: 'index',
        controllerMethodParams: [],
        onSelect: function(model) {

            if (_.isArray(model)) {

                this.selectedModels = model;

                this.setValue(_.map(model, function(singleModel) {
                    return singleModel.get('id');
                }));

            } else {

                this.selectedModel = model;
                this.setValue(model.get('id'));

            }

            this.popup.remove();
            this.render();

        }
    },

    events: {
        'click .openBtn': function() {
            this.open({onSelect: this.options.onSelect});
        },
        'click .editBtn': 'openEdit',
        'click .removeBtn': 'unsetRelation'
    },

    open: function(params) {

        params = _.extend({
            controllerName: this.options.controller || this.options.relation.resourceName || this.options.name,
            controllerMethod: this.options.controllerMethod,
            controllerMethodParams: this.options.controllerMethodParams
        }, params);

        serviceContainer.get(pascalcase(params.controllerName + 'Controller'), function(Controller) {

            this.runResourceController(Controller, params);

        }.bind(this));

        return this;

    },

    openEdit: function() {

        var resourceId;

        if (this.selectedModel) {
            resourceId = this.selectedModel.get('id');
        } else if (this.entityModel) {
            resourceId = this.entityModel.get(this.getName() + '.id');
        }

        resourceId && this.open({
            controllerMethod: 'edit',
            controllerMethodParams: [resourceId],
            afterControllerSetup: function(controller) {

                this.listenTo(controller, 'entityUpdated', function(entityModel) {

                    if (entityModel.get('id') === resourceId) {
                        this.selectedModel = entityModel;
                        this.setValue(entityModel.get('id'));
                        this.trigger('relatedEntityUpdated', entityModel);
                        this.render();
                    }

                });

            }
        });

    },

    runResourceController: function(Controller, options) {

        var externalAdmin = this;

        var hasOneHandler = function(controller, listHandler) {

            listHandler.addItem(ButtonListElement, {
                caption: '',
                mapTo: function() {
                    return translate('formElements.externalAdmin.placeholderText');
                },
                attributes: {
                    className: 'nBtn externalAdminPicker iconArrowRight2'
                },
                action: options.onSelect.bind(externalAdmin),
                isForeign: true
            });

        };

        var hasManyHandler = function(controller, listHandler) {

            listHandler.addMassAction({
                caption: translate('formElements.externalAdmin.chooseSelected'),
                massAction: options.onSelect.bind(externalAdmin)
            });

            externalAdmin.listenToOnce(listHandler, 'beforeRenderItems', function() {
                listHandler.massActions.resetSelectedModels(this.selectedModels);
            });

        };

        var controller = new Controller(_.extend({isExternal: true, scrollContainer: '.resourceEdit'}, options.onSelect ? {
            beforeSetupList: this.options.relation.type === 'hasOne' ? hasOneHandler : hasManyHandler
        } : undefined));

        if (options.controllerMethod) {
            controller[options.controllerMethod].apply(controller, options.controllerMethodParams || []);
        }

        options.afterControllerSetup && options.afterControllerSetup.call(this, controller, this);

        this.popup = this.addView(Popup.open({
            className: 'popupType1',
            removeOnClose: true,
            content: controller
        }));

    },

    render: function() {

        this.$el.empty();

        BaseElement.prototype.render.call(this);

        if (this.options.relation.type === 'hasOne') {
            this.renderOneRelation();
        } else if (this.options.relation.type === 'hasMany') {
            this.renderManyRelation();
        }

        return this;

    },

    renderOneRelation: function() {

        this.$inputWrapper.empty().addClass('externalAdminElement withOne');

        this.bootstrapHasOneModel(function(model) {

            var itemCaption;

            if (model && this.options.mapCaptionTo) {
                itemCaption = this.extractModelCaption(model);
            } else {
                itemCaption = this.options.placeholderText;
            }

            $('<span>').addClass('item openBtn iconDots').text(itemCaption).appendTo(this.$inputWrapper);

            if (model) {

                $('<span>').addClass('removeBtn iconClose icr').appendTo(this.$inputWrapper);

                if (this.options.showEditControl) {
                    $('<span>').addClass('editBtn iconPencil icr').appendTo(this.$inputWrapper.addClass('withEditBtn'));
                }

            }

        });

    },

    extractModelCaption: function(model) {

        var mapCaptionTo = this.options.mapCaptionTo;

        return typeof mapCaptionTo === 'function' ? mapCaptionTo.call(this, model, this) : model.get(this.options.mapCaptionTo);

    },

    bootstrapHasOneModel: function(callback) {

        if (this.selectedModel) {

            callback.call(this, this.selectedModel);

        } else if (this.getValue()) {

            if (this.entityModel && typeof this.entityModel.get(this.getName()) !== 'undefined') {

                callback.call(this, this.entityModel.get(this.getName()));

            } else {

                this.setLoadingCaption();

                this.fetchEntityModel(this.getValue(), function(model) {
                    this.removeLoadingCaption();
                    callback.call(this, model);
                });

            }

        } else {

            callback.call(this, undefined);

        }

    },

    renderManyRelation: function() {

        this.$inputWrapper.empty().addClass('externalAdminElement withMany');

        this.bootstrapHasManyModels(function(models) {

            this.selectedModels = models;

            _.each(models, function(model) {
                var $item = $('<div>').addClass('item').text(this.extractModelCaption(model)).appendTo(this.$inputWrapper);
                $('<button>').addClass('removeBtn iconClose icr nBtn').attr('data-id', model.get('id')).appendTo($item);
            }, this);

            $('<button type="button" class="nBtn openBtn iconDots' + (models.length ? ' icr' : '') + '">').text(models.length ? '' : translate('formElements.externalAdmin.placeholderText')).appendTo(this.$inputWrapper);

        });

    },

    bootstrapHasManyModels: function(callback) {

        var references = this.getValue();

        if (!references) {
            references = [];
        } else {
            references = _.isArray(references) ? references : references.split(',');
        }

        if (references.length) {

            if (this.selectedModels && this.selectedModels.length) {

                callback.call(this, this.selectedModels);

            } else {

                var relatedModels = this.entityModel && this.entityModel.get(this.getName());

                if (relatedModels && relatedModels.length) {

                    callback.call(this, relatedModels.slice());

                } else {

                    var models = [];
                    var deferreds;

                    this.setLoadingCaption();

                    deferreds = _.map(references, function(id) {
                        return this.fetchEntityModel(id, function(model) {
                            models.push(model);
                        });
                    }, this);

                    $.when.apply($, deferreds).then(function() {
                        this.removeLoadingCaption();
                        callback.call(this, models);
                    }.bind(this));

                }

            }

        } else {
            callback.call(this, []);
        }

    },

    fetchEntityModel: function(id, callback) {

        return EntityModel.getFromApi({
            resourceName: this.options.relation.resourceName || this.getName(),
            id: id
        }, function(model) {
            callback.call(this, model);
        }, this);

    },

    setLoadingCaption: function() {

        this.$loadingCaption = this.$loadingCaption || $(
            '<p class="loadingCaption">' + translate('formElements.multipleSelect.loadingCaption') + '</p>'
        ).appendTo(this.$inputWrapper);

    },

    removeLoadingCaption: function() {

        this.$loadingCaption.remove();

    },

    unsetRelation: function(e) {

        if (this.options.relation.type === 'hasOne') {

            delete this.selectedModel;
            this.setValue(undefined);

        } else if (this.options.relation.type === 'hasMany') {

            this.selectedModels = _.without(this.selectedModels, _.findWhere(this.selectedModels, {
                id: String($(e.target).data('id'))
            }));

            this.setValue(_.pluck(this.selectedModels, 'id'));

        }

        this.render();

    }

}, {

    select: function(controllerName, callback, options) {

        return (new ExternalAmin(options && {options: options})).open({
            controllerName: controllerName,
            controllerMethod: 'index',
            onSelect: function(model) {
                this.remove();
                callback(model);
            }
        });

    },

    selectMany: function(controllerName, callback, options) {

        return this.select(controllerName, callback, _.extend({relation: {type: 'hasMany'}}), options);

    },

    open: function(options) {

        return (new ExternalAmin()).open(options);

    }

});

module.exports = ExternalAmin;
