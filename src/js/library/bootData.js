var _ = require('underscore');
var DataBag = require('./dataBag');

var store = new DataBag();

module.exports = _.extend(function(key, defaultValue) {
    return store.get(key, defaultValue);
}, {
    set: function(data) {
        store.set(data);
        return this;
    }
});
