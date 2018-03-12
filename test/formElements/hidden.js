var assert = require('chai').assert;
var Hidden = require('js/formElements/hidden');

describe('FORM ELEMENT: hidden element', function() {

    it('render hidden element', function() {

        var hidden = new Hidden();

        hidden.render();
        assert.equal(hidden.$el.length, 1);

        hidden.$el.find('input').val('changedValue').trigger('change');
        assert.equal(hidden.getValue(), 'changedValue');

    });

});
