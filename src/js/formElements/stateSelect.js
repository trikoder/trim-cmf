var $ = require('jquery');
var _ = require('underscore');
var BaseElement = require('../formElements/baseElement');
var EntityModel = require('../library/entity').Model;
var SelectInput = require('../formElements/select');
var translate = require('../library/translate');

module.exports = BaseElement.extend({

    elementType: 'stateSelect',

    defaults: {
        updateEntityOnChange: false,
        updateControlCaption: translate('formElements.stateSelect.updateControlCaption'),
        nextStatePlaceholderCaption: translate('formElements.stateSelect.nextStatePlaceholderCaption'),
        states: []
    },

    events: {
        'click .updateBtn': 'persistState'
    },

    render: function() {

        BaseElement.prototype.render.call(this);

        this.$inputWrapper
            .addClass('stateSelectElement')
            .addClass(this.options.updateEntityOnChange ? 'withButton' : '');

        this.renderStates();

        return this;

    },

    renderStates: function() {

        var currentState = _.find(this.options.states, function(state) {
            return state.value === this.getValue();
        }, this) || this.options.states[0];

        var selectableOptions = this.getSelectableOptions(currentState);

        this.$currentStateCaption = this.$currentStateCaption || $('<p class="stateCaption" />').appendTo(this.$inputWrapper);
        this.$currentStateCaption.html('<span>' + currentState.caption + '</span>');

        this.$inputWrapper.toggleClass('withNoOptions', selectableOptions.length === 0);

        if (this.selectView) {

            this.selectView.options.selectOptions = selectableOptions;
            this.selectView.rerender();

        } else {

            var $controls = $('<div class="controls" />').appendTo(this.$inputWrapper);

            this.selectView = this.addView(new SelectInput({options: {
                attributes: {
                    inputWrapper: {className: 'selectType1'},
                    wrapper: {className: 'selectContainer'}
                },
                buttonTextPrefix: '&#8627;&nbsp; ',
                selectOptions: selectableOptions
            }})).render().appendTo($controls);

            if (this.options.updateEntityOnChange) {

                $('<button type="button" />')
                    .addClass('updateBtn nBtn')
                    .text(this.options.updateControlCaption)
                    .appendTo($controls);

            } else {

                this.listenTo(this.selectView, 'change', function(value) {
                    this.setValue(this.selectView.getValue());
                }.bind(this));

            }

        }

    },

    getSelectableOptions: function(currentState) {

        var allStates = this.options.states;

        var availableStates = currentState.transitions === 'all' ? allStates : _.map(currentState.transitions || [], function(transition) {

            return _.find(this.options.states, function(state) {
                return transition === this.getStateName(state);
            }, this);

        }, this);

        var stateOptions = _.map(availableStates, function(state) {
            return {
                caption: this.getStateActionCaption(state),
                value: state.value
            };
        }, this);

        if (!this.options.updateEntityOnChange && stateOptions.length) {
            stateOptions.unshift({
                caption: this.options.nextStatePlaceholderCaption,
                value: this.getValue()
            });
        }

        return stateOptions;

    },

    getStateActionCaption: function(state) {

        return state.actionCaption || state.caption;

    },

    getStateName: function(state) {

        return state.name || state.value;

    },

    persistState: function() {

        this.loading(true);

        EntityModel.create({
            id: this.entityModel.get('id')
        }).setType(this.entityModel.getType()).saveOnly({
            attributes: _.object([this.getName()], [this.selectView.getValue()]),
            afterSave: function(model) {

                this.setValue(model.get(this.getName()));
                this.selectView.setValue(null);
                this.renderStates();
                this.loading(false);

            }.bind(this)
        });

    }

});
