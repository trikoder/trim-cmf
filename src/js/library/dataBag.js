var _ = require('underscore');

function DataBag(data) {
    this.store = _.extend({}, data);
}

_.extend(DataBag.prototype, {

    get: function(key, defaultValue) {

        var pieces = key.split('.');
        var haystack = this.store;

        for (var i in pieces) {

            haystack = haystack[pieces[i]];

            if (typeof haystack === 'undefined') {
                return defaultValue;
            }
        }

        return haystack;

    },

    set: function(data) {

        _.extend(this.store, data);
        return this;

    }

});

module.exports = DataBag;
