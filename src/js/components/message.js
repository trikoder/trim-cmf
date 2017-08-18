var _ = require('underscore');
var translate = require('js/library/translate');

module.exports = require('js/library/view').extend({

    defaults: {
        content: '',
        closeAfter: 3000,
        action: null,
        actionCaption: 'Ok',
        closeCaption: translate('message.closeText')
    },

    className: 'messageType1',

    initialize: function(options) {

        this.options = _.extend({}, this.defaults, options);
        this.render();

        if (this.options.closeAfter) {

            this.closeTimeout = setTimeout(this.close.bind(this), this.options.closeAfter);

            this.on('beforeRemove', function() {
                clearTimeout(this.closeTimeout);
            });

        } else {

            this.$el.addClass('withClose');
            this.$el.append('<button type="button" class="closeBtn nBtn icr iconClose">' + this.options.closeCaption + '</button>');

        }

    },

    events: {
        'click .closeBtn': 'close',
        'click > .actionBtn': 'executeAction'
    },

    render: function() {

        this.$el.html(this.options.content);

        if (this.options.action) {
            this.$el.addClass('withAction').append('<button type="button" class="actionBtn nBtn">' + this.options.actionCaption + '</button>');
        }

    },

    executeAction: function() {

        this.options.action();
        this.close();
        return this;

    },

    close: function() {

        this.$el.slideUp(400, this.remove.bind(this));

    }

});
