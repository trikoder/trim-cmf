var assert = require('chai').assert;
var apiFormatter = require('js/library/apiFormatter');

describe('Api formatter', function() {

    it('flattens parameters', function() {

        assert.deepEqual(apiFormatter.flatten({
            filter: {title: 'test', published: true},
            page: 1}
        ), {
            'filter[title]': 'test',
            'filter[published]': true,
            page: 1
        });

    });

});
