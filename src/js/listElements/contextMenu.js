var $ = require('jquery');
var _ = require('underscore');
var BaseListElement = require('js/listElements/baseElement');
var prompt = require('simpleprompt').simplePrompt;
var translate = require('js/library/translate');

module.exports = BaseListElement.extend({

    className: 'contextMenuType1',
    elementType: 'contextMenu',

    events: {
        'click .toggleContextMenu': 'toggle',
        'click .contextItem': function(e) {

            var itemOptions = this.options.items[parseInt($(e.currentTarget).data('index'), 10)];
            var executeAction = function() {
                itemOptions.action && itemOptions.action(this.entityModel, this, e);
            }.bind(this);

            itemOptions.action && e.preventDefault();

            if (itemOptions.confirm) {

                prompt({
                    message: itemOptions.confirm === true ? translate('prompt.defaultMessage') : itemOptions.confirm,
                    confirm: executeAction,
                    cancelText: translate('prompt.cancelText'),
                    acceptText: translate('prompt.acceptText')
                });

            } else {

                executeAction();

            }

        }
    },

    toggle: function() {

        this.$el.hasClass('active') ? this.close() : this.open();

    },

    open: function() {

        this.$el.addClass('active');
        this.addDismissListener('close');

    },

    close: function() {

        this.$el.removeClass('active');
        this.removeDismissListener('close');

    },

    render: function() {

        BaseListElement.prototype.render.call(this);

        this.$el.append('<button class="toggleContextMenu nBtn icr iconMenu">' + translate('listElements.contextMenu.toggleCaption') + '</button>');

        var $dropdown = $('<ul />');

        _.each(this.options.items, function(item, index) {

            var $item;

            if (item.showIf && item.showIf(this.entityModel, this) || !item.showIf) {

                if (item.url) {

                    $item = $('<a>').attr('href', typeof item.url === 'function' ? item.url(this.entityModel, this) : item.url);

                } else {

                    $item = $('<button>');

                }

                item.className && $item.addClass(item.className);
                $item.text(item.caption).data('index', index).addClass('contextItem').appendTo($('<li />').appendTo($dropdown));

            }

        }, this);

        $dropdown.appendTo(this.$el);

        return this;

    }

});
