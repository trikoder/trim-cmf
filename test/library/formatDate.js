var assert = require('chai').assert;
var formatDate = require('js/library/formatDate');

describe('Format date', function() {

    it('formats date', function() {

        var date = new Date(2017,10,20);
        var format = 'DD.MM.YYYY';

        assert.equal(formatDate(date, format), '20.11.2017');

    });

    it('formats date if called with non Date argument', function() {

        var date = 'December 17, 1995 03:24:00';
        var format = 'DD.MM.YYYY';

        assert.equal(formatDate(date, format), '17.12.1995');

    });

    it('returns empty string if arguments are empty', function() {

        assert.equal(formatDate(), '');

    });

});
