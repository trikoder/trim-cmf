var assert = require('chai').assert;
var DateTime = require('js/formElements/dateTime');

describe('FORM ELEMENT: dateTime element', function() {

    it('render dateTime', function() {

        var dateTime = new DateTime();

        dateTime.render();
        assert.equal(dateTime.$el.length, 1);
        assert.equal(dateTime.getValue(), null);
        assert.isObject(dateTime.simplecal);

        dateTime.$el.find('input').val('01.01.2017 12:00').trigger('change');
        assert.equal(dateTime.getValue(), '2017-01-01T11:00:00.000Z');

        dateTime.rerender();
        assert.equal(dateTime.$el.length, 1);

        dateTime.$el.find('input').val('').trigger('change');
        assert.equal(dateTime.getValue(), null);

        dateTime.remove();

        //unregister events
        dateTime.$el.find('input').val('01.01.2020 12:00').trigger('change');
        assert.equal(dateTime.getValue(), null);

    });

});