var assert = require('chai').assert;
var Text = require('js/formElements/text');

describe('FORM ELEMENT: text element', function() {

    it('render text element', function() {

        var text = new Text();

        text.render();
        assert.equal(text.$el.length, 1);

        text.$el.find('input').val('changedValue').trigger('change');
        assert.equal(text.getValue(), 'changedValue');

    });

});