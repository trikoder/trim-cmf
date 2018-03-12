var assert = require('chai').assert;
var $ = require('jquery');
var EntityModel = require('js/library/entity').Model;
var dateListItem = require('js/listElements/date');

var model;

beforeEach(function(done) {

    model = EntityModel.createFromApiData({data: {type: 'article', id: '1', attributes: {title: 'Article title', author: 'Mike Hammer', publishedDate: new Date('2017-04-01T01:10:00').toISOString()}}});
    done();

});

describe('LIST ELEMENT: Date element', function() {

    it('render element content', function() {

        var dateElement = new dateListItem({
            entityModel: model,
            options: {
                mapTo: 'publishedDate'
            }
        });

        dateElement.render();

        assert.equal(dateElement.$el.text(), '01.04.2017');

    });

    it('render element content with different format', function() {

        var dateElement = new dateListItem({
            entityModel: model,
            options: {
                mapTo: 'publishedDate',
                format: 'DD.MM.YY'
            }
        });

        dateElement.render();

        assert.equal(dateElement.$el.text(), '01.04.17');

    });

});
