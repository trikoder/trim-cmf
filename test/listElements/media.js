var assert = require('chai').assert;
var $ = require('jquery');
var EntityModel = require('js/library/entity').Model;
var mediaListItem = require('inject-loader!js/listElements/media')({
    'js/library/bootData': function() {
        return 'assets/';
    }
});

var modelArticle;
var modelImage;
var modelGif;
var modelVideoEmbed;
var modelAudioEmbed;
var modelAudio;
var modelFile;

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
                    title: 'Image 1',
                    mediaType: 'image',
                    url: '/images/image-1.jpg'
                }
            }
        ]
    });

    modelImage = EntityModel.createFromApiData({
        jsonapi: {
            varsion: '1.0'
        },
        data: {
            type: 'media',
            id: '1',
            attributes: {
                title: 'Image 1',
                mediaType: 'image',
                url: '/images/image-1.jpg',
                originalUrl: '/images/image-large-1.jpg'
            }
        }
    });

    modelGif = EntityModel.createFromApiData({
        jsonapi: {
            varsion: '1.0'
        },
        data: {
            type: 'media',
            id: '1',
            attributes: {
                title: 'Image 1',
                mediaType: 'animatedGif',
                url: '/images/image-1.jpg'
            }
        }
    });

    modelVideoEmbed = EntityModel.createFromApiData({
        jsonapi: {
            varsion: '1.0'
        },
        data: {
            type: 'media',
            id: '1',
            attributes: {
                title: 'Image 1',
                mediaType: 'videoEmbed',
                url: '/images/image-1.jpg',
                embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/1GWsdqCYvgw" frameborder="0" allowfullscreen></iframe>'
            }
        }
    });

    modelAudioEmbed = EntityModel.createFromApiData({
        jsonapi: {
            varsion: '1.0'
        },
        data: {
            type: 'media',
            id: '1',
            attributes: {
                title: 'Image 1',
                mediaType: 'audioEmbed',
                url: '/images/image-1.jpg'
            }
        }
    });

    modelAudio = EntityModel.createFromApiData({
        jsonapi: {
            varsion: '1.0'
        },
        data: {
            type: 'media',
            id: '1',
            attributes: {
                title: 'Image 1',
                mediaType: 'audio',
                url: '/images/image-1.jpg',
                fileUrl: '/images/audio-1.jpg'
            }
        }
    });

    modelFile = EntityModel.createFromApiData({
        jsonapi: {
            varsion: '1.0'
        },
        data: {
            type: 'media',
            id: '1',
            attributes: {
                title: 'File 1',
                mediaType: 'file',
                url: '/images/file-1.jpg',
                fileUrl: '/images/file-1.jpg'
            }
        }
    });

});

describe('LIST ELEMENT: Media element', function() {

    it('render element content as image', function(done) {

        var mediaElement = new mediaListItem({
            entityModel: modelImage,
            options: {
                mapImageTo: 'url'
            }
        });

        mediaElement.render();

        $.SimpleLightbox = {
            open: function(data) {
                assert.equal(data.items[0], modelImage.get('originalUrl'));
                done();
            }
        };

        mediaElement.$el.find('.zoomImage').trigger('click');

        assert.equal(mediaElement.$el.find('img').attr('src'), modelImage.get('url'));
        assert.equal(mediaElement.$el.find('button').is('.zoomImage'), true);

    });

    it('render element content as image relation', function() {

        var mediaElement = new mediaListItem({
            entityModel: modelArticle,
            options: {
                mediaRelation: 'image',
                mapImageTo: 'url'
            }
        });

        mediaElement.render();

        assert.equal(mediaElement.$el.find('img').attr('src'), '/images/image-1.jpg');
        assert.equal(mediaElement.$el.find('button').is('.zoomImage'), true);

    });

    it('render element content as animatedGif', function() {

        var mediaElement = new mediaListItem({
            entityModel: modelGif,
            options: {
                mapImageTo: 'url'
            }
        });

        mediaElement.render();

        assert.equal(mediaElement.$el.css('background-image'), 'url(' + window.location.origin + '/assets/images/mediaType/gif@2x.png)');
        assert.equal(mediaElement.$el.find('button').is('.zoomImage'), true);

    });

    it('render element content as videoEmbed', function(done) {

        var mediaElement = new mediaListItem({
            entityModel: modelVideoEmbed,
            options: {
                mapImageTo: 'url',
                backgroundImage: '/background-image.jpg'
            }
        });

        mediaElement.render();

        $.SimpleLightbox = {
            open: function(data) {
                assert.equal(data.content.find('iframe').attr('src'), $(modelVideoEmbed.get('embedCode')).attr('src'));
                done();
            }
        };

        mediaElement.$el.find('.previewEmbed').trigger('click');

        assert.equal(mediaElement.$el.find('button').is('.previewEmbed'), true);

    });

    it('render element content as audioEmbed', function() {

        var mediaElement = new mediaListItem({
            entityModel: modelAudioEmbed,
            options: {
                mapImageTo: 'url'
            }
        });

        mediaElement.render();

        assert.equal(mediaElement.$el.find('button').is('.previewEmbed'), true);

    });

    it('render element content as audio', function(done) {

        var mediaElement = new mediaListItem({
            entityModel: modelAudio,
            options: {
                mapImageTo: 'url'
            }
        });

        mediaElement.render();

        $.SimpleLightbox = {
            open: function(data) {
                assert.equal(data.content.find('source').attr('src'), modelAudio.get('fileUrl'));
                done();
            }
        };

        mediaElement.$el.find('.playAudio').trigger('click');

        assert.equal(mediaElement.$el.css('background-image'), 'url(' + window.location.origin + '/assets/images/mediaType/audio@2x.png)');
        assert.equal(mediaElement.$el.find('button').is('.playAudio'), true);

    });

    it('render element content as file', function(done) {

        var mediaElement = new mediaListItem({
            entityModel: modelFile,
            options: {
                mapImageTo: 'url'
            }
        });

        mediaElement.render();

        window.open = function(url, option) {
            assert.equal(url, modelFile.get('fileUrl'));
            assert.equal(option, '_blank');
            done();
        };

        mediaElement.$el.find('.openFile').trigger('click');

        assert.equal(mediaElement.$el.css('background-image'), 'url(' + window.location.origin + '/assets/images/mediaType/file@2x.png)');
        assert.equal(mediaElement.$el.find('button').is('.openFile'), true);

    });

    it('pass background image as string', function() {

        var mediaElement = new mediaListItem({
            entityModel: modelVideoEmbed,
            options: {
                mapImageTo: 'url',
                backgroundImage: '/background-image.jpg'
            }
        });

        mediaElement.render();

        assert.equal(mediaElement.$el.css('background-image'), 'url(' + window.location.origin + '/background-image.jpg)');

    });

    it('pass background image as function', function() {

        var mediaElement = new mediaListItem({
            entityModel: modelAudioEmbed,
            options: {
                mapImageTo: 'url',
                backgroundImage: function(model) {
                    return '/background-image-' + model.get('id') + '.jpg'
                }
            }
        });

        mediaElement.render();

        assert.equal(mediaElement.$el.css('background-image'), 'url(' + window.location.origin + '/background-image-1.jpg)');

    });

    it('render placeholder', function() {

        var mediaElement = new mediaListItem({
            entityModel: null
        });

        mediaElement.render();

        assert.equal(mediaElement.$el.find('.placeholder').length, true);

    });

});
