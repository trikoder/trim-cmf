var $ = require('jquery');
var _ = require('underscore');
var BaseElement = require('../formElements/baseElement');
var EntityCollection = require('../library/entity').Collection;
var translate = require('../library/translate');
var escapeHtml = require('escape-html');
var api = require('../library/api');

module.exports = BaseElement.extend({

    elementType: 'select',

    defaults: {
        buttonTextPrefix: ''
    },

    events: {
        'change select': function() {

            this.setValueFromInput().renderButtonText();

        }
    },

    setValue: function(value, options) {

        if (this.options.castValueTo) {
            value = this.castValue(value, this.options.castValueTo);
        }

        return BaseElement.prototype.setValue.call(this, value, options);

    },

    castValue: function(value, castValueTo) {

        if (castValueTo === 'boolean') {
            if (value === 'true' || value === '1') {
                value = true;
            } else if (value === 'false' || value === '0') {
                value = false;
            }
        } else if (castValueTo === 'integer') {
            value = parseInt(value, 10);
        }

        return value;

    },

    setValueFromInput: function(e) {

        return this.setValue(this.$input.val());

    },

    render: function() {

        BaseElement.prototype.render.call(this);

        this.$input = $('<select>');
        this.$button = $('<button type="button">').appendTo(this.$inputWrapper).text(translate('formElements.select.loadingCaption'));

        this.renderOptions(function() {

            var value = this.getValue();

            if (typeof value !== 'undefined' && value !== null) {
                this.$input.val(value.toString());
            } else {
                this.setValue(this.$input.val(), {silent: true});
            }

            this.renderButtonText();

        });

        this.removeAttribute('value').renderAttributes(this.$input);
        this.$input.appendTo(this.$inputWrapper);

        return this;

    },

    renderOptions: function(callback) {

        var selectOptions = this.options.selectOptions;

        var iterator = function(options) {

            _.each(options, function(option) {
                this.$input.append('<option value="' + escapeHtml(option.value) + '">' + escapeHtml(option.caption) + '</option>');
            }, this);

            callback && callback.call(this);

        }.bind(this);

        if (_.isArray(selectOptions)) {

            iterator(selectOptions);

        } else if (_.isObject(selectOptions)) {

            selectOptions = _.extend({mapCaptionTo: 'name', mapValueTo: 'id'}, selectOptions);

            this.renderDeferred = api.get(selectOptions.url, function(data) {

                this.loadedEntityCollection = EntityCollection.createFromApiData(data);

                var mappedOptions = this.loadedEntityCollection.map(function(entity) {
                    return {
                        caption: entity.get(selectOptions.mapCaptionTo),
                        value: entity.get(selectOptions.mapValueTo)
                    };
                });

                if (selectOptions.prepend) {
                    mappedOptions = selectOptions.prepend.concat(mappedOptions);
                }

                iterator(mappedOptions);

            }.bind(this));

        }

    },

    renderButtonText: function() {

        this.$button.html(
            this.options.buttonTextPrefix + escapeHtml(this.$input.find('option:selected').text())
        );

    },

    getSelectedEntity: function(key) {

        if (this.getValue() && this.loadedEntityCollection) {

            var model = this.loadedEntityCollection.get(this.getValue());

            return key ? model && model.get(key) : model;

        } else {

            return undefined;

        }

    }

});
