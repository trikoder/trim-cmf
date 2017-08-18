var $ = require('jquery');

var selectorFromClass = function(classes) {
    return '.' + classes.replace(/\s/g, '.');
};

module.exports = require('js/library/view').extend({

    parseEventVariables: true,

    defaults: {
        buttonClass: 'tabBtn',
        sectionClass: 'panel',
        tabNavClass: 'tabNav',
        buttonRefAttribute: 'aria-controls',
        sectionRefAttribute: 'data-id',
        titleRefAttribute: 'data-title',
        selectedClass: 'selected',
        buildNavigation: false
    },

    initialize: function(options) {

        this.options = $.extend({}, this.defaults, options);

        $.extend(this.options, {
            buttonSelector: selectorFromClass(this.options.buttonClass),
            sectionSelector: selectorFromClass(this.options.sectionClass)
        });

        this.options.buildNavigation && this.buildNavigation();

        this.$tabButtons = this.$(this.options.buttonSelector);
        this.$tabSections = this.$(this.options.sectionSelector);

    },

    events: {
        'click {{this.options.buttonSelector}}': function(e) {

            var $button = $(e.target);

            if (!$button.hasClass(this.options.selectedClass)) {
                this.goToTab($button.attr(this.options.buttonRefAttribute), $button.attr('data-url'));
            }
        }
    },

    buildNavigation: function() {

        var $tabnav = $('<nav>').addClass(this.options.tabNavClass);
        var self = this;

        this.$(this.options.sectionSelector).each(function(i, el) {

            var $section = $(el);

            $('<button>').attr({
                type: 'button',
                role: 'tab',
                'aria-controls': $section.attr(self.options.sectionRefAttribute)
            })
                .addClass(self.options.buttonClass)
                .text($section.attr(self.options.titleRefAttribute))
                .appendTo($tabnav);

        });

        $tabnav.prependTo(this.$el);

    },

    goToTab: function(tabId, url) {

        var $requestedSection;

        if (typeof tabId === 'number') {
            $requestedSection = this.$tabSections.eq(tabId);
        } else {
            $requestedSection = this.$tabSections.filter('[' + this.options.sectionRefAttribute + '="' + tabId + '"]');
        }

        if ($requestedSection.length) {

            this.adjustHtml($requestedSection);
            this.options.onTabChange && this.options.onTabChange($requestedSection, $requestedSection.index() - 1);

        } else if (url) {

            this.when($.get(url), function(html) {

                var $section = $(html).appendTo(this.$el);
                this.$tabSections = this.$(this.options.sectionSelector);
                this.adjustHtml($section);
                this.options.onSectionLoad && this.options.onSectionLoad($section);
                this.options.onTabChange && this.options.onTabChange($section, $section.index() - 1);

            });

        }

    },

    adjustHtml: function($section) {

        var options = this.options,
            tabId = $section.attr(options.sectionRefAttribute),
            $button = this.$tabButtons.filter('[' + options.buttonRefAttribute + '="' + tabId + '"]');

        this.$tabButtons.removeClass(options.selectedClass).removeAttr('aria-selected');
        $button.addClass(options.selectedClass).attr('aria-selected', 'true');

        this.$tabSections.removeClass(options.selectedClass).attr('aria-hidden', true);
        $section.addClass(options.selectedClass).removeAttr('aria-hidden');

    }

});
