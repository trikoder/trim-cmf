var assert = require('chai').assert;
var $ = require('jquery');
var EntityModel = require('js/library/entity').Model;
var TextListItem = require('js/listElements/text');

var model;

beforeEach(function(done) {

    model = EntityModel.createFromApiData({data: {type: 'article', id: '1', attributes: {title: 'Article title', author: 'Mike Hammer'}}});
    done();

});

describe('LIST ELEMENT: Text element', function() {

    it('render element content', function(done) {

        var textElement = new TextListItem({
            entityModel: model,
            options: {
                mapTo: 'title'
            }
        });

        textElement.render();

        assert.equal(textElement.$el.text(), 'Article title');
        done();

    });

});
