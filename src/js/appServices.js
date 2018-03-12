module.exports = {
    Router: function(callback) {
        callback(require('./library/router'));
    },
    AppView: function(callback) {
        callback(require('./components/appView'));
    },
    MainNavigation: function(callback) {
        callback(require('./components/baseMainNavigation'));
    },
    AppSearch: function(callback) {
        require.ensure([], function() {
            callback(require('./components/appSearch'));
        });
    },
    ErrorController: function(callback) {
        require.ensure([], function() {
            callback(require('./controllers/error'));
        });
    }
};
