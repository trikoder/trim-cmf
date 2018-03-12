var $ = require('jquery');
var _ = require('underscore');
var BaseElement = require('../formElements/baseElement');
var formatDate = require('../library/formatDate');
var parseDate = require('fecha').parse;
var translate = require('../library/translate');

require('simplecalendar');

module.exports = BaseElement.extend({

    defaults: {
        emptyValue: null,
        format: 'DD.MM.YYYY HH:mm',
        serverFormat: function(dateString, fromFormat) {

            try {

                return parseDate(dateString, fromFormat).toISOString();

            } catch (error) {

                console.log('Date value "' + dateString + '" is not in correct format!'); // eslint-disable-line no-console

            }

        }
    },

    elementType: 'dateTime',

    initialize: function() {

        BaseElement.prototype.initialize.apply(this, arguments);

        this.on('beforeRemove', function() {
            this.simplecal && this.simplecal.destroy();
        });

    },

    events: {
        'keyup input': 'setValueFromInput',
        'change input': 'setValueFromInput'
    },

    setValueFromInput: function(e) {

        var inputValue = this.$input.val();

        if (inputValue === '') {
            this.setValue(this.options.emptyValue);
        } else {
            this.setValue(this.options.serverFormat(inputValue, this.options.format));
        }

        return this;

    },

    render: function() {

        BaseElement.prototype.render.call(this);

        this.$input = $('<input type="text" />').val(this.getValue() ? formatDate(this.getValue(), this.options.format) : '');
        this.removeAttribute('value').renderAttributes(this.$input);
        this.$input.appendTo(this.$inputWrapper);

        this.simplecal = new $.Simplecal(this.$input, {
            prevMonthText: translate('formElements.date.previousMonthCaption'),
            nextMonthText: translate('formElements.date.nextMonthCaption'),
            todayButtonText: translate('formElements.date.todayButtonCaption'),
            months: _.map(['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'], function(key) {
                return translate('calendar.months.' + key);
            }),
            days: _.map(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], function(key) {
                return translate('calendar.dayAbbreviations.' + key);
            }),
            changeYear: true,
            changeMonth: true,
            timepicker: true
        });

        return this;

    },

    rerender: function() {

        this.simplecal && this.simplecal.destroy();
        return BaseElement.prototype.rerender.apply(this, arguments);

    }

});
