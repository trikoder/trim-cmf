var $ = require('jquery');
var _ = require('underscore');
var registry = {};

function getOne(serviceName) {

    var deferred = $.Deferred();

    if (typeof registry[serviceName] === 'undefined') {
        throw new Error('Service "' + serviceName + '" is not defined');
    }

    registry[serviceName](function(registryItem) {
        deferred.resolve(registryItem);
    });

    return deferred;
}

module.exports = {

    get: function(serviceName, doneCallback, failCallback) {

        var serviceDeferreds = _.map(_.isArray(serviceName) ? serviceName : [serviceName], function(service) {
            return getOne(service);
        });

        return $.when.apply(this, serviceDeferreds).done(doneCallback).fail(failCallback);

    },

    register: function(serviceName, handler) {

        if (handler) {
            registry[serviceName] = handler;
        } else {
            _.each(serviceName, function(serviceHandler, serviceKey) {
                registry[serviceKey] = serviceHandler;
            });
        }

    }

};
