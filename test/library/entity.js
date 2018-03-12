var assert = require('chai').assert;
var Entity = require('inject-loader!js/library/entity')({
    'js/app': {
        get: function() {
            return {
                apiUrl: function(resourceName, resourceId, params) {

                    if (typeof resourceId === 'undefined' && typeof params === 'undefined') {

                        return '/api/' + resourceName;

                    } else if (typeof params === 'undefined') {

                        return '/api/' + resourceName + '/' + resourceId;

                    } else {

                        return '/api/' + resourceName + '?' + params;

                    }

                }
            }
        }
    }
});

describe('Entity module', function() {

    it('Model extended methods', function() {

        var model = Entity.Model.create().setType('article');

        assert.equal(model.urlRoot(), '/api/article');

        assert.equal(Entity.Model.apiUrl('tag', '1'), '/api/tag/1');

    });

    it('Collection extended methods', function() {

        assert.equal(Entity.Collection.apiUrl('tag', 'filter=old'), '/api/tag?filter=old');

    });

});
