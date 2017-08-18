var assert = require('chai').assert;
//var Html = require('js/formElements/html');

describe('FORM ELEMENT: html element', function() {

    it.skip('render html', function() {

        var html = new Html();

        html.render();
        html.rerender();

        assert.equal(html.$el.length, 1);

        html.remove();

    });

});