var $ = require('jquery');
var _ = require('underscore');
var BaseElement = require('../formElements/baseElement');
var EntityCollection = require('../library/entity').Collection;
var EntityModel = require('../library/entity').Model;
var Fuse = require('fuse.js');
var Fastsearch = require('fastsearch').fastsearch;
var translate = require('../library/translate');

module.exports = BaseElement.extend({

    elementType: 'nestedSelect',

    defaults: {
        search: true,
        mapCaptionTo: 'title',
        mapParentTo: 'parent',
        mapChildrenTo: 'children',
        mapIsLeafTo: undefined,
        mapLevelTo: undefined,
        selectableLevel: 'leaf',
        apiUrl: '',
        relation: {type: 'hasOne'}
    },

    initialize: function() {

        BaseElement.prototype.initialize.apply(this, arguments);

        this.on('beforeRemove', function() {
            this.fastsearch && this.fastsearch.destroy();
        });

    },

    events: {
        'click .openBtn': function(e) {

            e.preventDefault();
            this.$inputWrapper.hasClass('active') ? this.close() : this.open();

        },
        'click .treeBtn': function(e) {

            e.preventDefault();
            this.toggleTree($(e.target).attr('data-id'));

        },
        'click .selectableItem': function(e) {

            e.preventDefault();

            this.selectModel(this.entityCollection.get($(e.target).attr('data-id')));

            if (this.options.relation.type === 'hasOne') {
                this.close();
            }

        },
        'click .removeBtn': function(e) {

            e.preventDefault();
            this.unselectModel(this.selectedModels.get($(e.target).attr('data-id')));

        },
        'input .searchInput': function(e) {

            this.$inputWrapper.toggleClass('searchActive', this.$searchInput.val() !== '');

        }
    },

    extractCaption: function(model) {

        var mapCaptionTo = this.options.mapCaptionTo;

        return (typeof mapCaptionTo === 'function') ? mapCaptionTo.call(this, model, this) : model.get(mapCaptionTo);

    },

    selectModel: function(model) {

        if (this.options.relation.type === 'hasOne') {

            this.selectedModels = new EntityCollection([model]);
            this.setValue(model.get('id'));

        } else {

            this.selectedModels.add(model);
            this.setValue(this.selectedModels.pluck('id'));

        }

        this.renderControls();

        return this;

    },

    unselectModel: function(model) {

        if (this.options.relation.type === 'hasOne') {

            this.selectedModels = new EntityCollection([]);
            this.setValue(null);

        } else {

            this.selectedModels.remove(model);
            this.setValue(this.selectedModels.pluck('id'));

        }

        _.delay(this.renderControls.bind(this), 0);

        return this;

    },

    toggleTree: function(id) {

        this.$('.treeBtnFor' + id).each(function(i, button) {

            var $button = $(button);

            if (!$button.data('treeRendered')) {

                var $list = $('<ul>');
                var children = this.getEntityChildren(this.entityCollection.get(id));

                _.each(children.models ? children.models : children, function(model) {
                    this.renderListItem(model, $list);
                }, this);

                $list.insertAfter($button);
                $button.data('treeRendered', true);

            }

            $button.siblings('ul').toggleClass('active');

        }.bind(this));

        return this;

    },

    render: function() {

        BaseElement.prototype.render.call(this);

        this.$inputWrapper.addClass('nestedSelectElement ' + this.options.relation.type).empty();
        this.renderControls();

        return this;

    },

    rerender: function() {

        this.fastsearch && this.fastsearch.destroy();

        delete this.$controls;
        delete this.$dropdown;

        delete this.selectedModels;

        return BaseElement.prototype.rerender.apply(this, arguments);

    },

    renderControls: function() {

        this.$controls = this.$controls || $('<div />').addClass('controls').appendTo(this.$inputWrapper);
        this.$controls.empty();

        this.bootstrapModels(function(models) {

            this.$inputWrapper.toggleClass('hasItems', models.length > 0);

            this.selectedModels = models;

            models.each(function(model) {

                var itemCaption = this.extractCaption(model);
                var $item = $('<div>').addClass('item').text(itemCaption).appendTo(this.$controls);

                $('<button type="button" class="removeBtn iconClose icr nBtn" data-id="' + model.get('id') + '">').appendTo($item);

            }, this);

            $('<button type="button" class="openBtn iconDots nBtn">')
                .text(models.length ? '' : translate('formElements.nestedSelect.placeholderText'))
                .prependTo(this.$controls);

        });

    },

    bootstrapModels: function(callback) {

        if (this.selectedModels) {

            callback.call(this, this.selectedModels);

        } else if (this.getValue()) {

            if (this.entityModel && typeof this.entityModel.get(this.getName()) !== 'undefined') {

                var relatedData = this.entityModel.get(this.getName());
                var collection = relatedData instanceof EntityCollection ? relatedData : new EntityCollection([relatedData]);

                callback.call(this, collection);

            } else {

                var models = [];
                var idCollection = this.options.relation.type === 'hasOne' ? [this.getValue()] : this.getValue();
                var resourceName = this.options.relation.resourceName || this.getName();

                var deferreds = _.map(idCollection, function(id) {
                    return EntityModel.getFromApi({resourceName: resourceName, id: id}, function(model) {
                        models.push(model);
                    });
                });

                $.when.apply($, deferreds).then(function() {
                    callback.call(this, new EntityCollection(models));
                }.bind(this));

            }

        } else {

            callback.call(this, new EntityCollection());

        }

    },

    open: function() {

        this.$inputWrapper.addClass('loading');

        this.prepareEntitiesFromApi(function() {

            this.renderHierarchyFirstLevel();
            this.$inputWrapper.removeClass('loading').addClass('active');

            if (this.options.search) {
                !this.$searchInput && this.setupSearch();
                this.$searchInput.focus();
            }

            this.addDismissListener('close');

        });

    },

    setupSearch: function() {

        var self = this;
        var $searchForm = $('<div class="search iconSearch" />').prependTo(this.$dropdown);

        var searchItems = this.entityCollection.chain().filter(this.isLevelSelectable, this).map(function(model) {

            return {id: model.get('id'), caption: this.extractCaption(model)};

        }, this).value();

        this.$searchInput = $(
            '<input type="text" class="searchInput" placeholder="' + translate('formElements.nestedSelect.searchPlaceholder') + '" />'
        ).appendTo($searchForm);

        this.fastsearch = new Fastsearch(this.$searchInput, {
            wrapSelector: $searchForm,
            noResultsText: translate('formElements.nestedSelect.noResults'),
            responseFormat: {label: 'caption'},
            typeTimeout: 0,
            minQueryLength: 1,
            focusFirstItem: true,
            preventSubmit: true,
            onItemSelect: function($item, model) {

                self.selectModel(self.entityCollection.get(model.id));

                if (self.options.relation.type === 'hasOne') {
                    self.fastsearch.clear();
                    self.$inputWrapper.removeClass('searchActive');
                    self.close();
                }

            }
        });

        this.fastsearch.getResults = function(callback) {

            var fuse = self.fuse = self.fuse || new Fuse(searchItems, {keys: ['caption'], threshold: 0.4});
            callback(fuse.search(self.$searchInput.val()));

        };

    },

    renderHierarchyFirstLevel: function(callback) {

        if (!this.$dropdown) {

            var $dropdown = this.$dropdown = $('<div />').addClass('dropdown').appendTo(this.$inputWrapper);
            var $list = $('<ul>').addClass('itemList').appendTo($dropdown);

            this.entityCollection.chain().filter(function(model) {
                return this.getEntityLevel(model) === 0;
            }, this).each(function(model) {
                this.renderListItem(model, $list);
            }, this);

        }

    },

    renderListItem: function(model, $list) {

        var id = model.get('id');
        var isLeaf = this.isLeaf(model);
        var isLevelSelectable = this.isLevelSelectable(model);

        $('<li>' +
            '<button type="button" class="nBtn listItem ' + (isLevelSelectable ? 'selectableItem' : '') + '" data-id="' + id + '">' +
                this.extractCaption(model) +
            '</button>' +
            (isLeaf ? '' : '<button type="button" class="treeBtn treeBtnFor' + id + ' nBtn icr iconPlus" data-id="' + id + '"></button>') +
        '</li>').appendTo($list);

    },

    isLevelSelectable: function(model) {

        var selectableLevel = this.options.selectableLevel;

        if (selectableLevel === 'leaf') {
            return this.isLeaf(model);
        } else if (_.isArray(selectableLevel)) {
            return _.contains(selectableLevel, this.getEntityLevel(model));
        } else if (selectableLevel === 'all') {
            return true;
        }

    },

    getEntityLevel: function(entityModel) {

        if (this.options.mapLevelTo) {
            return this.options.mapLevelTo(entityModel);
        } else {

            var parent = entityModel.get(this.options.mapParentTo);
            return parent ? 1 + this.getEntityLevel(parent) : 0;

        }

    },

    getEntityChildren: function(entityModel) {

        if (typeof this.options.mapChildrenTo === 'function') {
            return this.options.mapChildrenTo(entityModel, this.entityCollection);
        } else {
            return entityModel.get(this.options.mapChildrenTo);
        }

    },

    isLeaf: function(model) {

        if (this.options.mapIsLeafTo) {
            if (typeof this.options.mapIsLeafTo === 'function') {
                return this.options.mapIsLeafTo(model, this.entityCollection);
            } else {
                return model.get(this.options.mapIsLeafTo);
            }
        } else {
            return Boolean(this.getEntityChildren(model)) === false;
        }

    },

    prepareEntitiesFromApi: function(callback) {

        if (this.entityCollection) {

            callback.call(this, this.entityCollection);

        } else {

            EntityCollection.getFromApi({url: this.options.apiUrl}, function(entityCollection) {

                this.entityCollection = entityCollection;
                callback.call(this, entityCollection);

            }.bind(this));

        }

    },

    close: function() {

        if (this.$inputWrapper.hasClass('active')) {
            this.$inputWrapper.removeClass('active');
            this.removeDismissListener('close');
        }

    }

});
