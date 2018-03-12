var assert = require('chai').assert;
var $ = require('jquery');
var EntityModel = require('js/library/entity').Model;
var BlipListItem = require('js/listElements/blip');

var model;

beforeEach(function(done) {

    model = EntityModel.createFromApiData({data: {type: 'article', id: '1', attributes: {title: 'Article title', author: 'Mike Hammer', published: true}}});
    done();

});

describe('LIST ELEMENT: Blip element', function() {

    it('render element content', function(done) {

        var blipElement = new BlipListItem({
            entityModel: model,
            options: {
                mapTo: 'published'
            }
        });

        blipElement.render();

        assert.equal(blipElement.$el.is('.active'), true);
        done();

    });

    it('mapTo value as function', function(done) {

        var blipElement = new BlipListItem({
            entityModel: model,
            options: {
                mapTo: function(model, context) {
                    return model.get('title') && context.entityModel.get('author');
                }
            }
        });

        blipElement.render();

        assert.equal(blipElement.$el.is('.active'), true);
        done();

    });

    it('render inactive element content', function(done) {

        var blipElement = new BlipListItem({
            entityModel: model,
            options: {
                mapTo: function(model, context) {
                    return false;
                }
            }
        });

        blipElement.render();

        assert.equal(blipElement.$el.is('.active'), false);
        done();

    });

    it('render element with states option', function(done) {

        var blipElement = new BlipListItem({
            entityModel: model,
            options: {
                mapTo: 'published',
                states: [
                    {
                        value: true,
                        caption: 'Article is published',
                        color: 'green'
                    },
                    {
                        value: true,
                        caption: 'Article is not published',
                        color: 'red'
                    }
                ]
            }
        });

        blipElement.render();

        assert.equal(blipElement.$el.css('background-color'), 'green');
        assert.equal(blipElement.$el.attr('title'), 'Article is published');
        done();

    });

});
