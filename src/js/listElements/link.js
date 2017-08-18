var app = require('js/app');
var BaseListElement = require('js/listElements/baseElement');

module.exports = BaseListElement.extend({

    tagName: 'a',
    elementType: 'link',
    className: 'linkListItemType1',

    defaults: {
        isExternalLink: false,
        escapeHtml: true,
        limitCharacters: false,
        limitWords: false,
        stripTags: false,
        collectionDelimiter: ', ',
        ifEmpty: '',
        action: undefined,
        url: '#'
    },

    events: {
        click: function(e) {

            if (!this.options.isExternalLink) {

                e.preventDefault();

                if (this.options.action) {
                    this.options.action(this.entityModel);
                } else {
                    app.get('router').navigateToUrl(this.$el.attr('href'), true);
                }

            }

        }
    },

    render: function() {

        BaseListElement.prototype.render.call(this);

        this.$el.html(this.processValueMapping(this.entityModel, this.options));
        this.$el.attr('href', typeof this.options.url === 'function' ? this.options.url(this.entityModel, this) : this.options.url);

        return this;

    }

});
