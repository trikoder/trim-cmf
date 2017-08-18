var _ = require('underscore');

function addAttribute(attribute, value, context) {

    context.attributes = context.attributes || {};

    if (!context.attributes[attribute]) {
        context.attributes[attribute] = [];
    }

    _.each(value.toString().split(' '), function(singleValue) {
        context.attributes[attribute].push(singleValue);
    }, context);

}

function setAttribute(attribute, value, context) {

    context.attributes = context.attributes || {};

    delete context.attributes[attribute];
    addAttribute(attribute, value, context);

}

var api = {

    setAttribute: function(attribute, value) {

        if (_.isObject(attribute)) {
            _.each(attribute, function(attributeValue, attributeKey) {
                setAttribute(attributeKey, attributeValue, this);
            }, this);
        } else {
            setAttribute(attribute, value, this);
        }
        return this;

    },

    addAttribute: function(attribute, value) {

        if (_.isObject(attribute)) {
            _.each(attribute, function(attributeValue, attributeKey) {
                addAttribute(attributeKey, attributeValue, this);
            }, this);
        } else {
            addAttribute(attribute, value, this);
        }
        return this;

    },

    removeAttribute: function(attribute) {

        this.attributes && delete this.attributes[attribute];
        return this;

    },

    addClass: function(value) {

        this.addAttribute('class', value);
        return this;

    },

    setClass: function(value) {

        this.setAttribute('class', value);
        return this;

    },

    getAttribute: function(attribute) {

        if (this.attributes && this.attributes[attribute]) {
            return this.attributes[attribute].join(' ');
        } else {
            return undefined;
        }

    },

    hasAttribute: function(attribute) {

        return this.attributes && Boolean(this.attributes[attribute]);

    },

    renderAttributes: function($element) {

        if (this.attributes) {

            if ($element) {
                _.each(this.attributes, function(attributes, key) {
                    $element.attr(key === 'className' ? 'class' : key, attributes.join(' '));
                });
            } else {
                return _.map(this.attributes, function(attributes, key) {
                    return (key === 'className' ? 'class' : key) + '="' + attributes.join(' ') + '"';
                }).join(' ');
            }

        } else {
            return '';
        }

    }

};

module.exports = function(obj) {

    return _.extend(obj, api);

};
