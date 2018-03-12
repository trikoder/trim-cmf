var _ = require('underscore');
var storageKey = 'userPreferences';
var storageData = localStorage.getItem(storageKey);
var preferenceData = storageData ? JSON.parse(storageData) : {};

module.exports = {

    get: function(key, defaultValue) {

        var data = preferenceData[key];
        return typeof data !== 'undefined' ? data : defaultValue;

    },

    set: function(key, value) {

        var params = _.isObject(key) ? key : _.object([key], [value]);

        _.each(params, function(paramValue, paramKey) {
            preferenceData[paramKey] = paramValue;
        });

        localStorage.setItem(storageKey, JSON.stringify(preferenceData));

        return this;

    }

};
