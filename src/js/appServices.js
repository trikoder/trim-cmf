module.exports = {
    Router: function(callback) {
        callback(require('js/library/router'));
    },
    AppView: function(callback) {
        callback(require('js/components/appView'));
    },
    MainNavigation: function(callback) {
        callback(require('js/components/baseMainNavigation'));
    },
    AppSearch: function(callback) {
        require.ensure([], function() {
            callback(require('js/components/appSearch'));
        });
    },
    ErrorController: function(callback) {
        require.ensure([], function() {
            callback(require('js/controllers/error'));
        });
    }
};
