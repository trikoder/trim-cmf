var $ = require('jquery');
var _ = require('underscore');
var EntityModel = require('../library/entity').Model;
var Message = require('../components/message');
var Tabber = require('../components/tabber');
var View = require('../library/view');
var translate = require('../library/translate');
var api = require('../library/api');

module.exports = View.extend({

    defaults: {
        apiUrl: null,
        includedApiData: null,
        resourceName: null,
        resourceId: null,
        useLoader: true,
        focusErrors: true,
        saveStrategy: 'relatedFirst',
        waitForFieldsToRender: true,
        afterCreate: function() {},
        afterUpdate: function() {},
        afterSave: function() {},
        elementAttributes: {
            text: {
                input: {className: 'inputType2'},
                label: {className: 'labelType2'},
                wrapper: {className: 'inputBlockType1'},
                errorMessage: {className: 'errorMessageType1'}
            },
            textarea: {
                input: {className: 'inputType2', rows: 1, autocomplete: 'off', autocorrect: 'off', autocapitalize: 'off', spellcheck: 'false'},
                label: {className: 'labelType2'},
                wrapper: {className: 'inputBlockType1'},
                errorMessage: {className: 'errorMessageType1'}
            },
            html: {
                input: {className: 'htmlInputType1'},
                label: {className: 'labelType2'},
                wrapper: {className: 'inputBlockType1'},
                errorMessage: {className: 'errorMessageType1'}
            },
            date: {
                input: {className: 'inputType2'},
                label: {className: 'labelType2'},
                wrapper: {className: 'inputBlockType1'},
                errorMessage: {className: 'errorMessageType1'}
            },
            dateTime: {
                input: {className: 'inputType2'},
                label: {className: 'labelType2'},
                wrapper: {className: 'inputBlockType1'},
                errorMessage: {className: 'errorMessageType1'}
            },
            checkbox: {
                input: {className: 'checkboxType1'},
                label: {className: 'checkboxLabelType1'},
                wrapper: {className: 'inputBlockType1'},
                errorMessage: {className: 'errorMessageType1'}
            },
            select: {
                label: {className: 'labelType2'},
                inputWrapper: {className: 'selectType1'},
                wrapper: {className: 'inputBlockType1'},
                errorMessage: {className: 'errorMessageType1'}
            },
            multipleSelect: {
                label: {className: 'labelType2'},
                inputWrapper: {className: 'multipleSelectType1'},
                wrapper: {className: 'inputBlockType1'},
                errorMessage: {className: 'errorMessageType1'}
            },
            nestedSelect: {
                label: {className: 'labelType2'},
                wrapper: {className: 'inputBlockType1'},
                errorMessage: {className: 'errorMessageType1'}
            },
            externalAdmin: {
                label: {className: 'labelType2'},
                wrapper: {className: 'inputBlockType1'},
                errorMessage: {className: 'errorMessageType1'}
            },
            media: {
                label: {className: 'labelType2'},
                wrapper: {className: 'inputBlockType1'},
                errorMessage: {className: 'errorMessageType1'}
            },
            fileAttachment: {
                label: {className: 'labelType2'},
                wrapper: {className: 'inputBlockType1'},
                errorMessage: {className: 'errorMessageType1'}
            },
            map: {
                label: {className: 'labelType2'},
                wrapper: {className: 'inputBlockType1'},
                errorMessage: {className: 'errorMessageType1'}
            },
            includedAdmin: {
                label: {className: 'labelType2'},
                wrapper: {className: 'includedAdminBlockType1'},
                errorMessage: {className: 'errorMessageType1'}
            },
            mediaPreview: {
                label: {className: 'labelType2'},
                wrapper: {className: 'inputBlockType1'},
                inputWrapper: {className: 'mediaPreviewType1'},
                errorMessage: {className: 'errorMessageType1'}
            },
            articleBody: {
                label: {className: 'labelType2'},
                wrapper: {className: 'inputBlockType1'},
                inputWrapper: {className: 'articleBodyEditorType1 cf'},
                errorMessage: {className: 'errorMessageType1'}
            },
            stateSelect: {
                label: {className: 'labelType2'},
                wrapper: {className: 'inputBlockType1'}
            }
        }
    },

    initialize: function(options) {

        this.options = $.extend(true, {}, this.defaults, options);
        this.fieldDefinitions = {};

    },

    events: function() {
        return this.$el.is('form') ? {submit: function(e) {

            e.preventDefault();
            this.save();

        }} : {};
    },

    setLayout: function(layout) {

        this.layout = layout;
        this.prepareLayoutFieldDecorators();

        return this;

    },

    addField: function(Type, options) {

        this.fieldDefinitions[options.name] = {
            Type: Type,
            options: options
        };

        return this;

    },

    getFieldInstance: function(key) {

        return this.fieldInstances[key];

    },

    prepareEntityModel: function(callback) {

        if (this.model) {

            this.entityModel = this.model;
            callback.call(this, this.entityModel);

        } else if (this.options.resourceId) {

            this.getEntityFromApi(callback);

        } else {

            this.entityModel = new EntityModel().setType(this.options.resourceName);
            callback.call(this, this.entityModel);

        }

    },

    getEntityFromApi: function(callback) {

        this.loading(true);

        this.when(api.get(this.options.apiUrl, this.options.includedApiData), function(apiData) {

            this.entityModel = EntityModel.createFromApiData(apiData);
            callback && callback.call(this, this.entityModel);

        }, function() {

            this.trigger('entityNotFound');

        }).always(function() {

            this.loading(false);

        }.bind(this));

    },

    includeApiData: function(params) {

        this.options.includedApiData = {
            include: (_.isArray(params) ? params : _.toArray(arguments)).join(',')
        };

        return this;

    },

    save: function() {

        var saveDeferred = $.Deferred();
        var saveStrategy = this.options.saveStrategy;

        var onSave = function() {

            this.removeErrorMessages();
            this.options.afterSave(this.entityModel);
            this.trigger('entityModelSaved', this.entityModel);

            saveDeferred.resolve();

        }.bind(this);

        var onFail = function(data) {

            if (data.responseJSON && data.responseJSON.errors) {
                this.removeErrorMessages().displayErrorMessages(data.responseJSON.errors);
            } else {
                this.trigger('apiError', translate('validation.serverError'));
            }

            saveDeferred.reject();

        }.bind(this);

        this.loading(true);

        if (saveStrategy === 'relatedFirst') {

            this.when(this.saveRelatedEntities(), function() {

                this.mapFieldValuesToModel();
                this.when(this.saveEntity(), onSave, onFail);

            }, function() {

                saveDeferred.reject();
                this.removeErrorMessages().displayErrorMessages();

            });

        } else if (saveStrategy === 'relatedLast') {

            this.mapFieldValuesToModel();
            this.when(this.saveEntity(), function() {

                this.when(this.saveRelatedEntities(), onSave, function() {

                    saveDeferred.reject();
                    this.removeErrorMessages().displayErrorMessages([
                        {title: translate('validation.mainEntitySavedWithRelatedErrors')}
                    ]);

                });

            }, onFail);

        }

        saveDeferred.always(function() { this.loading(false); }.bind(this));

        return saveDeferred;

    },

    getEditableEntityKeys: function() {

        return {
            attributes: _.keys(_.pick(this.fieldInstances, function(fieldInstance) {
                var isNotFileElement = fieldInstance.elementType !== 'fileAttachment';
                var isNotRelation = typeof fieldInstance.options.relation === 'undefined';
                var isNotReadOnly = !fieldInstance.readOnly;
                return isNotRelation && isNotFileElement && isNotReadOnly;
            })),
            relations: _.keys(_.pick(this.fieldInstances, function(fieldInstance) {
                var isNotFileElement = fieldInstance.elementType !== 'fileAttachment';
                var isRelation = typeof fieldInstance.options.relation !== 'undefined';
                var isNotReadOnly = !fieldInstance.readOnly;
                return isRelation && isNotFileElement && isNotReadOnly;
            }))
        };

    },

    getFileAttachments: function() {

        var fileList = _.reduce(this.fieldInstances, function(memo, fieldInstance) {
            if (fieldInstance.elementType === 'fileAttachment' && fieldInstance.getFile()) {
                memo[fieldInstance.getName()] = fieldInstance.getFile();
            }
            return memo;
        }, {});

        return _.isEmpty(fileList) ? undefined : {files: fileList};

    },

    saveEntity: function() {

        var isNewModel = this.entityModel.isNew();

        return this.entityModel.saveOnly(
            $.extend(this.getEditableEntityKeys(), this.getFileAttachments())
        ).done(function() {
            this.options[isNewModel ? 'afterCreate' : 'afterUpdate'](this.entityModel);
        }.bind(this));

    },

    saveRelatedEntities: function() {

        return this.when(_.map(this.fieldInstances, function(fieldInstance) {

            if (fieldInstance.saveRelated) {

                if (fieldInstance.setMainRelationReference && this.entityModel.get('id')) {
                    fieldInstance.setMainRelationReference(this.entityModel.get('id'));
                }

                return fieldInstance.saveRelated();
            }

        }, this));

    },

    mapFieldValuesToModel: function() {

        _.each(this.fieldInstances, function(field, name) {

            if (field.readOnly) {
                return;
            }

            var relation = this.fieldDefinitions[name].options.relation;

            if (relation) {

                this.mapFieldRelationToModel(field, relation);

            } else {

                this.entityModel.set(field.getName(), field.getValue(''));

            }

        }, this);

    },

    mapFieldRelationToModel: function(field, relation) {

        var relationObject;

        if (relation.type === 'hasMany') {

            relationObject = _.map(field.getValue(), function(value) {
                return {
                    type: relation.resourceName || field.getName(),
                    id: value
                };
            });

        } else {

            relationObject = typeof field.getValue() !== 'undefined' ? {
                type: relation.resourceName || field.getName(),
                id: field.getValue()
            } : null;

        }

        this.entityModel.setRelation(relation.name || field.getName(), relationObject);

    },

    removeErrorMessages: function() {

        this.removeViews('messages');

        _.each(this.fieldInstances, function(field) {
            field.removeErrorMessage();
        });

        return this;

    },

    displayErrorMessages: function(errors) {

        var globalErrors = [];

        _.each(errors || [], function(error) {

            if (!error.source) {
                globalErrors.push(error.title);
            } else {

                var fieldName = _.last(error.source.pointer.split('/'));

                if (!this.fieldInstances[fieldName]) {
                    globalErrors.push(error.title + ' ' + (error.detail || ''));
                } else {
                    this.fieldInstances[fieldName].setErrorMessage(error.title);
                }
            }

        }, this);

        if (globalErrors.length === 0) {
            globalErrors.push(translate('validation.globalErrorsMessage'));
        }

        this.renderMessage({
            content: globalErrors.join('. '),
            className: 'messageType1 error',
            closeAfter: false
        });

        if (this.options.focusErrors) {

            var $firstInputWithError = this.$('.withError').first();

            if ($firstInputWithError.length) {

                if (this.tabber) {
                    this.tabber.goToTab($firstInputWithError.closest('.tabPanelType1').data('id'));
                }

                $firstInputWithError.focus();

            }

        }

        return this;

    },

    render: function(callback) {

        this.removeViews();
        this.$el.empty();

        this.$layoutContainer = $('<div class="layoutContainer">').appendTo(this.$el);

        if (this.$el.is('form')) {
            $('<button class="hidden" type="submit"></button>').appendTo(this.$el);
        }

        this.renderLayout(function() {
            callback && callback.call(this);
            this.trigger('afterRender', this);
        });

    },

    prepareFieldInstance: function(fieldDefinition) {

        // decorate form element with attributes
        var defaultAttributes = this.options.elementAttributes[fieldDefinition.Type.getType()];

        if (this.layout && fieldDefinition.options.layoutReference) {
            var layoutAttributes = this.layout.fieldDecorators[fieldDefinition.options.layoutReference];
            defaultAttributes = $.extend(true, {}, defaultAttributes, layoutAttributes);
        }

        var fieldView = new fieldDefinition.Type({
            options: $.extend(true, {}, {attributes: defaultAttributes}, fieldDefinition.options),
            entityModel: this.entityModel
        });

        // set form element value if it can be extracted from current dataset
        var fieldValue;
        var relation = fieldDefinition.options.relation;

        if (relation) {
            fieldValue = this.entityModel.getRelationReferences(relation.name || fieldDefinition.options.name);
        } else {
            fieldValue = this.entityModel.get(fieldDefinition.options.name);
        }

        if (typeof fieldValue !== 'undefined') {
            fieldView.setValue(fieldValue, {silent: true});
        }

        this.listenTo(fieldView, 'change', function() {
            this.trigger('change.' + fieldView.name, fieldView.getValue(), fieldView);
        }).listenTo(fieldView, 'relatedEntityUpdated', function(relatedEntityModel) {
            this.trigger('relatedEntityUpdated.' + fieldView.name, relatedEntityModel, fieldView);
        });

        return fieldView;

    },

    renderFields: function(callback) {

        var self = this;

        this.fieldInstances = {};

        _.each(this.fieldDefinitions, function(fieldDefinition, fieldName) {

            var fieldView = this.prepareFieldInstance(fieldDefinition);
            this.fieldInstances[fieldName] = this.addView(fieldView);

            fieldView.render();

        }, this);

        this.loading(true);

        $.when.apply(null, _.map(this.fieldInstances, function(fieldInstance) {

            return self.options.waitForFieldsToRender ? fieldInstance.renderDeferred : false;

        })).done(function() {

            this.removeViews('fields');

            _.each(this.fieldInstances, function(field) {
                this.addView(field, 'fields');
            }, this);

            this.loading(false);
            callback && callback.call(this);

        }.bind(this));

        return this;

    },

    renderTabs: function() {

        var $tabContainer = $('<div>').appendTo(this.$layoutContainer);

        _.each(this.layout.tabs, function(tab, index) {

            var tabName = tab.name || 'tab' + (index + 1);
            var $tab = $('<div>')
                .attr('data-id', tabName)
                .attr('data-title', tab.caption)
                .addClass(tab.className || 'tabPanelType1')
                .appendTo($tabContainer);

            this.layout.domReferences[tabName] = $tab;

            if (tab.regions) {
                this.renderRegions(tab.regions, $tab, tabName + '.');
            } else if (tab.groups) {
                this.renderGroups(tab.groups, $tab, tabName + '.');
            }

        }, this);

        this.tabber = this.addView(new Tabber({
            el: $tabContainer,
            tabNavClass: 'tabNavType1',
            sectionClass: 'tabPanelType1',
            buttonClass: 'tabBtn nBtn',
            buildNavigation: true,
            onTabChange: function($section, tabIndex) {

                $(window).trigger('tabChange');
                this.currentTabIndex = tabIndex;

            }.bind(this)
        }), 'tabs');

        this.tabber.goToTab(this.currentTabIndex || 0);

        this.layout.hasTabs = true;

    },

    renderRegions: function(regions, $container, referencePrefix) {

        $container.addClass('editLayoutRegions');

        if (_.isObject(regions) && !_.isArray(regions)) {
            regions = _.map(regions, function(regionData, regionName) {
                return _.extend({name: regionName}, regionData);
            });
        }

        _.each(regions, function(region) {

            if (typeof region === 'string') {
                region = {name: region};
            }

            var $region = $('<div>').addClass(region.name + 'Region').appendTo($container);
            var $regionInner = $('<div class="regionInner">').appendTo($region);
            var reference = (referencePrefix || '') + region.name + 'Region';
            this.layout.domReferences[reference] = $regionInner;
            region.groups && this.renderGroups(region.groups, $regionInner, reference + '.');

        }, this);

        this.layout.hasRegions = true;

    },

    renderGroups: function(groups, $container, referencePrefix) {

        _.each(groups, function(group, index) {

            var $group = $('<div class="editLayoutGroup">').addClass(group.className).appendTo($container);
            var reference = (referencePrefix || '') + (group.name ? group.name : 'group' + (index + 1));
            this.layout.domReferences[reference] = $group;

        }, this);

    },

    renderLayout: function(callback) {

        this.renderFields(function() {

            this.removeViews('tabs');

            this.$layoutContainer.empty();

            var layout = this.layout;

            if (layout) {

                layout.domReferences = {};

                if (layout.tabs) { this.renderTabs(); } else if (layout.regions) { this.renderRegions(this.layout.regions, this.$layoutContainer); } else if (layout.groups) { this.renderGroups(this.layout.groups, this.$layoutContainer); }

                this.$layoutContainer.toggleClass('withTabs', Boolean(layout.hasTabs));
                this.$layoutContainer.toggleClass('withRegions', Boolean(layout.hasRegions));

            }

            _.each(this.fieldInstances, function(fieldInstance) {

                var $container;

                if (layout && fieldInstance.options.layoutReference) {
                    $container = this.layout.domReferences[fieldInstance.options.layoutReference];
                } else {
                    $container = this.$layoutContainer;
                }
                fieldInstance.$el.appendTo($container);
                fieldInstance.trigger('insertInDom');

            }, this);

            callback && callback.call(this);

        });

    },

    prepareLayoutFieldDecorators: function() {

        var layout = this.layout;
        var decorators = this.layout.fieldDecorators = {};
        var prepareTabs, prepareRegions, prepareGroups;

        prepareTabs = function(tabs) {

            _.each(tabs, function(tab, index) {

                var reference = tab.name || 'tab' + (index + 1);
                decorators[reference] = tab.fieldAttributes;

                if (tab.regions) {
                    prepareRegions(tab.regions, reference + '.');
                } else if (tab.groups) {
                    prepareGroups(tab.groups, reference + '.');
                }

            }, this);

        };

        prepareRegions = function(regions, referencePrefix) {

            _.each(regions, function(region, regionName) {

                var reference = (referencePrefix || '') + regionName + 'Region';
                decorators[reference] = region.fieldAttributes;
                region.groups && prepareGroups(region.groups, reference + '.');

            }, this);

        };

        prepareGroups = function(groups, referencePrefix) {

            _.each(groups, function(group, index) {

                var reference = (referencePrefix || '') + (group.name ? group.name : 'group' + (index + 1));
                decorators[reference] = group.fieldAttributes;

            }, this);

        };

        if (layout.tabs) { prepareTabs(layout.tabs); } else if (layout.regions) { prepareRegions(layout.regions); } else if (layout.groups) { prepareGroups(layout.groups); }

        return this;

    },

    renderMessage: function(messageParams) {

        this.trigger('beforeMessageRender', messageParams);

        this.removeViews('messages');
        var message = this.addView(new Message(messageParams), 'messages');

        if (this.layout && this.layout.tabs) {
            message.insertAfter(this.$('.tabNavType1'));
        } else {
            message.insertBefore(this.$layoutContainer);
        }

        this.trigger('afterMessageRender', message);

        return this;

    },

    loading: function() {

        if (this.options.useLoader) {
            View.prototype.loading.apply(this, arguments);
        }

    }

});
