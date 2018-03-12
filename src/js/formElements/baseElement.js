var attributeMixin = require('../library/attributeMixin');
var $ = require('jquery');
var _ = require('underscore');

var instanceCounter = 0;

var BaseElement = require('../library/view').extend({

    initialize: function(params) {

        this.wrapper = attributeMixin({});
        this.inputWrapper = attributeMixin({});
        this.errorMessage = attributeMixin({});

        var options = this.options = $.extend(true, {}, _.result(this, 'defaults', {}), (params && params.options || {}));

        this.entityModel = params && params.entityModel;

        if (typeof options.value !== 'undefined') {
            this.setValue(options.value, {silent: true});
        }

        if (options.readOnly) {

            this.readOnly = true;

            if (typeof options.attributes.inputWrapper === 'undefined') {

                options.attributes.inputWrapper = {};

            }

            options.attributes.inputWrapper.className = options.attributes.inputWrapper.className ? options.attributes.inputWrapper.className + ' disabled' : 'disabled';

            if (typeof options.attributes.input === 'undefined') {

                options.attributes.input = {};

            }

            options.attributes.input.disabled = true;

        }

        options.name && this.setName(options.name);
        options.label && this.setLabel(options.label);
        options.attributes && this.applyAttributesHash(options.attributes);

    },

    applyAttributesHash: function(attributes) {

        _.each(['input', 'inputWrapper', 'label', 'wrapper', 'errorMessage'], function(key) {

            var props = attributes[key];

            if (props) {

                var target = (key === 'input' ? this : this[key]);

                target && _.each(props, function(value, attribute) {
                    target.addAttribute(attribute, value);
                }, this);

            }

        }, this);

    },

    setName: function(name) {

        this.name = name;
        this.setAttribute('name', name);
        return this;

    },

    getName: function() {

        return this.name;

    },

    setValue: function(value, options) {

        var oldValue = this.value;
        var valueIsChanged = false;

        this.value = value;

        if (_.contains(['string', 'number'], typeof value)) {
            this.setAttribute('value', value.toString());
        }

        if (!options || !options.silent) {
            valueIsChanged = _.isArray(value) ? !_.isEqual(value, oldValue) : value !== oldValue;
        }

        if (valueIsChanged) {
            this.trigger('change', value);
            options && options.render && this.rerender();
        }

        return this;

    },

    setErrorMessage: function(message) {

        if (!this.$errorMessage) {
            this.$errorMessage = $('<span>').appendTo(this.$el);
            this.errorMessage.renderAttributes(this.$errorMessage);
        }

        this.$errorMessage.text(message);
        this.$input && this.$input.addClass('withError');
        this.$el.addClass('withError');

        return this;

    },

    removeErrorMessage: function() {

        if (this.$errorMessage) {
            this.$errorMessage.remove();
            delete this.$errorMessage;
        }

        this.$input && this.$input.removeClass('withError');
        this.$el.removeClass('withError');

        return this;

    },

    getValue: function(defaultValue) {

        return typeof this.value !== 'undefined' ? this.value : defaultValue;

    },

    setLabel: function(text) {

        if (!this.label) {
            this.label = attributeMixin({});
        }

        this.label.text = text;

        return this;

    },

    render: function() {

        if (!this.hasAttribute('id')) {
            this.setAttribute('id', 'formElement' + (++instanceCounter));
        }

        this.wrapper.renderAttributes(this.$el);

        if (this.label) {

            !this.label.hasAttribute('for') && this.label.setAttribute('for', this.getAttribute('id'));

            var $label = $('<label>' + this.label.text + '</label>');
            this.label.renderAttributes($label);

            $label.appendTo(this.$el);

        }

        this.$inputWrapper = $('<div>');
        this.inputWrapper.renderAttributes(this.$inputWrapper);
        this.$inputWrapper.appendTo(this.$el);

        return this;

    },

    rerender: function() {

        this.removeViews();
        this.$el.empty();
        return this.render();

    }

}, {

    getType: function() {

        return this.prototype.elementType;

    }

});

attributeMixin(BaseElement.prototype);

module.exports = BaseElement;
