var BaseListElement = require('../listElements/baseElement');

module.exports = BaseListElement.extend({

    tagName: 'p',
    className: 'textListItemType1',
    elementType: 'text',

    defaults: {
        escapeHtml: true,
        limitCharacters: false,
        limitWords: false,
        stripTags: false,
        collectionDelimiter: ', ',
        ifEmpty: ''
    },

    render: function() {

        BaseListElement.prototype.render.call(this);

        this.$el.html(this.processValueMapping(this.entityModel, this.options));

        return this;

    }

});
