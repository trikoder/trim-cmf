var store = {};
var _ = require('underscore');

function bootData(key, defaultValue) {

    var pieces = key.split('.');
    var haystack = store;

    for (var i in pieces) {

        haystack = haystack[pieces[i]];

        if (typeof haystack === 'undefined') {
            return defaultValue;
        }
    }

    return haystack;
}

bootData.set = function(data) {

    _.extend(store, data);
    return this;

};

module.exports = bootData;
