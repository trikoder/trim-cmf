var assert = require('chai').assert;
var $ = require('jquery');
var Message = require('js/components/message');

describe('COMPONENT: Message', function() {

    var messageRead = false;

    it('shows message with custom action btn', function(done) {

        var message = new Message({
            closeAfter: 600,
            action: function() {
                messageRead = true;
            }
        });

        message.$el.find('.actionBtn').trigger('click');

        assert.equal(message.$el.length, 1);
        assert.equal(message.$el.find('.actionBtn').length, 1);
        assert.isTrue(messageRead);

        setTimeout(function() {

            assert.equal(message.$el.css('display'), 'none');
            done();

        }, 650)

    });

    it('close message with close btn', function(done) {

        var message = new Message();

        $('<button class="closeBtn"></button>').appendTo(message.$el);

        message.$el.find('.closeBtn').trigger('click');

        setTimeout(function() {

            assert.equal(message.$el.css('display'), 'none');
            done();

        }, 450)

    });

});