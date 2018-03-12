var translate = require('../library/translate');

module.exports = require('../library/view').extend({

    assignOptions: true,

    optionRules: {
        content: {default: ''},
        closeAfter: {type: [Number, Boolean], default: 3000},
        action: {type: Function, required: false},
        actionCaption: {type: String, default: 'Ok'},
        closeCaption: {type: String, default: translate('message.closeText')}
    },

    className: 'messageType1',

    initialize: function(options) {

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

        this.options.action && this.options.action();
        this.close();
        return this;

    },

    close: function() {

        this.$el.slideUp(400, this.remove.bind(this));

    }

});
