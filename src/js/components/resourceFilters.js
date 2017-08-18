var $ = require('jquery');
var _ = require('underscore');
var router = require('js/app').get('router');
var translate = require('js/library/translate');

module.exports = require('js/library/view').extend({

    tagName: 'form',

    className: 'filters filtersType1',

    defaults: {
        filterAlwaysBy: {},
        initialFilters: {},
        elementAttributes: {
            text: {
                label: {className: 'labelType1'},
                input: {className: 'inputType1', placeholder: translate('resourceFilters.searchInputCaption')},
                wrapper: {className: 'inlineInputBlockType1'}
            },
            date: {
                label: {className: 'labelType1'},
                input: {className: 'inputType1', size: 10},
                wrapper: {className: 'inlineInputBlockType1'}
            },
            checkbox: {
                label: {className: 'labelType1'},
                input: {className: 'checkboxType1'},
                wrapper: {className: 'inlineInputBlockType1'}
            },
            select: {
                label: {className: 'labelType1'},
                inputWrapper: {className: 'selectType1'},
                wrapper: {className: 'inlineInputBlockType1'}
            },
            multipleSelect: {
                label: {className: 'labelType1'},
                wrapper: {className: 'inlineInputBlockType1'}
            },
            nestedSelect: {
                label: {className: 'labelType1'},
                wrapper: {className: 'inlineInputBlockType1'}
            },
            externalAdmin: {
                label: {className: 'labelType1'},
                wrapper: {className: 'inlineInputBlockType1'}
            }
        }
    },

    initialize: function(options) {

        this.options = $.extend(true, {}, this.defaults, options);
        this.fieldDefinitions = {};
        this.fieldInstances = {};

        this.adjustSizeDebounced = _.debounce(this.adjustSize.bind(this), 0);

        this.on('insertInDom', this.adjustSize);

    },

    events: {
        'click > .toggleBtn': function(e) {

            e.preventDefault();
            this.$el.toggleClass('active');

        },
        'click .toggleSizeBtn': function() {

            this.$el.toggleClass('sizeExpanded');

        },
        'resize window': 'adjustSizeDebounced',
        submit: function(e) {

            e.preventDefault();
            this.trigger('beforeFilterRequest', this.getViewFilters(), this);
            this.trigger('filterRequest', this.getViewFilters(), this);

        }
    },

    hasFilters: function() {

        return _.size(this.fieldDefinitions) > 0;

    },

    add: function(Type, options) {

        this.fieldDefinitions[options.name] = {
            Type: Type,
            options: $.extend(true, {}, {
                attributes: this.options.elementAttributes[Type.prototype.elementType]
            }, options)
        };

        return this;

    },

    filterAlwaysBy: function(key, value) {

        var filters = this.options.filterAlwaysBy;
        var params = _.isObject(key) ? key : _.object([key], [value]);

        _.each(params, function(paramValue, paramKey) {
            filters[paramKey] = paramValue;
        });

        return this;
    },

    filterInitiallyBy: function(key, value) {

        var filters = this.options.initialFilters;
        var params = _.isObject(key) ? key : _.object([key], [value]);

        _.each(params, function(paramValue, paramKey) {
            filters[paramKey] = paramValue;
        });

        return this;

    },

    getUrlFilters: function() {

        var params = {};

        _.each(this.fieldDefinitions, function(definition) {

            // check for url query parameters
            var paramName = definition.options.name;
            var paramValue = router.getQueryParam(paramName);

            if (paramValue) {
                params[paramName] = paramValue;
            }

        }, this);

        _.extend(params, this.options.filterAlwaysBy);

        return params;

    },

    getInitialAndUrlFilters: function() {

        return _.extend({}, this.options.initialFilters, this.getUrlFilters());

    },

    getViewFilters: function() {

        var params = {};
        var filterElements = this.getGroupViews('filterElements');

        if (filterElements.length) {

            _.each(filterElements, function(formElement) {

                var filterValue = formElement.getValue();

                if (_.isArray(filterValue)) {
                    filterValue = filterValue.join(',');
                }

                if (filterValue) {
                    params[formElement.getName()] = filterValue;
                }

            }, this);

        } else {

            _.extend(params, this.options.initialFilters);

            _.each(this.fieldDefinitions, function(definition, key) {
                definition.options.value && (params[key] = definition.options.value);
            });

        }

        _.extend(params, this.options.filterAlwaysBy);

        return params;

    },

    setDefinitionValues: function(params) {

        _.each(params, function(value, key) {

            if (this.fieldDefinitions[key]) {
                this.fieldDefinitions[key].options.value = value;
            }

        }, this);

    },

    render: function() {

        var template = require('templates/partials/resourceListFilters.jst');

        this.removeViews();

        this.$el.html(template.render({
            filterButtonCaption: translate('resourceFilters.filterButtonCaption'),
            toggleButtonCaption: translate('resourceFilters.toggleButtonCaption'),
            toggleSizeButtonCaption: translate('resourceFilters.toggleSizeButtonCaption')
        }));

        this.$filtersContainer = this.$('> .inner');

        _.each(this.fieldDefinitions, function(definition, definitionKey) {

            var filterView = this.fieldInstances[definitionKey] = this.addView(new definition.Type({
                options: definition.options
            }), 'filterElements');

            filterView.render().$el.appendTo(this.$filtersContainer);

            this.listenTo(filterView, 'change', this.adjustSizeDebounced);

            if (filterView.renderDeferred) {
                this.when(filterView.renderDeferred, this.adjustSizeDebounced);
            }

        }, this);

        return this;

    },

    getFieldInstance: function(key) {

        return this.fieldInstances[key];

    },

    adjustSize: function() {

        if (!this.$filtersContainer) { return; }

        this.contractedSize = this.contractedSize || parseInt(this.$filtersContainer.css('minHeight'), 10);

        if (!this.$el.hasClass('sizeExpanded')) {
            this.$el.removeClass('canContract').toggleClass('canContract', this.$el.outerHeight() > this.contractedSize);
        }

    }

});
