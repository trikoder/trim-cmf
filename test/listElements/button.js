var assert = require('chai').assert;
var $ = require('jquery');
var EntityModel = require('js/library/entity').Model;
var ButtonListItem = require('js/listElements/button');

var model;

beforeEach(function(done) {

    model = EntityModel.createFromApiData({data: {type: 'article', id: '1', attributes: {title: 'Article title', author: 'Mike Hammer'}}});
    done();

});

describe('LIST ELEMENT: Button element', function() {

    it('render element content', function(done) {

        var buttonElement = new ButtonListItem({
            entityModel: model,
            options: {
                mapTo: 'author'
            }
        });

        buttonElement.render();

        assert.equal(buttonElement.$el.is('button'), true);
        assert.equal(buttonElement.$el.is('.listElementButton'), true);
        assert.equal(buttonElement.$el.text(), 'Mike Hammer');
        done();

    });

    it('event with custom action', function(done) {

        var buttonElement = new ButtonListItem({
            entityModel: model,
            options: {
                mapTo: 'title',
                action: function(model) {
                    assert.equal(model.get('title'), 'Article title');
                    done();
                }
            }
        });

        buttonElement.render();
        buttonElement.$el.trigger('click');

    });

});
