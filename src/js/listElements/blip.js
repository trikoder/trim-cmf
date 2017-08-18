var _ = require('underscore');
var BaseListElement = require('js/listElements/baseElement');

module.exports = BaseListElement.extend({

    tagName: 'span',
    className: 'blip',
    elementType: 'blip',

    render: function() {

        BaseListElement.prototype.render.call(this);

        var options = this.options;
        var computedValue;

        if (typeof this.options.mapTo === 'function') {
            computedValue = options.mapTo(this.entityModel, this);
        } else {
            computedValue = this.entityModel.get(options.mapTo);
        }

        this.$el.addClass(computedValue ? 'active' : 'inactive');

        if (options.states) {

            var stateProperties = _.find(options.states, function(item) {
                return item.value === computedValue;
            });

            if (stateProperties) {

                stateProperties.color && this.$el.css('backgroundColor', stateProperties.color);
                stateProperties.caption && this.$el.attr('title', stateProperties.caption).text(stateProperties.caption);

            }

        }

        return this;

    }

});
