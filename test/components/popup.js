var assert = require('chai').assert;
var Popup = require('js/components/popup');

describe('COMPONENT: Popup', function() {

    describe('Setup popup', function() {

        it('creates popup', function() {

            var popup = new Popup({
                content: 'This is a popup'
            });

            popup.toggle();
            assert.equal(popup.$el.length, 1);
            assert.equal(popup.options.content, 'This is a popup');
            assert.equal(popup.inDom, true);

        });

        it('has close btn', function() {

            var popup = new Popup({
                removeOnClose: false
            });

            popup.open();
            popup.$el.find('.popupCloseBtn').trigger('click');
            assert.equal(popup.inDom, false);

        });

        it('removes popup on close', function() {

            var popup = new Popup({
                removeOnClose: true
            });

            popup.open();
            popup.toggle();
            assert.equal(popup.inDom, false);

        });

        it('if removeOnClose is popup removes popup', function() {

            var popup = new Popup({
                removeOnClose: new Popup()
            });

            popup.open();
            popup.close();

            assert.equal(popup.inDom, false);

        });

        it('can have another popup as content', function() {

            var popup = new Popup({
                content: new Popup(),
            });

            popup.open();
            assert.isTrue(popup.$el.hasClass('level2'));

        });

    });

    it('has static open method', function() {

        assert.isObject(Popup.open());

    });

});