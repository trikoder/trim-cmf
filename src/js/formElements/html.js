var $ = require('jquery');
var BaseElement = require('js/formElements/baseElement');
var ckeditor = require('js/components/ckeditor');

ckeditor.config.extraPlugins = 'sourcedialog';

module.exports = BaseElement.extend({

    elementType: 'html',

    initialize: function(options) {

        BaseElement.prototype.initialize.apply(this, arguments);

        this.on('beforeRemove', function() {
            this.editor && this.editor.destroy();
        });

    },

    render: function() {

        BaseElement.prototype.render.call(this);

        this.$input = $('<div contenteditable="true">').html(this.getValue());
        this.removeAttribute('value').renderAttributes(this.$input);
        this.$input.appendTo(this.$inputWrapper);

        this.setupEditor();

        return this;

    },

    setupEditor: function() {

        var options = $.extend(true, {
            startupShowBorders: true,
            toolbar: [
                {name: 'basicstyles', items: ['Bold', 'Italic', 'Strike', 'RemoveFormat']},
                {name: 'paragraph', items: ['NumberedList', 'BulletedList']},
                {name: 'links', items: ['Link', 'Unlink']},
                {name: 'format', items: ['Format']},
                {name: 'document', items: ['Sourcedialog']}
            ],
            removePlugins: 'magicline',
            'format_tags': 'p;h1;h2;h3'
        }, this.options.editorConfig);

        var editor = this.editor = ckeditor.inline(this.$input.get(0), options);

        editor.on('instanceReady', function(ev) {
            editor.setReadOnly(false);
        });

        editor.on('change', function() {
            this.setValue(editor.getData());
        }.bind(this));

    },

    rerender: function() {

        this.editor && this.editor.destroy();
        return BaseElement.prototype.rerender.apply(this, arguments);

    }

});
