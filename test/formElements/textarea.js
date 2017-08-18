var assert = require('chai').assert;
var Textarea = require('js/formElements/textarea');

describe('FORM ELEMENT: textarea element', function() {

    it('render textarea element', function() {

        var textarea = new Textarea({
            options:{
                trimOnPaste: false
            }
        });

        textarea.render();
        assert.equal(textarea.$el.length, 1);
        assert.equal(textarea.$el.find('.textareaAutoHeight').length, 1);

        textarea.$el.find('textarea').val('changedValue').trigger('change');
        assert.equal(textarea.getValue(), 'changedValue');

    });

    it('trim string on paste', function(done) {

        var textareaTrim = new Textarea();

        textareaTrim.render();
        textareaTrim.$el.find('textarea').val('   Trim test   ').trigger('paste');

        setTimeout(function() {

            assert.equal(textareaTrim.getValue(), 'Trim test');
            done();

        }, 50)

    });

});