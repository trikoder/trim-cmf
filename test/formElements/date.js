var assert = require('chai').assert;
var Date = require('js/formElements/date');

describe('FORM ELEMENT: date element', function() {

    it('render date', function() {

        var date = new Date();

        date.render();
        assert.equal(date.$el.length, 1);

        date.$el.find('input').val('01.01.2017').trigger('change');
        assert.equal(date.getValue(), '2017-01-01');

        date.rerender();
        assert.equal(date.$el.length, 1);

        date.$el.find('input').val('').trigger('change');
        assert.equal(date.getValue(), '');

        date.remove();

        //unregister events
        date.$el.find('input').val('01.01.2020').trigger('change');
        assert.equal(date.getValue(), '');

    });

});