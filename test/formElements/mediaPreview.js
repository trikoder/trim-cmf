var $ = require('jquery');
var assert = require('chai').assert;
var sinon = require('sinon');
var MediaPreview = require('js/formElements/mediaPreview');
var EntityModel = require('js/library/entity').Model;

var modelArticle;
var modelGif;

beforeEach(function() {

    modelArticle = EntityModel.createFromApiData({
        jsonapi: {
            varsion: '1.0'
        },
        data: {
            type: 'article',
            id: '1',
            attributes: {
                title: 'Article title',
                author: 'Mike Hammer'
            },
            relationships: {
                image: {
                    data: {id: '1', type: 'media'}
                }
            }
        },
        included: [
            {
                type: 'media',
                id: '1',
                attributes: {
                    title: 'Image 12',
                    mediaType: 'image',
                    url: '/images/image-1.jpg',
                    originalUrl: '/images/image-large-1.jpg'
                }
            }
        ]
    });

    modelGif = EntityModel.createFromApiData({
        jsonapi: {
            varsion: '1.0'
        },
        data: {
            type: 'media',
            id: '1',
            attributes: {
                title: 'Image 14',
                mediaType: 'animatedGif',
                url: '/images/image-1.jpg',
                originalUrl: '/images/image-large-1.jpg'
            }
        }
    });

    sandbox = sinon.sandbox.create();

});

afterEach(function() {

    sandbox.restore();

});

describe('FORM ELEMENT: media preview element', function() {

    it('render media image preview element', function() {

        var mediaPreview = new MediaPreview({
            entityModel: modelArticle,
            options: {
                mediaRelation: 'image',
                mapImageTo: 'url',
                mapLargeImageTo: 'originalUrl'
            }
        });

        mediaPreview.render();

        assert.equal(mediaPreview.$el.find('img').attr('src'), modelArticle.get('image.url'));

    });

    it('render media as animated gif preview element', function() {

        var mediaPreview = new MediaPreview({
            entityModel: modelGif,
            options: {
                mapImageTo: 'url',
                mapLargeImageTo: 'originalUrl'
            }
        });

        mediaPreview.render();

        assert.equal(mediaPreview.$el.find('img').attr('src'), modelGif.get('url'));

    });

    it('render placeholder preview element', function() {

        var mediaPreview = new MediaPreview();

        mediaPreview.render();

        assert.equal(mediaPreview.$el.find('.placeholder').length, 1);

    });

    it('invokes lightbox plugin', function(done) {

        var mediaPreview = new MediaPreview({
            entityModel: modelArticle,
            options: {
                mediaRelation: 'image',
                mapImageTo: 'url',
                mapLargeImageTo: 'originalUrl'
            }
        });

        mediaPreview.render();

        assert.equal(mediaPreview.$el.find('button').is('.zoomImage'), true);

        sandbox.stub($.simpleLightbox, 'open').callsFake(function(data) {

            assert.equal(data.items[0], modelArticle.get('image.originalUrl'));

            done();

        });

        mediaPreview.$el.find('.zoomImage').trigger('click');

    });

});
