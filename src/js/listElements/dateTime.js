var BaseListElement = require('../listElements/baseElement');
var formatDate = require('../library/formatDate');

module.exports = BaseListElement.extend({

    tagName: 'p',
    className: 'dateTimeListItemType1',
    elementType: 'dateTime',

    defaults: {
        format: 'DD.MM.YYYY HH:mm'
    },

    render: function() {

        BaseListElement.prototype.render.call(this);

        var value = typeof this.options.mapTo === 'function' ? this.options.mapTo(this.entityModel, this) : this.entityModel.get(this.options.mapTo);

        if (value === null || value === undefined || value === '') {
            this.$el.html(this.processValueMapping(this.entityModel, this.options));
        } else {
            this.$el.html(formatDate(this.entityModel.get(this.options.mapTo), this.options.format));
        }

        return this;

    }

});
