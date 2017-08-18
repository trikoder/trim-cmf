var assert = require('chai').assert;
var _ = require('js/library/underscoreExtensions');

describe('Underscore Extension', function() {

    it('capitalize string', function() {

        assert.equal(_.capitalize('test'), 'Test');

    });

    it('limit string to first n characters', function() {

        assert.equal(_.limit('Test string'), 'Test string');
        assert.equal(_.limit('String sentence test', 2, '.'), 'St.');
        assert.equal(_.limit('String sentence test', 10), 'String sen...');

    });

    it('limits string to first n words', function() {

        assert.equal(_.words('String sentence test', 2), 'String sentence...');
        assert.equal(_.words('String sentence test'), 'String sentence test');

    });

    it('strip tags', function() {

        assert.equal(_.stripTags('<p>Paragraph<p>'), 'Paragraph');
        assert.equal(_.stripTags('<p><p>'), '');

    });


});

