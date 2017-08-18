var assert = require('chai').assert;
var userPreferences = require('js/library/userPreferences');

describe('User preferences', function() {

    it('sets and retirieves preference data', function() {

        userPreferences.set('paginationItems', 10).set({
            preferedCategory: 'News'
        });

        assert.strictEqual(userPreferences.get('paginationItems'), 10);
        assert.strictEqual(userPreferences.get('preferedCategory'), 'News');
        assert.isUndefined(userPreferences.get('uknownPreference'));
        assert.strictEqual(userPreferences.get('uknownPreference', 'test'), 'test');

    });

});
