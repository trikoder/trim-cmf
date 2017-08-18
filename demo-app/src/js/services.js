module.exports = {
    MainNavigation: function(callback) {
        callback(require('js/mainNavigation').default);
    },
    PageController: function(callback) {
        require.ensure([], function() {
            callback(require('js/controllers/page').default);
        });
    },
    ArticleController: function(callback) {
        require.ensure([], function() {
            callback(require('js/controllers/article').default);
        });
    },
    MediaController: function(callback) {
        require.ensure([], function() {
            callback(require('js/controllers/media').default);
        });
    },
    UserController: function(callback) {
        require.ensure([], function() {
            callback(require('js/controllers/user').default);
        });
    },
    TagController: function(callback) {
        require.ensure([], function() {
            callback(require('js/controllers/tag').default);
        });
    },
    CategoryController: function(callback) {
        require.ensure([], function() {
            callback(require('js/controllers/category').default);
        });
    },
    MySettingsController: function(callback) {
        require.ensure([], function() {
            callback(require('js/controllers/mySettings').default);
        });
    }
};
