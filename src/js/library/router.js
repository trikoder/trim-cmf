var _ = require('underscore');
var Backbone = require('backbone');
var RouterParent = require('backbone-named-routes');
var routeRegistry = [];
var queryString = require('query-string');
var camelcase = require('to-case').camel;
var slugcase = require('to-case').slug;
var pascalcase = require('to-case').pascal;
var apiFormatter = require('js/library/apiFormatter');

module.exports = RouterParent.extend({

    resourceRoutePrefix: undefined,

    route: function(routingString, name, callback) {

        if (typeof callback !== 'function') {

            var params = callback,
                self = this,
                temp = params.uses.split('@');

            callback = function() {

                self.trigger('controllerRequest', {
                    name: temp[0],
                    method: temp.length > 1 ? temp[1] : undefined,
                    params: _.toArray(arguments)
                });

            };
        }

        routeRegistry.push({
            routingString: routingString,
            name: name,
            callback: callback
        });

    },

    resource: function(fragment, name, controller) {

        if (!name) {
            name = camelcase(fragment);
        }

        if (!controller) {
            controller = pascalcase(name);
        }

        var routePrefix = this.resourceRoutePrefix ? this.resourceRoutePrefix + '/' : '';
        var urlFragment = slugcase(fragment);

        this.route(routePrefix + urlFragment + '/create', 'resource.' + name + '.create', {uses: controller + '@create'});
        this.route(routePrefix + urlFragment + '/:id', 'resource.' + name + '.edit', {uses: controller + '@edit'});
        this.route(routePrefix + urlFragment, 'resource.' + name + '.index', {uses: controller + '@index'});

        return this;

    },

    prepareRoutes: function() {

        _.each(routeRegistry.reverse(), function(item) {
            RouterParent.prototype.route.call(this, item.routingString, item.name, item.callback);
        }, this);

        return this;

    },

    start: function() {

        Backbone.history.start(this.getHistoryStartParams());

        return this;

    },

    getQueryParam: function(key) {

        var source = this.options.usesPushState ? window.location.search : window.location.hash.replace(/.*[?]/, '');
        var obj = queryString.parse(source);

        return obj && key ? obj[key] : obj;

    },

    appendQueryParams: function(base, queryParams) {

        if (!_.isEmpty(queryParams)) {
            return base + (base.indexOf('?') < 0 ? '?' : '') + queryString.stringify(queryParams);
        } else {
            return base;
        }

    },

    apiUrl: function(resourceName, resourceId, queryParams) {

        var url = this.options.root + 'api/' + slugcase(resourceName);

        if (resourceId !== null && typeof resourceId !== 'undefined') {
            url += ('/' + resourceId);
        }

        return this.appendQueryParams(url, apiFormatter.flatten(_.pick(queryParams, 'page', 'filter', 'sort')));

    }

});
