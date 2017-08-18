var _ = require('underscore');
var router = require('js/app').get('router');
var SelectInput = require('js/formElements/select');
var translate = require('js/library/translate');

var Sort = require('js/library/view').extend({

    tagName: 'nav',
    className: 'sort sortType1',

    defaults: {},

    initialize: function(options) {

        this.options = _.extend({}, this.defaults, options);
        this.definitions = [];

    },

    add: function(sortDefinition) {

        _.each(_.isArray(sortDefinition) ? sortDefinition : [sortDefinition], function(definition) {
            this.definitions.push(definition);
        }, this);

        return this;

    },

    hasMultipleSortOptions: function() {

        return this.definitions.length > 1;

    },

    createElement: function() {

        var sortView = this.addView(new Sort(this.options), 'sortElements');

        sortView.add(this.definitions).setSort(this.getSort()).render();

        this.listenTo(sortView, 'sortRequest', function(data) {
            this.trigger('sortRequest', data);
        });

        return sortView;

    },

    render: function() {

        this.selectView = this.addView(new SelectInput({options: {
            buttonTextPrefix: '<span>' + translate('resourceSort.caption') + '</span>',
            attributes: {
                label: {className: 'label'},
                inputWrapper: {className: 'selectType1'},
                wrapper: {className: 'inner'}
            },
            selectOptions: _.map(this.definitions, function(definition) {
                return {caption: definition.label, value: definition.field};
            })
        }}));

        this.selectView.setValue(this.getSort()).render().$el.appendTo(this.$el);

        this.listenTo(this.selectView, 'change', function() {
            this.trigger('sortRequest', this.selectView.getValue());
        });

    },

    setSort: function(sort) {

        this.selectedSort = sort;

        if (this.selectView) {
            this.selectView.setValue(sort, {silent: true});
            this.selectView.$input.val(sort);
            this.selectView.renderButtonText();
        }

        _.each(this.getGroupViews('sortElements'), function(sortElement) {
            sortElement.setSort(sort);
        });

        return this;

    },

    getUrlSort: function() {

        return router.getQueryParam('sort') || this.getDefaultSort();

    },

    getDefaultSort: function() {

        return this.definitions.length > 0 ? this.definitions[0].field : undefined;

    },

    getSort: function() {

        return this.selectedSort || this.getDefaultSort();

    }

});

module.exports = Sort;
