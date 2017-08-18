var assert = require('chai').assert;
var ckeditor = require('js/components/ckeditor');
var locale = require('js/app').getLocale();

describe('COMPONENT: Ckeditor', function() {

    it('setup ckeditor', function() {

        assert.isObject(ckeditor);
        assert.equal(ckeditor.config.defaultLanguage, locale);
        assert.equal(ckeditor.config.language, locale);

    });

});