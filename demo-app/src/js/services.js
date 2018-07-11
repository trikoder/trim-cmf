export default {
    MainNavigation: function(callback) {
        callback(require('js/mainNavigation').default);
    },
    AuthController: function(callback) {
        callback(require('js/controllers/auth').default);
    },
    PageController: function(callback) {
        import('js/controllers/page').then(controller => {
            callback(controller.default);
        });
    },
    ArticleController: function(callback) {
        import('js/controllers/article').then(controller => {
            callback(controller.default);
        });
    },
    MediaController: function(callback) {
        import('js/controllers/media').then(controller => {
            callback(controller.default);
        });
    },
    UserController: function(callback) {
        import('js/controllers/user').then(controller => {
            callback(controller.default);
        });
    },
    TagController: function(callback) {
        import('js/controllers/tag').then(controller => {
            callback(controller.default);
        });
    },
    CategoryController: function(callback) {
        import('js/controllers/category').then(controller => {
            callback(controller.default);
        });
    },
    MySettingsController: function(callback) {
        import('js/controllers/mySettings').then(controller => {
            callback(controller.default);
        });
    }
};
