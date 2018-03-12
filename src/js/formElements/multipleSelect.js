var $ = require('jquery');
var _ = require('underscore');
var BaseElement = require('../formElements/baseElement');
var EntityCollection = require('../library/entity').Collection;
var translate = require('../library/translate');

require('fastselect');

module.exports = BaseElement.extend({

    elementType: 'multipleSelect',

    initialize: function() {

        BaseElement.prototype.initialize.apply(this, arguments);

        this.on('beforeRemove', function() {
            this.fastselect && this.fastselect.destroy();
        });

    },

    events: {
        'change select': 'setValueFromInput'
    },

    setValueFromInput: function(e) {

        return this.setValue(this.$input.val());

    },

    setValue: function(value, options) {

        if (value && typeof value === 'string') {
            value = value.split(',');
        }

        return BaseElement.prototype.setValue.call(this, value, options);

    },

    render: function() {

        BaseElement.prototype.render.call(this);

        this.$input = $('<select multiple>');
        this.$inputWrapper.addClass('fstElement fstMultipleMode');

        this.prepareSelectOptions(function() {

            var value = this.getValue();

            if (typeof value !== 'undefined') {
                this.$input.val(value);
            }

            this.renderAttributes(this.$input);

            this.setupFastSelect();

            this.$inputWrapper.remove();
            this.$inputWrapper = this.fastselect.$el;
            this.inputWrapper.renderAttributes(this.$inputWrapper);
            this.$inputWrapper.addClass('fstElement fstMultipleMode').appendTo(this.$el);

        });

        return this;

    },

    rerender: function() {

        this.fastselect && this.fastselect.destroy();
        return BaseElement.prototype.rerender.apply(this, arguments);

    },

    setupFastSelect: function() {

        this.fastselect = new $.Fastselect(this.$input.get(0), {
            placeholder: translate('formElements.multipleSelect.placeholderText'),
            itemSelectedClass: 'fstSelected iconCheckmark'
        });

        return this;

    },

    renderSelectOptions: function(selectOptions) {

        _.each(selectOptions, function(option) {
            this.$input.append('<option value="' + option.value + '">' + option.caption + '</option>');
        }, this);

    },

    prepareSelectOptions: function(callback) {

        var selectOptions = this.options.selectOptions;

        if (_.isArray(selectOptions)) {

            this.renderSelectOptions(selectOptions);
            callback && callback.call(this);

        } else if (_.isObject(selectOptions)) {

            var $loadingCaption = $(
                '<p class="loadingCaption">' + translate('formElements.multipleSelect.loadingCaption') + '</p>'
            ).appendTo(this.$inputWrapper);

            this.prepareOptionsFromApi(function(mappedOptions) {

                $loadingCaption.remove();
                this.renderSelectOptions(mappedOptions);
                callback && callback.call(this);

            });

        }

    },

    prepareOptionsFromApi: function(callback) {

        var selectOptions = _.extend({mapCaptionTo: 'name', mapValueTo: 'id'}, this.options.selectOptions);

        this.renderDeferred = EntityCollection.getFromApi({url: selectOptions.url}, function(entityCollection) {

            var mappedOptions = entityCollection.map(function(entity) {
                return {
                    caption: entity.get(selectOptions.mapCaptionTo),
                    value: entity.get(selectOptions.mapValueTo)
                };
            });

            if (selectOptions.prepend) {
                mappedOptions = selectOptions.prepend.concat(mappedOptions);
            }

            callback && callback.call(this, mappedOptions);

        }, this);

    }

});
