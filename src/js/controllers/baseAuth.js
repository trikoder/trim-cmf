var BaseView = require('../library/view');
var template = require('../../templates/controllers/auth.jst');
var $ = require('jquery');
var app = require('../app');
var translate = require('../library/translate');

var BaseAuth = BaseView.extend({

    className: 'loginCont',

    assignOptions: true,

    optionRules: {
        beforeAppStart: {
            type: Function,
            default: function() {
                return function(done) { done(); };
            }
        },
    },

    events: {
        'submit form': function(e) {

            e.preventDefault();
            this.submitForm();

        }
    },

    submitForm: function() {

        var self = this;
        var username = this.$('.username').val();
        var password = this.$('.password').val();

        if (!this.submitInProgress) {

            this.submitInProgress = true;

            this.render({
                username: username,
                password: password,
                buttonCaption: translate('auth.loadingCaption')
            });

            this.constructor.loginWithCredentials({
                username: username,
                password: password
            }, function() {

                self.constructor.afterAuth(function() {
                    self.options.beforeAppStart(function() {
                        self.submitInProgress = false;
                        self.constructor.afterLogin();
                    });
                });

            }, function(errorMessage) {

                self.render({
                    errorMessage: errorMessage,
                    username: username,
                    password: password
                });

                self.submitInProgress = false;

            });

        }

    },

    initialize: function() {

        window.document.title = translate('auth.formTitle');

        this.constructor.navigateToAuthUrl(false);

        this.render();

    },

    render: function(data) {

        this.$el.html(template.render($.extend({
            title: translate('auth.formTitle'),
            username: '',
            password: '',
            usernameCaption: translate('auth.username'),
            passwordCaption: translate('auth.password'),
            buttonCaption: translate('auth.loginButtonCaption')
        }, data)));

    }

}, {

    loginWithCredentials: function(credentials, done, fail) {

        throw new Error('Method "loginWithCredentials" not implemented on Auth controller');

    },

    afterAuth: function(done) {

        done();

    },

    checkAuthState: function(onComplete) {

        throw new Error('Method "checkAuthState" not implemented on Auth controller');

    },

    getAuthUrl: function() {

        throw new Error('Method "getAuthUrl" not implemented on Auth controller');

    },

    navigateToAuthUrl: function(triggerRouteHandler) {

        var router = app.get('router');
        router.navigateToUrl(this.getAuthUrl(router), triggerRouteHandler);

        return this;

    },

    afterLogin: function() {

        var router = app.get('router');
        router.navigateToUrl('/', true);

        return this;

    },

    logout: function() {

        throw new Error('Method "logout" not implemented on Auth controller');

    }

});

module.exports = BaseAuth;
