var Backbone = require('backbone');
var _ = require('js/library/underscoreExtensions');
var browserFeatures = require('js/library/browserFeatures');
var serviceContainer = require('js/library/serviceContainer');
var appServices = require('js/appServices');
var bootData = require('js/library/bootData');
var translate = require('js/library/translate');

var routeProvider;
var app = _.extend({}, Backbone.Events);
var mainInstances = {};

serviceContainer.register(appServices);

function setupRouter(Router) {

    var router = new Router({
        usesPushState: bootData('usesPushState', browserFeatures.history),
        root: bootData('baseUrl', '')
    });

    routeProvider && routeProvider(router);

    router.prepareRoutes().on('controllerRequest', function(data) {
        app.setController(data.name, data.method, data.params);
    });

    return router;

}

_.extend(app, {

    start: function() {

        browserFeatures.runTests();

        app.on('selectNavIntent', function(alias) {
            app.get('mainNavigation').setSelected(alias);
        });

        serviceContainer.get(['Router', 'AppView', 'MainNavigation'], function(Router, AppView, MainNavigation) {

            var router = setupRouter(Router);
            app.setInstance('router', router);

            var appView = new AppView({
                MainNavigationType: MainNavigation,
            }).appendTo('body');

            app.setInstance('appView', appView);
            app.setInstance('mainNavigation', appView.mainNavigation);
            app.listenToOnce(appView, 'ready', function() {
                router.start();
            });

        });

    },

    setBootData: function(data) {

        bootData.set(data);
        return this;

    },

    registerServices: function(services) {

        serviceContainer.register(services);
        return this;

    },

    registerRoutes: function(userRouteProvider) {

        routeProvider = userRouteProvider;
        return this;

    },

    setController: function(controllerName, method, params) {

        var appView = app.get('appView');

        appView.loading(true);

        serviceContainer.get(controllerName + 'Controller', function(Controller) {
            appView.loading(false).setController(Controller, method, params);
        });

        return this;

    },

    get: function(key) {

        if (mainInstances[key]) {
            return mainInstances[key];
        } else {
            throw new Error('Application cannot provide: ' + key);
        }

    },

    setInstance: function(key, instance) {

        mainInstances[key] = instance;
        return this;

    },

    setUser: function(userModel) {

        return app.setInstance('user', userModel);

    },

    setLocale: function(locale) {

        translate.setLocale(locale);
        return this;

    },

    getLocale: function() {

        return translate.getLocale();

    },

    loadTranslations: function(items, locale, prefix) {

        translate.add(items, locale, prefix);
        return this;

    }

});

module.exports = app;
