var $ = require('jquery');
var _ = require('underscore');
var Filters = require('js/components/resourceFilters');
var Sort = require('js/components/sort');
var EntityCollection = require('js/library/entity').Collection;
var Message = require('js/components/message');
var MassActions = require('js/components/massActions');
var Pagination = require('js/components/pagination');
var apiFormatter = require('js/library/apiFormatter');
var router = require('js/app').get('router');
var translate = require('js/library/translate');

module.exports = require('js/library/view').extend({

    className: 'resourceListType1',

    assignOptions: true,

    defaults: {
        resourceUrl: null,
        resourceName: null,
        resourceCaption: null,
        apiUrl: null,
        useUrl: true,
        template: 'table'
    },

    initialize: function() {

        this.listItemsDefinitions = [];

        this.filters = this.addView(new Filters());
        this.listenTo(this.filters, 'filterRequest', this.handleFilterRequest);

        this.sort = this.addView(new Sort());
        this.listenTo(this.sort, 'sortRequest', this.handleSortRequest);

        this.pagination = this.addView(new Pagination({
            baseUrl: this.options.resourceUrl,
            useLinks: this.options.useUrl,
            preferenceKey: 'pagination.' + this.options.resourceName + '.itemsPerPage'
        }));

        this.listenTo(this.pagination, 'pageRequest', this.handlePageRequest);

    },

    addFilter: function(Type, options) {

        this.filters.add(Type, options);
        return this;

    },

    addSort: function(sortDefinition) {

        this.sort.add(sortDefinition);
        return this;

    },

    setTemplate: function(template) {

        this.options.template = template;
        return this;

    },

    filterAlwaysBy: function(key, value) {

        this.filters.filterAlwaysBy(key, value);
        return this;

    },

    filterInitiallyBy: function(key, value) {

        this.filters.filterInitiallyBy(key, value);
        return this;

    },

    handleFilterRequest: function(filterParams) {

        var sortField = this.sort.getSort();
        var urlParams = _.extend({}, filterParams, (sortField ? {sort: sortField} : {}));

        this.navigateWithQueryParams(urlParams);

        this.getApiData({
            filter: filterParams,
            sort: sortField
        }, this.renderItems);

    },

    handleSortRequest: function(sortField) {

        var filterParams = this.filters.getViewFilters();

        this.sort.setSort(sortField);
        this.navigateWithQueryParams(_.extend({}, filterParams, {sort: sortField}));

        this.getApiData({
            filter: filterParams,
            sort: sortField
        }, function() {
            this.scrollTo(0);
            this.renderItems();
        });

    },

    handlePageRequest: function(pageRequestParams) {

        var filterParams = this.filters.getViewFilters();
        var sortField = this.sort.getSort();
        var urlParams = _.extend({}, filterParams, {page: pageRequestParams.page}, (sortField ? {sort: sortField} : {}));
        var pageParams = _.pick(pageRequestParams, 'offset', 'limit');

        this.navigateWithQueryParams(urlParams);

        this.getApiData({
            filter: filterParams,
            page: pageParams,
            sort: sortField
        }, function() {
            this.scrollTo(0);
            this.pagination.setParams(pageParams);
            this.renderItems();
        });

    },

    navigateWithQueryParams: function(queryParams) {

        if (this.options.useUrl) {
            router.navigateToUrl(router.appendQueryParams(this.options.resourceUrl, queryParams));
        }

        return this;

    },

    addMassAction: function(action) {

        if (!this.massActions) {

            this.massActions = this.addView(new MassActions({
                actions: [],
                mapSelectedCaptionsTo: this.options.resourceCaption
            }));

            this.listenTo(this.massActions, 'message', this.renderMessage);

        }

        _.each(_.isArray(action) ? action : [action], function(actionConfig) {
            actionConfig.onComplete = actionConfig.onComplete || this.refreshItems.bind(this);
            this.massActions.addAction(actionConfig);
        }, this);

    },

    addItem: function(Type, options) {

        this.listItemsDefinitions.push({
            Type: Type,
            options: options
        });

        return this;

    },

    getData: function(callback) {

        if (this.options.useUrl) {

            this.getUrlFilteredData(callback);

        } else {

            var filters = this.filters.getViewFilters();
            this.filters.setDefinitionValues(filters);

            this.getApiData({
                filter: filters,
                page: this.pagination.getApiParams(),
                sort: this.sort.getSort()
            }, callback);

        }

    },

    getApiData: function(params, callback) {

        this.loading(true);

        if (!params.page) {
            params.page = this.pagination.getDefaultApiParams();
        }

        if (typeof params.sort === 'undefined') {
            delete params.sort;
        }

        this.apiParams = params;
        this.trigger('setApiParams', params);

        return $.get(this.options.apiUrl, apiFormatter.flatten(params), function(data) {

            this.entityCollection = EntityCollection.createFromApiData(data);
            callback && callback.call(this);

        }.bind(this)).fail(function() {

            this.trigger('apiError', translate('validation.serverError'));

        }.bind(this)).always(function() {

            this.loading(false);

        }.bind(this));

    },

    getUrlFilteredData: function(callback) {

        var filterParams = this.filters.getInitialAndUrlFilters();
        var sortField = this.sort.getUrlSort();

        sortField && this.sort.setSort(sortField);
        this.filters.setDefinitionValues(filterParams);

        return this.getApiData({
            filter: filterParams,
            page: this.pagination.getUrlApiParams(),
            sort: sortField
        }, callback);

    },

    refreshItems: function() {

        return this.getApiData({
            filter: this.filters.getViewFilters(),
            page: this.pagination.getApiParams(),
            sort: this.sort.getSort()
        }, this.renderItems);

    },

    render: function() {

        var template = require('templates/components/resourceList.jst');

        this.$el.html(template.render(this.viewData));
        this.$itemListCont = this.$('.itemListCont');
        this.$topListControls = this.$('.topListControls');
        this.$bottomListControls = this.$('.bottomListControls');
        this.$filtersCont = this.$('.filtersCont');

        if (this.massActions) {
            this.massActions.render().$el.appendTo(this.$topListControls);
            this.$itemListCont.addClass('withMassActions');
        }

        if (this.filters.hasFilters()) {
            this.filters.render().$el.appendTo(this.$filtersCont);
            this.filters.trigger('insertInDom');
        }

        this.pagination.addPaginator('simple').$el.appendTo(this.$topListControls);
        this.pagination.addPaginator('withLimitOptions').$el.appendTo(this.$bottomListControls);

        if (this.sort.hasMultipleSortOptions()) {
            this.sort.createElement().$el.appendTo(this.$topListControls);
            this.sort.createElement().$el.appendTo(this.$bottomListControls);
        }

        this.trigger('beforeRenderItems');
        this.renderItems();
        this.trigger('afterRenderItems');

        return this;

    },

    renderItems: function() {

        this.massActions && this.massActions.removeSelectControls();
        this.removeViews('listItems');
        this.$itemListCont.empty();

        this.$el.toggleClass('withNoItems', this.entityCollection.length === 0);

        if (this.entityCollection.length) {
            this['renderItemsAs' + _.capitalize(this.options.template)]();
        } else {
            this.$itemListCont.html('<p class="noResults">' + translate('baseResource.noResultsMessage') + '</p>');
        }

        // pagination
        this.pagination.setParams({
            totalItems: parseInt(this.entityCollection.apiData.meta.total, 10),
            offset: this.apiParams.page && this.apiParams.page.offset || 0,
            appendParams: _.extend({}, this.apiParams.filter, (this.sort.getSort() ? {sort: this.sort.getSort()} : {}))
        }).renderPaginators();

        return this;

    },

    prepareListItemView: function(entityModel, listItemDefinition) {

        var itemType = listItemDefinition.Type.getType();
        var itemOptions = listItemDefinition.options;
        var listHandler = this;

        if (itemType === 'contextMenu') {

            _.each(itemOptions.items, function(item) {

                if (item.action === 'editItem') {

                    _.extend(item, {
                        url: function(model) {
                            return listHandler.options.editUrl(model.get('id'));
                        },
                        action: function(model) {
                            listHandler.options.openEdit(model.get('id'));
                        }
                    });

                } else if (item.action === 'deleteItem') {

                    item.action = function(model, contextMenu) {

                        contextMenu.close();

                        model.destroy().always(function() {
                            listHandler.refreshItems();
                        });

                    };

                } else if (item.updateAttributes) {

                    item.action = function(model, contextMenu) {

                        contextMenu.close();

                        model.saveOnly({attributes: item.updateAttributes}).always(function() {
                            listHandler.refreshItems();
                        });

                    };

                }

            });

        } else if (itemType === 'link' && itemOptions.action === 'editItem') {

            _.extend(itemOptions, {
                url: function(model) {
                    return listHandler.options.editUrl(model.get('id'));
                },
                action: function(model) {
                    listHandler.options.openEdit(model.get('id'));
                }
            });

        }

        return this.addView(new listItemDefinition.Type({
            entityModel: entityModel,
            options: itemOptions
        }), 'listItems');

    },

    renderItemsAsCards: function() {

        var $cardList = $('<ul class="cardListType1">');

        // card data
        this.entityCollection.each(function(entityModel, i) {

            var $listElement = $('<li>');
            var $cardElement = $('<div class="cardType1">').appendTo($listElement);

            _.each(this.listItemsDefinitions, function(listItemDefinition) {

                var itemView = this.prepareListItemView(entityModel, listItemDefinition);
                itemView.render();
                itemView.$el.appendTo($cardElement);

            }, this);

            if (this.massActions) {
                $cardElement.append(this.massActions.getSelectRowElement({
                    tagName: 'div',
                    className: 'massActionCheckboxControl',
                    model: entityModel
                }));
            }

            $listElement.appendTo($cardList);

        }, this);

        $cardList.appendTo(this.$itemListCont);

    },

    renderItemsAsTable: function() {

        var template = require('templates/partials/resourceListTable.jst');
        var $table = $(template.render());
        var $tableHead = $table.find('thead > tr');
        var $tableBody = $table.find('tbody');

        // table headings

        if (this.massActions) {
            $tableHead.append(this.massActions.getSelectAllElement({
                tagName: 'th',
                className: 'massActionCheckboxHeading'
            }));
        }

        _.each(this.listItemsDefinitions, function(listItemDefinition) {

            $tableHead.append(
                $('<th>')
                    .append(listItemDefinition.options.caption)
                    .addClass(listItemDefinition.Type.prototype.elementType + 'CellHeading')
            );

        }, this);

        // table data
        this.entityCollection.each(function(entityModel, i) {

            var $row = $('<tr>');

            if (this.massActions) {
                $row.append(this.massActions.getSelectRowElement({
                    tagName: 'td',
                    className: 'massActionCheckboxCell',
                    model: entityModel
                }));
            }

            _.each(this.listItemsDefinitions, function(listItemDefinition) {

                var itemView = this.prepareListItemView(entityModel, listItemDefinition);
                itemView.render();

                $('<td>')
                    .addClass(listItemDefinition.Type.prototype.elementType + 'Cell')
                    .toggleClass('hiddenOnMobile', itemView.$el.hasClass('hiddenOnMobile'))
                    .append(itemView.$el)
                    .appendTo($row);

            }, this);

            $row.appendTo($tableBody);

        }, this);

        $table.appendTo(this.$itemListCont);

    },

    getLastState: function() {

        var params = {};

        if (this.apiParams.page) {
            var page = this.apiParams.page.offset / this.apiParams.page.limit + 1;
            page && page > 1 && (params.page = page);
        }

        var filters = this.apiParams.filter;
        filters && !_.isEmpty(filters) && (params.filters = filters);

        var sort = this.apiParams.sort;
        sort && (params.sort = sort);

        return _.isEmpty(params) ? undefined : params;

    },

    renderMessage: function(params) {

        var self = this;

        this.removeViews('messages');

        this.addView(new Message(params.status === 'error' ? {
            content: params.text,
            className: 'messageType1 error',
            closeAfter: false,
            action: function() {
                self.massActions.resetSelectedModels(params.failedModels).updateSelectedRowControls();
            },
            actionCaption: translate('massActions.messageActionCaption')
        }: {
            content: params.text,
            className: 'messageType1',
            closeAfter: 4000,
        }), 'messages').insertAfter(this.$filtersCont);

        return this;

    },

});
