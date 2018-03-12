var assert = require('chai').assert;
var translate = require('js/library/translate');

describe('Translate', function() {

    it('exoports translate-js library', function() {

        assert.isFunction(translate);

    });

});
