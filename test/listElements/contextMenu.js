var assert = require('chai').assert;
var $ = require('jquery');
var EntityModel = require('js/library/entity').Model;
var ContextMenu = require('js/listElements/contextMenu');

beforeEach(function(done) {

    articleModel = EntityModel.createFromApiData({data: {type: 'article', id: '1', attributes: {title: 'Article title', author: 'Mike Hammer', published: true}}});
    done();

});

describe('LIST ELEMENT: Context menu element', function() {

    it('render element content', function() {

        var items = [
            {caption: 'Edit', action: 'editItem', className: 'editTypeButton'},
            {caption: 'Open documentation', url: 'http://www.google.com', className: 'followTypeButton'},
            {caption: 'Delete', action: 'deleteItem', confirm: true, className: 'deleteTypeButton'}
        ];
        var contextMenuElement = new ContextMenu({
            caption: 'Actions',
            options: {
                items: items
            }
        });

        contextMenuElement.render();

        assert.equal(contextMenuElement.$el.find('.toggleContextMenu').length, 1);

        contextMenuElement.$el.find('li > *').each(function(index, item) {

            assert.equal($(item).text() === items[index].caption, true);
            assert.equal(item.className.search(items[index].className) > -1, true);

        });

    });

    it('open and close event on element', function() {

        var contextMenuElement = new ContextMenu({
            caption: 'Actions',
            options: {
                items: [{caption: 'Edit', action: 'editItem'}]
            }
        });

        contextMenuElement.render();

        contextMenuElement.$el.find('.toggleContextMenu').trigger('click');

        assert.equal(contextMenuElement.$el.is('.active'), true);

        contextMenuElement.$el.find('.toggleContextMenu').trigger('click');

        assert.equal(contextMenuElement.$el.is('.active'), false);

    });

    it('custom action event', function(done) {

        var contextMenuElement = new ContextMenu({
            caption: 'Actions',
            entityModel: articleModel,
            options: {
                items: [
                    {
                        caption: 'Edit',
                        action: function(model, context) {
                            assert.equal(model.get('id') === articleModel.get('id'), true);
                            assert.equal(context.entityModel.get('id') === articleModel.get('id'), true);
                            done();
                        },
                        className: 'editTypeButton'
                    }
                ]
            }
        });

        contextMenuElement.render();

        contextMenuElement.$el.find('.editTypeButton').trigger('click');

    });

    it('confirm action event', function(done) {

        var contextMenuElement = new ContextMenu({
            caption: 'Actions',
            entityModel: articleModel,
            options: {
                items: [
                    {
                        caption: 'Edit',
                        confirm: true,
                        action: function(model, context) {
                            assert.equal(model.get('id') === articleModel.get('id'), true);
                            assert.equal(context.entityModel.get('id') === articleModel.get('id'), true);
                            done();
                        },
                        className: 'editTypeButton'
                    }
                ]
            }
        });

        contextMenuElement.render();

        contextMenuElement.$el.find('.editTypeButton').trigger('click');

        setTimeout(function() {

            $('.prompt_box:first .accept').trigger('click');

        }, 100);

    });

    it('confirm action with custom message event', function(done) {

        var message = 'Are you sure sure?';
        var contextMenuElement = new ContextMenu({
            caption: 'Actions',
            entityModel: articleModel,
            options: {
                items: [
                    {
                        caption: 'Edit',
                        confirm: message,
                        action: function(model, context) {},
                        className: 'editTypeButton'
                    }
                ]
            }
        });

        contextMenuElement.render();

        contextMenuElement.$el.find('.editTypeButton').trigger('click');

        setTimeout(function() {

            assert.equal($('.prompt_box:first .message').html(), message);
            done();

        }, 100);

    });

    it('render item with custom url', function() {

        var contextMenuElement = new ContextMenu({
            caption: 'Actions',
            entityModel: articleModel,
            options: {
                items: [
                    {
                        caption: 'Edit',
                        url: function(model, context) {
                            return '/' + model.get('type') + '/' + context.entityModel.get('id');
                        },
                        className: 'editTypeButton'
                    }
                ]
            }
        });

        contextMenuElement.render();

        assert.equal(contextMenuElement.$el.find('.editTypeButton').attr('href'), '/' + articleModel.get('type') + '/' + articleModel.get('id'));

    });

    it('render item only if condition is met', function() {

        var contextMenuElement = new ContextMenu({
            caption: 'Actions',
            entityModel: articleModel,
            options: {
                items: [
                    {
                        caption: 'Edit',
                        showIf: function(model, context) {
                            return model.get('id') !== context.entityModel.get('id');
                        },
                        url: function(model, context) {
                            return '/' + model.get('type') + '/' + context.entityModel.get('id');
                        },
                        className: 'editTypeButton'
                    }
                ]
            }
        });

        contextMenuElement.render();

        assert.equal(contextMenuElement.$el.find('.editTypeButton').length, 0);

    });

});
