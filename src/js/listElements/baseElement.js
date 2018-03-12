var _ = require('underscore');
var attributeMixin = require('../library/attributeMixin');
var escapeHtml = require('escape-html');

var BaseListElement = require('../library/view').extend({

    initialize: function(params) {

        this.entityModel = params.entityModel;

        var options = this.options = _.extend({}, this.defaults, (params && params.options || {}));

        options.attributes && _.each(options.attributes, function(attributeValue, attributeName) {
            this.addAttribute(attributeName, attributeValue);
        }, this);

    },

    render: function() {

        this.renderAttributes(this.$el);
        return this;

    },

    processValueMapping: function(model, options) {

        var value;

        if (typeof options.mapTo === 'function') {
            value = options.mapTo(model, this);
        } else {
            value = model.get(options.mapTo);
        }

        if (_.isArray(value)) {
            value = value.join(options.collectionDelimiter);
        }

        if (value) {

            if (options.stripTags) {
                value = _.stripTags(value);
            }

            if (options.escapeHtml) {
                value = escapeHtml(value);
            }

            if (options.limitCharacters) {
                value = _.limit(value, options.limitCharacters);
            }

            if (options.limitWords) {
                value = _.words(value, options.limitWords);
            }

        }

        if (typeof options.ifEmpty !== 'undefined' && (value === null || value === undefined || value === '')) {
            value = typeof options.ifEmpty === 'function' ? options.ifEmpty(model, this) : options.ifEmpty;
        }

        return value;

    }

}, {

    getType: function() {

        return this.prototype.elementType;

    }

});

attributeMixin(BaseListElement.prototype);

module.exports = BaseListElement;
