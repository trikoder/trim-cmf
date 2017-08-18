var $ = require('jquery');
var assert = require('chai').assert;
var sinon = require('sinon');
var BaseView = require('backbone-base-view');
var keyboardJS = require('keyboardjs');
var View = require('inject-loader!js/library/view')({
    'js/app': {
        get: function() {
            return {
                navigateToUrl: navigateToUrlCallback
            }
        }
    }
});
var navigateToUrlCallback;

beforeEach(function() {

    sandbox = sinon.sandbox.create();

});

afterEach(function() {

    sandbox.restore();

});

describe('View module', function() {

    it('Set view data', function() {

        var view = new View();

        assert.strictEqual(typeof view.viewData, 'undefined');

        view.setViewData({
            caption: 'The best view',
            description: 'The best view'
        });

        assert.strictEqual(typeof view.viewData, 'object');
        assert.strictEqual(view.viewData.description, 'The best view');

        view.setViewData('additionalNote', 'What does the fox say');

        assert.strictEqual(view.viewData.additionalNote, 'What does the fox say');

    });

    it('Loader helper', function(done) {

        var view = new View();

        view.loading(true);

        assert.strictEqual(BaseView.$loaderTarget.find('.loadingSpinner').length, 1);

        view.loading(false);

        setTimeout(function() {

            assert.strictEqual(BaseView.$loaderTarget.find('.loadingSpinner').length, 0);

            done();

        }, 1);

    });

    it('Local loader helper', function(done) {

        var view = new View();

        view.useLocalLoading(true).loading(true);

        assert.strictEqual(view.$el.find('.loadingSpinnerLocal').length, 1);

        view.loading(false);

        setTimeout(function() {

            assert.strictEqual(view.$el.find('.loadingSpinnerLocal').length, 0);

            view.useLocalLoading(false);

            assert.strictEqual(typeof view.$loader, 'undefined');

            done();

        }, 1);

    });

    it('Add key shortcut adn after remove view key clenup', function(done) {

        var view = new View();

        view.onKeyShortcut('a', function(e) {

            assert.strictEqual(e.pressedKeys[0], 'a');

            done();

        });

        assert.strictEqual(typeof view.onKeyShortcuts['a'].slice(-1).pop(), 'function');

        keyboardJS.pressKey('a');

    });

    it('Remove view with shortcut key clenup', function(done) {

        var view = new View();

        view.onKeyShortcut('a', function(e) {});

        sandbox.stub(keyboardJS, 'off').callsFake(function(shortcut, callback) {

            assert.strictEqual(shortcut, 'a');
            assert.strictEqual(typeof callback, 'function');

            done();

        });

        view.remove();

    });

    it('Follow link method', function(done) {

        var $link = $('<a class="followLink">Link</a>').attr('href', '/');
        var viewWithEvents = View.extend({
            events: {
                'click .followLink': 'followLink'
            }
        });
        var view = new viewWithEvents();

        navigateToUrlCallback = function($item, trigger) {

            assert.strictEqual($item.attr('href'), '/');
            assert.strictEqual(trigger, true);

            done();

        };

        setTimeout(function() {

            $link.appendTo(view.$el);
            $link.trigger('click');

        }, 0);

    });

    it('Scroll to method', function(done) {

        var view = new View();
        var $section = $('<div class="section">Lorem ipsum dolor sit ament.</div>');

        $section.appendTo(view.$el);

        view.scrollTo($section, 200, function() {

            assert.strictEqual(this instanceof View, true);

            done();

        });

    });

});
