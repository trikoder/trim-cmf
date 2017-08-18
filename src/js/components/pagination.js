var router = require('js/app').get('router');
var userPreferences = require('js/library/userPreferences');
var translate = require('js/library/translate');
var _ = require('underscore');
var $ = require('jquery');

var Pagination = require('js/library/view').extend({

    tagName: 'nav',
    className: 'pagination',

    defaults: {
        baseUrl: null,
        useLinks: true,
        limit: undefined,
        limitOptions: [10, 15, 30, 60],
        offset: 0,
        totalItems: 0,
        appendParams: {},
        preferenceKey: 'pagination.itemsPerPage',
        template: 'simple'
    },

    initialize: function(options) {

        this.options = _.extend({}, this.defaults, options);
        this.options.limit = this.options.limit || userPreferences.get(this.options.preferenceKey, 15);

        this.templates = {
            simple: require('templates/components/paginationSimple.jst'),
            withLimitOptions: require('templates/components/paginationStandard.jst')
        };

    },

    events: {
        'click .page': function(e) {

            e.preventDefault();

            var $control = $(e.currentTarget);
            var page = parseInt($control.text(), 10);

            if (!$control.hasClass('selected')) {

                this.trigger('pageRequest', {
                    page: page,
                    offset: (page - 1) * this.options.limit,
                    limit: this.options.limit
                });

            }

        },

        'click .limitOption': function(e) {

            e.preventDefault();

            var $control = $(e.currentTarget);
            var limit = parseInt($control.text(), 10);

            if (!$control.hasClass('selected')) {

                userPreferences.set(this.options.preferenceKey, limit);

                this.trigger('pageRequest', {
                    page: 1,
                    offset: 0,
                    limit: limit
                });

            }

        }
    },

    getUrlApiParams: function() {

        var page = router.getQueryParam('page');

        if (page) {
            return {
                offset: (parseInt(page, 10) - 1) * this.options.limit,
                limit: this.options.limit
            };
        } else {
            return this.getDefaultApiParams();
        }

    },

    getApiParams: function() {

        return {
            offset: this.options.offset,
            limit: this.options.limit
        };

    },

    getDefaultApiParams: function() {

        return {
            offset: 0,
            limit: this.options.limit
        };

    },

    addPaginator: function(template) {

        var options = _.extend({}, this.options, {template: template || 'simple'});
        var paginatorView = this.addView(new Pagination(options), 'paginators');

        this.listenTo(paginatorView, 'pageRequest', function(data) {
            this.trigger('pageRequest', data);
        });

        return paginatorView;

    },

    renderPaginators: function(params) {

        _.invoke(this.getGroupViews('paginators'), 'render');

        return this;

    },

    setPage: function(page) {

        this.setParams({
            offset: (parseInt(page, 10) - 1) * this.options.limit
        });

    },

    setParams: function(params) {

        this.options = _.extend(this.options, params);

        _.each(this.getGroupViews('paginators'), function(view) {
            view.setParams(params);
        });

        return this;

    },

    prepareViewData: function() {

        var options = this.options;

        var totalPages = Math.ceil(options.totalItems / options.limit);
        var currentPage = Math.floor(options.offset / options.limit) + 1;

        var startPage = currentPage - 2;
        var endPage = currentPage + 2;

        if (startPage <= 0) {
            endPage -= (startPage - 1);
            startPage = 1;
        }

        if (endPage > totalPages) {
            endPage = totalPages;
        }

        return {
            resultsCaption: translate('pagination.resultsCaption'),
            totalPages: totalPages,
            currentPage: currentPage,
            middlePages: _.range(startPage, endPage + 1),
            endPage: endPage,
            useLinks: options.useLinks,
            url: this.generateUrl.bind(this),
            limitOptions: _.map(options.limitOptions, function(limit) {
                return {value: limit, selected: limit === options.limit};
            })
        };

    },

    generateUrl: function(page) {

        var pageParams = page > 1 ? {page: page} : {};
        var queryParams = _.extend({}, this.options.appendParams, pageParams);

        return router.appendQueryParams(this.options.baseUrl, queryParams);

    },

    render: function() {

        this.$el.html(this.templates[this.options.template].render(this.prepareViewData()));
        this.$el.addClass(this.options.template);

    }

});

module.exports = Pagination;
