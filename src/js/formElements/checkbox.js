var $ = require('jquery');
var BaseElement = require('js/formElements/baseElement');

module.exports = BaseElement.extend({

    elementType: 'checkbox',

    defaults: {
        valueMap: {
            checked: true,
            unchecked: false
        }
    },

    events: {
        'change input': 'setValueFromInput'
    },

    setValueFromInput: function(e) {

        return this.setValue(this.options.valueMap[this.$input.prop('checked') ? 'checked' : 'unchecked']);

    },

    getValue: function() {

        return typeof this.value !== 'undefined' ? this.value : this.options.valueMap.unchecked;

    },

    render: function() {

        BaseElement.prototype.render.call(this);

        this.$input = $('<input type="checkbox">').prop('checked', this.getValue() === this.options.valueMap.checked);
        this.$checkboxLabel = $('<label>').addClass('icr iconCheckmark').attr('for', this.getAttribute('id'));
        this.removeAttribute('value').renderAttributes(this.$input);
        this.$input.appendTo(this.$inputWrapper);
        this.$checkboxLabel.appendTo(this.$inputWrapper);

        return this;

    }

});
