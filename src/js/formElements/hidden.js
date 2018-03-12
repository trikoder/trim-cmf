var $ = require('jquery');
var BaseElement = require('../formElements/baseElement');

module.exports = BaseElement.extend({

    elementType: 'hidden',

    events: {
        'change input': 'setValueFromInput'
    },

    setValueFromInput: function(e) {

        return this.setValue(this.$input.val());

    },

    render: function() {

        BaseElement.prototype.render.call(this);

        this.$input = $('<input type="hidden">');
        this.renderAttributes(this.$input);
        this.$input.appendTo(this.$inputWrapper);

        return this;

    }
});
