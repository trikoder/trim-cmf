var serviceContainer = require('../library/serviceContainer');
var BaseMainNavigation = require('./baseMainNavigation');
var _ = require('underscore');

module.exports = require('../library/view').extend({

    className: 'appContainer',
    assignOptions: true,

    optionRules: {
        MainNavigationType: {validator: function(Type) {
            return Type.prototype instanceof BaseMainNavigation;
        }}
    },

    initialize: function() {

        var MainNavigationType = this.options.MainNavigationType;
        this.mainNavigation = this.addView(new MainNavigationType().appendTo(this));

        this.loading(true).when(this.mainNavigation.renderDeferred, function() {
            _.defer(function() {
                this.loading(false).trigger('ready');
            }.bind(this));
        });

    },

    setController: function(Controller, method, params) {

        if (this.controller) {
            this.controller.remove();
        }

        var ProxyController = Function.prototype.bind.apply(Controller, [null].concat(params));
        var controller = this.controller = this.addView(new ProxyController());
        var appView = this;

        this.listenTo(controller, '404error', function() {

            appView.loading(true);

            serviceContainer.get('ErrorController', function(Controller) {
                appView.loading(false).setController(Controller, 'pageNotFound');
            });

        });

        if (method) {
            controller[method].apply(controller, params);
        }

        controller.appendTo(this);

    }

});
