var $ = require('jquery');
var BaseListElement = require('../listElements/baseElement');
var bootData = require('../library/bootData');

require('simple-lightbox');

module.exports = BaseListElement.extend({

    elementType: 'media',
    className: 'mediaListItemType1',

    defaults: {
        mapImageTo: 'thumbnailUrl',
        mapLargeImageTo: 'originalUrl',
        mapMediaTypeTo: 'mediaType',
        mediaRelation: undefined,
        backgroundImage: ''
    },

    initialize: function() {

        BaseListElement.prototype.initialize.apply(this, arguments);
        this.mediaModel = this.options.mediaRelation ? this.entityModel.get(this.options.mediaRelation) : this.entityModel;

    },

    events: {
        'click .zoomImage': function() {

            $.SimpleLightbox.open({items: [this.mediaModel.get(this.options.mapLargeImageTo)]});

        },
        'click .openFile': function() {

            window.open(this.mediaModel.get('fileUrl'), '_blank');

        },
        'click .previewEmbed': function() {

            var $content = $(this.mediaModel.get('embedCode')).addClass('slbIframe');
            var $wrap = $('<div class="slbIframeCont" />').append($content);

            $.SimpleLightbox.open({content: $wrap});

        },
        'click .playAudio': function() {

            var $content = $('<div class="slbImage"><audio controls><source src="' + this.mediaModel.get('fileUrl') + '" type="audio/mpeg"></audio></div><div class="slbCaption">' + this.mediaModel.get('caption') + '</div>');

            $.SimpleLightbox.open({content: $content});

        }
    },

    render: function() {

        BaseListElement.prototype.render.call(this);

        if (this.mediaModel) {

            switch (this.mediaModel.get(this.options.mapMediaTypeTo)) {
                case 'image': this.renderImage(); break;
                case 'animatedGif': this.renderAnimatedGif(); break;
                case 'videoEmbed': this.renderVideoEmbed(); break;
                case 'audioEmbed': this.renderAudioEmbed(); break;
                case 'audio': this.renderAudio(); break;
                case 'file': this.renderFile(); break;
            }

        } else {

            this.renderPlaceholder();

        }

        return this;

    },

    renderPlaceholder: function() {

        this.$el.html('<span class="placeholder iconImage icr"></span>');

    },

    renderImage: function() {

        var imageUrl = this.mediaModel.get(this.options.mapImageTo);

        imageUrl ? this.$el.html(
            '<img src="' + this.mediaModel.get(this.options.mapImageTo) + '"/>\
            <button type="button" class="zoomImage previewBtn nBtn icr iconExpand">'
        ) : this.renderPlaceholder();

    },

    renderAnimatedGif: function() {

        this.options.backgroundImage = bootData('assetsBuildPath') + 'images/mediaType/gif@2x.png';
        this.$el.html('<button type="button" class="zoomImage previewBtn nBtn icr iconExpand">');
        this.setBackgroundImage();

    },

    renderVideoEmbed: function() {

        this.$el.html('<button type="button" class="previewEmbed previewBtn nBtn icr iconPlay">');
        this.setBackgroundImage();

    },

    renderAudioEmbed: function() {

        this.$el.html('<button type="button" class="previewEmbed previewBtn nBtn icr iconPlay">');
        this.setBackgroundImage();

    },

    renderAudio: function() {

        this.options.backgroundImage = bootData('assetsBuildPath') + 'images/mediaType/audio@2x.png';
        this.$el.addClass('audio').html('<button type="button" class="playAudio large previewBtn nBtn icr iconPlay">');
        this.setBackgroundImage();

    },

    renderFile: function() {

        this.options.backgroundImage = bootData('assetsBuildPath') + 'images/mediaType/file@2x.png';
        this.$el.addClass('file').html('<button type="button" class="openFile previewBtn nBtn icr iconExpand">');
        this.setBackgroundImage();

    },

    setBackgroundImage: function() {

        var imageUrl = typeof this.options.backgroundImage === 'function' ? this.options.backgroundImage.call(this, this.mediaModel) : this.options.backgroundImage;

        this.$el.css({
            backgroundImage: 'url(' + imageUrl + ')',
            backgroundSize: '40% auto'
        });

    }

});
