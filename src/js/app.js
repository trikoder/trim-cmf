var Backbone = require('backbone');
var _ = require('./library/underscoreExtensions');
var browserFeatures = require('./library/browserFeatures');
var serviceContainer = require('./library/serviceContainer');
var appServices = require('./appServices');
var bootData = require('./library/bootData');
var translate = require('./library/translate');

var beforeAppStart = function(done) { done(); };
var usesAuthController = false;
var routeProvider;

var app = _.extend({}, Backbone.Events);
var mainInstances = {};

serviceContainer.register(appServices);

function setupRouter(Router) {

    var router = new Router({
        usesPushState: bootData('usesPushState', browserFeatures.history),
        root: bootData('baseUrl', ''),
        apiRoot: bootData('baseApiUrl')
    });

    routeProvider && routeProvider(router);

    router.prepareRoutes().on('controllerRequest', function(data) {
        app.setController(data.name, data.method, data.params);
    });

    return router;

}

function setupAppView(done) {

    if (mainInstances.appView) {
        done(mainInstances.appView);
        return;
    }

    serviceContainer.get(['AppView', 'MainNavigation'], function(AppView, MainNavigation) {

        var appView = new AppView({
            MainNavigationType: MainNavigation,
        }).prependTo('body');

        var mainNavigation = appView.mainNavigation;

        appView.listenTo(app, 'selectNavIntent', function(alias) {
            mainNavigation.setSelected(alias);
        });

        app.setInstance('appView', appView);
        app.setInstance('mainNavigation', mainNavigation);

        appView.once('ready', function() {
            done(appView);
        });

    });

}

_.extend(app, {

    start: function() {

        browserFeatures.runTests();

        var services = usesAuthController ? ['Router', usesAuthController + 'Controller'] : ['Router'];

        serviceContainer.get(services, function(Router, AuthController) {

            var router = setupRouter(Router);
            app.setInstance('router', router);

            if (usesAuthController) {

                AuthController.checkAuthState(function(userIsAuthorized) {
                    userIsAuthorized ? AuthController.afterAuth(function() {
                        beforeAppStart(function() { router.start(); });
                    }) : router.start();
                });

            } else {
                beforeAppStart(function() { router.start(); });
            }

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

        function renderAppView() {

            if (mainInstances.authView) {
                mainInstances.authView.remove();
                app.setInstance('authView', undefined);
            }

            setupAppView(function(appView) {

                appView.loading(true);

                serviceContainer.get(controllerName + 'Controller', function(Controller) {
                    appView.loading(false).setController(Controller, method, params);
                });

            });

        }

        function renderAuthView() {

            if (mainInstances.appView) {

                mainInstances.appView.remove();
                app.setInstance('appView', undefined);
                app.setInstance('mainNavigation', undefined);

            }

            if (mainInstances.authView) {
                return;
            }

            serviceContainer.get(usesAuthController + 'Controller', function(AuthController) {

                var authView = new AuthController({
                    beforeAppStart: beforeAppStart
                }).prependTo('body');

                app.setInstance('authView', authView);

            });

        }

        if (usesAuthController) {

            serviceContainer.get(usesAuthController + 'Controller', function(AuthController) {

                if (usesAuthController === controllerName) {

                    renderAuthView();

                } else {

                    AuthController.checkAuthState(function(userIsAuthorized) {
                        userIsAuthorized ? renderAppView() : renderAuthView();
                    });

                }

            });

        } else {

            renderAppView();

        }

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

    },

    beforeAppStart: function(callback) {

        beforeAppStart = callback;
        return this;

    },

    useAuthController: function(name) {

        usesAuthController = name;
        return this;

    }

});

module.exports = app;
