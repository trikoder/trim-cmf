var BaseListElement = require('js/listElements/baseElement');
var formatDate = require('js/library/formatDate');

module.exports = BaseListElement.extend({

    tagName: 'p',
    className: 'dateTimeListItemType1',
    elementType: 'dateTime',

    defaults: {
        format: 'DD.MM.YYYY HH:mm'
    },

    render: function() {

        BaseListElement.prototype.render.call(this);
        this.$el.html(formatDate(this.entityModel.get(this.options.mapTo), this.options.format));
        return this;

    }

});
