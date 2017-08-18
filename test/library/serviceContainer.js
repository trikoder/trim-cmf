var assert = require('chai').assert;
var serviceContainer = require('js/library/serviceContainer');

describe('Service container', function() {

    it('register services', function() {

        assert.throws(serviceContainer.get, Error, /Service "undefined" is not defined/);

        var services = {
            MainNavigation: function(callback) {
                callback(true);
            }
        };

        serviceContainer.register(services);

        assert.isObject(serviceContainer.get(['MainNavigation']));

    });

    it('register single service', function() {

        serviceContainer.register('AppSearch', function(callback) {
            callback(true);
        });

        assert.isObject(serviceContainer.get(['AppSearch']));

    });


});
