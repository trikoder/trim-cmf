var assert = require('chai').assert;
var $ = require('jquery');
var EntityModel = require('js/library/entity').Model;
var BaseElement = require('js/listElements/baseElement');

var model;

beforeEach(function() {

    model = EntityModel.createFromApiData({
        jsonapi: {
            varsion: '1.0'
        },
        data: {
            type: 'article',
            id: '1',
            attributes: {
                title: 'Article title',
                subTitle: 'Lorem ipsum dolor sit ament',
                author: 'Mike Hammer',
                intro: '',
                content: '<p>Lorem ipsum<br /> dolor sit ament.</p>',
                signature: null
            },
            relationships: {
                tags: {
                    data: [
                        {id: '1', type: 'tag'},
                        {id: '2', type: 'tag'}
                    ]
                }
            }
        },
        included: [
            {
                type: 'tag',
                id: '1',
                attributes: {
                    title: 'Tag 1'
                }
            },
            {
                type: 'tag',
                id: '2',
                attributes: {
                    title: 'Tag 2'
                }
            }
        ]
    });

});

describe('LIST ELEMENT: Base element', function() {

    it('entity model is defined', function() {

        var baseElement = new BaseElement({
            entityModel: model
        });

        assert.deepEqual(baseElement.entityModel, model);

    });

    it('options are defined', function() {

        var baseElement = new BaseElement({
            entityModel: model,
            options: {
                attributes: {readonly: 'true'}
            }
        });

        assert.deepEqual(baseElement.options.attributes, {readonly: 'true'});

    });

    it('returns type value', function() {

        var baseElement = BaseElement.extend({elementType: 'text'});

        assert.equal(baseElement.getType(), 'text');

    });

    it('render attributes', function() {

        var baseElement = new BaseElement({
            options: {
                attributes: {height: '100'}
            }
        });

        baseElement.render();

        assert.equal(baseElement.$el.attr('height'), '100');

    });

    it('Process value mapping returns value with mapTo option as string', function() {

        var options = {mapTo: 'title'};

        var baseElement = new BaseElement({
            entityModel: model,
            options: options
        });

        assert.equal(baseElement.processValueMapping(model, options), 'Article title');

    });

    it('Process value mapping returns value with mapTo option as function', function() {

        var options = {
            mapTo: function(model, context) {
                return model.get('title') + ', by ' + context.entityModel.get('author');
            }
        };

        var baseElement = new BaseElement({
            entityModel: model,
            options: options
        });

        assert.equal(baseElement.processValueMapping(model, options), 'Article title, by Mike Hammer');

    });

    it('Process value mapping when model returns array value', function() {

        var options = {
            mapTo: 'tags.title',
            collectionDelimiter: ', '
        };

        var baseElement = new BaseElement({
            entityModel: model
        });

        assert.equal(baseElement.processValueMapping(model, options), 'Tag 1, Tag 2');

    });

    it('Process value mapping with strip tags option', function() {

        var options = {
            mapTo: 'content',
            stripTags: true
        };

        var baseElement = new BaseElement({
            entityModel: model
        });

        assert.equal(baseElement.processValueMapping(model, options), 'Lorem ipsum dolor sit ament.');

    });

    it('Process value mapping with escape html option', function() {

        var options = {
            mapTo: 'content',
            escapeHtml: true
        };

        var baseElement = new BaseElement({
            entityModel: model
        });

        assert.equal(baseElement.processValueMapping(model, options), '&lt;p&gt;Lorem ipsum&lt;br /&gt; dolor sit ament.&lt;/p&gt;');

    });

    it('Process value mapping with limit characters option', function() {

        var options = {
            mapTo: 'subTitle',
            limitCharacters: 10
        };

        var baseElement = new BaseElement({
            entityModel: model
        });

        assert.equal(baseElement.processValueMapping(model, options), 'Lorem ipsu...');

    });

    it('Process value mapping with limit characters option', function() {

        var options = {
            mapTo: 'subTitle',
            limitWords: 3
        };

        var baseElement = new BaseElement({
            entityModel: model
        });

        assert.equal(baseElement.processValueMapping(model, options), 'Lorem ipsum dolor...');

    });

    it('Process value mapping with ifEmpty string option and value null', function() {

        var options = {
            mapTo: 'signature',
            ifEmpty: ''
        };

        var baseElement = new BaseElement({
            entityModel: model
        });

        assert.equal(baseElement.processValueMapping(model, options), '');

    });

    it('Process value mapping with ifEmpty string option and value empty string', function() {

        var options = {
            mapTo: 'intro',
            ifEmpty: ''
        };

        var baseElement = new BaseElement({
            entityModel: model
        });

        assert.equal(baseElement.processValueMapping(model, options), '');

    });

    it('Process value mapping with ifEmpty string option and value undefined', function() {

        var options = {
            mapTo: 'caption',
            ifEmpty: ''
        };

        var baseElement = new BaseElement({
            entityModel: model
        });

        assert.equal(baseElement.processValueMapping(model, options), '');

    });

    it('Process value mapping with ifEmpty function option', function() {

        var options = {
            mapTo: 'intro',
            ifEmpty: function(model, context) {
                return 'Article "' + model.get('title') + '", by ' + context.entityModel.get('author') + ' has no intro content';
            }
        };

        var baseElement = new BaseElement({
            entityModel: model
        });

        assert.equal(baseElement.processValueMapping(model, options), 'Article "Article title", by Mike Hammer has no intro content');

    });

});
