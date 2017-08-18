var $ = require('jquery');
var BaseElement = require('js/formElements/baseElement');
var translate = require('js/library/translate');
require('simple-lightbox');

module.exports = BaseElement.extend({

    elementType: 'mediaPreview',
    readOnly: true,

    defaults: {
        mapImageTo: 'thumbnailUrl',
        mapLargeImageTo: 'originalUrl',
        mapMediaTypeTo: 'mediaType'
    },

    initialize: function() {

        BaseElement.prototype.initialize.apply(this, arguments);
        this.mediaModel = this.options.mediaRelation ? this.entityModel.get(this.options.mediaRelation) : this.entityModel;

    },

    events: {
        'click .zoomImage': function() {
            $.simpleLightbox.open({items: [this.mediaModel.get(this.options.mapLargeImageTo)]});
        }
    },

    render: function() {

        BaseElement.prototype.render.call(this);

        if (this.mediaModel) {

            switch (this.mediaModel.get(this.options.mapMediaTypeTo)) {
                case 'image': this.renderImage(); break;
                case 'animatedGif': this.renderImage(); break;
            }

        } else {

            this.renderPlaceholder();

        }

        return this;

    },

    renderPlaceholder: function() {

        this.$inputWrapper.html('<span class="placeholder iconImage icr"></span>');

    },

    renderImage: function() {

        this.$inputWrapper.html(
            '<div class="imageContainer">\
                <img src="' + this.mediaModel.get(this.options.mapImageTo) + '"/>\
                <button type="button" class="zoomImage previewBtn nBtn icr iconExpand">\
            </div>\
            <p><span class="zoomImage">' + translate('formElements.mediaPreview.zoomImage') + '</span></p>'
        );

    }

});
