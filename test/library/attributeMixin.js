var assert = require('chai').assert;
var attributeMixin = require('js/library/attributeMixin');
var $ = require('jquery');

describe('Attribute mixin', function() {

    it('sets and retrieves simple attributes', function() {

        var obj = attributeMixin({});
        obj.setAttribute('title', 'Test title');
        obj.setAttribute({
            alt: 'Alt title',
            placeholder: 'Test placeholder'
        });
        assert.strictEqual(obj.getAttribute('title'), 'Test title');
        assert.strictEqual(obj.getAttribute('alt'), 'Alt title');
        assert.strictEqual(obj.getAttribute('placeholder'), 'Test placeholder');
        assert.strictEqual(obj.getAttribute('title2'), undefined);

    });

    it('adds attribute values', function() {

        var obj = attributeMixin({});
        obj.setAttribute('class', 'class1');
        obj.addAttribute('class', 'class2');
        obj.addAttribute({'class': 'class3'});
        assert.strictEqual(obj.getAttribute('class'), 'class1 class2 class3');

    });

    it('checks if attribute is present', function() {

        var obj = attributeMixin({});
        obj.setAttribute('class', 'class1');
        assert.strictEqual(obj.hasAttribute('class'), true);
        assert.strictEqual(obj.hasAttribute('title'), false);

    });

    it('removes attributes', function() {

        var obj = attributeMixin({});
        obj.setAttribute('class', 'class1').removeAttribute('class');
        assert.strictEqual(obj.hasAttribute('class'), false);

    });

    it('adds and sets class ', function() {

        var obj = attributeMixin({});
        obj.addClass('class1 class2').addClass('class3');
        assert.strictEqual(obj.getAttribute('class'), 'class1 class2 class3');

        obj.setClass('class4');
        assert.strictEqual(obj.getAttribute('class'), 'class4');

    });

    it('renders attributes', function() {

        var obj = attributeMixin({});
        var $el = $('<div />');

        obj.addAttribute('className', 'class1 class2');
        obj.setAttribute('title', 'Test title');
        obj.renderAttributes($el);

        assert.strictEqual($el.attr('class'), 'class1 class2');
        assert.strictEqual($el.attr('title'), 'Test title');
        assert.strictEqual(obj.renderAttributes(), 'class="class1 class2" title="Test title"');

        var obj = attributeMixin({});
        assert.strictEqual(obj.renderAttributes(), '');

    });

});
