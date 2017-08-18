var assert = require('chai').assert;
var $ = require('jquery');
var EntityModel = require('js/library/entity').Model;
var LinkListItem = require('inject-loader!js/listElements/link')({
    'js/app': {
        get: function() {
            return {
                navigateToUrl: navigateToUrlCallback
            }
        }
    }
});
var navigateToUrlCallback;
var model;

beforeEach(function(done) {

    model = EntityModel.createFromApiData({data: {type: 'article', id: '1', attributes: {title: 'Article title', safeName: 'article-title', author: 'Mike Hammer'}}});
    done();

});

describe('LIST ELEMENT: Link element', function() {

    it('render element content', function() {

        var linkElement = new LinkListItem({
            entityModel: model,
            options: {
                mapTo: 'title',
                url: function(model, context) {
                    return '/article/' + model.get('safeName') + '-' + context.entityModel.get('id')
                }
            }
        });

        linkElement.render();

        assert.equal(linkElement.$el.attr('href'), '/article/article-title-1');
        assert.equal(linkElement.$el.text(), 'Article title');

    });

    it('link element event with app route', function(done) {

        var linkElement = new LinkListItem({
            entityModel: model,
            options: {
                mapTo: 'title',
                url: function(model, context) {
                    return '/article/' + model.get('safeName') + '-' + context.entityModel.get('id')
                }
            }
        });

        linkElement.render();

        navigateToUrlCallback = function(url, option) {
            assert.equal(url,'/article/' + model.get('safeName') + '-' + model.get('id'));
            assert.equal(option, true);
            done();
        };

        linkElement.$el.trigger('click');

    });

    it('link element event with custom action', function(done) {

        var linkElement = new LinkListItem({
            entityModel: model,
            options: {
                mapTo: 'title',
                url: function(model, context) {
                    return '/article/' + model.get('safeName') + '-' + context.entityModel.get('id')
                },
                action: function(model) {
                    assert.equal(model.get('id'), '1');
                    done();
                }
            }
        });

        linkElement.$el.trigger('click');

    });

});
