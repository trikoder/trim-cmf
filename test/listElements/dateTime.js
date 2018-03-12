var assert = require('chai').assert;
var $ = require('jquery');
var EntityModel = require('js/library/entity').Model;
var dateTimeListItem = require('js/listElements/dateTime');

var model;

beforeEach(function(done) {

    model = EntityModel.createFromApiData({data: {type: 'article', id: '1', attributes: {title: 'Article title', author: 'Mike Hammer', publishedDate: new Date('2017-04-01T01:10:00').toISOString()}}});
    done();

});

describe('LIST ELEMENT: Date time element', function() {

    it('render element content', function() {

        var dateTimeElement = new dateTimeListItem({
            entityModel: model,
            options: {
                mapTo: 'publishedDate'
            }
        });

        dateTimeElement.render();

        assert.equal(dateTimeElement.$el.text(), '01.04.2017 03:10');

    });

    it('render element content with different format', function() {

        var dateTimeElement = new dateTimeListItem({
            entityModel: model,
            options: {
                mapTo: 'publishedDate',
                format: 'DD.MM.YY HH:mm'
            }
        });

        dateTimeElement.render();

        assert.equal(dateTimeElement.$el.text(), '01.04.17 03:10');

    });

});
