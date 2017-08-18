var assert = require('chai').assert;
var Checkbox = require('js/formElements/checkbox');

describe('FORM ELEMENT: checkbox element', function() {

    it('render checkbox', function() {

        var checkbox = new Checkbox();

        checkbox.render();
        assert.equal(checkbox.$el.length, 1);

        checkbox.$el.find('input').click().trigger("change");
        assert.isTrue(checkbox.getValue());

        checkbox.$el.find('input').click().trigger("change");
        assert.isFalse(checkbox.getValue());

    });

});