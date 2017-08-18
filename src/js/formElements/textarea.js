var $ = require('jquery');
var _ = require('underscore');
var BaseElement = require('js/formElements/baseElement');

module.exports = BaseElement.extend({

    defaults: {
        autoHeight: true,
        trimOnPaste: true
    },

    elementType: 'textarea',

    events: function() {
        return _.extend({
            'input textarea': 'handleInput',
            'change textarea': 'handleInput'
        }, this.options.trimOnPaste ? {
            'paste textarea': function(e) {
                setTimeout(function() {
                    this.$input.val($.trim(this.$input.val().replace(/\s+/g, ' '))).trigger('change');
                }.bind(this), 0);
            }
        } : {});
    },

    handleInput: function() {

        this.setValueFromInput();

    },

    setValueFromInput: function(e) {

        this.setValue(this.$input.val());
        this.$mirror && this.$mirror.text(this.$input.val());

        return this;

    },

    render: function() {

        BaseElement.prototype.render.call(this);

        this.$input = $('<textarea>').val(this.getValue());
        this.removeAttribute('value').renderAttributes(this.$input);
        this.$input.appendTo(this.$inputWrapper);

        this.options.autoHeight && this.setupAutoHeight();

        return this;

    },

    setupAutoHeight: function() {

        this.$inputWrapper.addClass('textareaAutoHeight');

        var $mirrorWrap = $('<pre />');

        this.$mirror = $('<span />').text(this.getValue());
        this.renderAttributes($mirrorWrap);

        $mirrorWrap
            .removeAttr('id')
            .removeAttr('rows')
            .removeAttr('name')
            .append(this.$mirror).append('<br />').insertBefore(this.$input);

        return this;

    }

});
