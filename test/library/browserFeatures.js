var assert = require('chai').assert;
var browserFeatures = require('js/library/browserFeatures');
var $ = require('jquery');

browserFeatures.runTests();

describe('Browser features', function() {

    it('sets internal flag and html classes for defined tests', function() {

        browserFeatures.setFeature('supportsMyFeature', true);
        browserFeatures.setFeature('supportsMyOtherFeature', false);

        assert.isTrue($('html').hasClass('supportsMyFeature'));
        assert.isTrue($('html').hasClass('no-supportsMyOtherFeature'));

        assert.isTrue(browserFeatures.supportsMyFeature);
        assert.isFalse(browserFeatures.supportsMyOtherFeature);

    });

});
