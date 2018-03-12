var $ = require('jquery');
var BaseElement = require('../formElements/baseElement');

module.exports = BaseElement.extend({

    elementType: 'text',

    events: {
        'keyup input': 'setValueFromInput',
        'change input': 'setValueFromInput'
    },

    setValueFromInput: function() {

        return this.setValue(this.$input.val());

    },

    render: function() {

        BaseElement.prototype.render.call(this);

        this.$input = $('<input>');
        this.renderAttributes(this.$input);
        this.$input.appendTo(this.$inputWrapper);

        return this;

    }

});
