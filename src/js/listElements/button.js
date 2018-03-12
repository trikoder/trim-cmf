var BaseListElement = require('../listElements/baseElement');

module.exports = BaseListElement.extend({

    tagName: 'button',
    elementType: 'button',
    className: 'nBtn listElementButton',

    defaults: {
        escapeHtml: true,
        limitCharacters: false,
        limitWords: false,
        stripTags: false,
        collectionDelimiter: ', ',
        ifEmpty: ''
    },

    events: {
        click: function(e) {

            e.preventDefault();
            this.options.action(this.entityModel);

        }
    },

    render: function() {

        BaseListElement.prototype.render.call(this);

        this.$el.html(this.processValueMapping(this.entityModel, this.options));

        return this;

    }

});
