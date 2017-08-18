var $ = require('jquery');
var _ = require('underscore');
var View = require('js/library/view');
var serviceContainer = require('js/library/serviceContainer');
var app = require('js/app');

require('nanoscroller');

var MainNavigation = View.extend({

    tagName: 'nav',
    className: 'mainNavigation',

    initialize: function() {

        this.renderDeferred = this.when([

            this.getProjectCaption(),
            this.getNavigationItems(app.get('router')),
            this.getUserNavigationItems(app.get('router')),
            this.getUserCaption()

        ], function(projectCaption, navigationItems, userNavigationItems, userCaption) {

            this.setViewData({
                projectCaption: projectCaption,
                navigationItems: navigationItems,
                userNavigationItems: userNavigationItems,
                userCaption: userCaption
            });

            this.onKeyShortcut('shift+l', function(e) {
                e.preventDefault();
                this.showSearch();
            });

            this.render();

        });

    },

    events: {
        'click > .toggleBtn': 'toggle',
        'click > .inner > .toggleBtn': 'toggle',
        'click .itemToggle': function(e) {

            var $wrap = $(e.currentTarget).closest('li');

            $wrap.siblings('.opened').removeClass('opened');

            if (this.$el.hasClass('active')) {
                $wrap.toggleClass('opened');
            } else {
                $wrap.addClass('opened');
                this.open();
            }

            this.$scrollerContainer.nanoScroller();
        },
        'click .menu .item': 'navigateToLink',
        'click .userPanel .item': function(e) {

            var $control = $(e.currentTarget);
            var itemData = this.viewData.userNavigationItems[$control.parent().index()];

            if ($control.is('button')) {
                itemData.action && itemData.action(this);
            } else if ($control.is('a.appLink')) {
                this.navigateToLink(e);
            }

        },
        'click .userPanel .toggleBtn': function(e) {

            this.userPanelDropDown.isActive && this.open();

        }
    },

    render: function() {

        var template = require('templates/components/mainNavigation.jst');

        this.$el.html(template.render(this.viewData));
        this.$menuItems = this.$('.menu .item');

        this.userPanelDropDown = this.addView(new MainNavigation.UserPanelDropDown({
            el: this.$('.userPanel')
        }));

        this.$scrollerContainer = this.$('.nano');

        setTimeout(function() {
            this.$scrollerContainer.nanoScroller();
        }.bind(this), 0);

        this.trigger('afterRender');

        return this;

    },

    navigateToLink: function(e) {

        e.preventDefault();

        this.close(function() {
            this.followLink(e);
        });

        return this;

    },

    toggle: function() {

        return this.$el.hasClass('active') ? this.close() : this.open();

    },

    open: function() {

        this.$overlay = this.$overlay || $('<div>').addClass('mainNavigationOverlay').insertAfter(this.$el);

        this.$el.addClass('active');
        this.$overlay.addClass('active');
        this.addDismissListener('close');
        this.$scrollerContainer.nanoScroller();

        return this;

    },

    close: function(callback) {

        var wasOpened = this.$el.hasClass('active');

        this.$el.removeClass('active');
        this.$overlay && this.$overlay.removeClass('active');
        this.removeDismissListener('close');
        this.$scrollerContainer.nanoScroller();
        this.userPanelDropDown.close();

        if (callback) {
            wasOpened ? _.delay(callback.bind(this), 200) : callback.call(this);
        }

        return this;

    },

    getNavigationItems: function() {

        return [];

    },

    getUserNavigationItems: function() {

        return [];

    },

    getProjectCaption: function() {

        return 'Trikoder CMS';

    },

    getUserCaption: function() {

        return 'Username';

    },

    getBreadCrumbs: function(item) {

        var breadCrumbs = [];
        var selectedItem = item || this.selectedItem;

        _.each(this.getNavigationItems(app.get('router')), function(rootItem) {

            if (rootItem.alias === selectedItem) {

                breadCrumbs.push({name: rootItem.name, alias: rootItem.alias, url: rootItem.url});

            } else if (rootItem.subItems) {

                _.each(rootItem.subItems, function(subItem) {
                    if (subItem.alias === selectedItem) {
                        breadCrumbs.push({name: rootItem.name, alias: rootItem.alias, url: rootItem.url});
                        breadCrumbs.push({name: subItem.name, alias: subItem.alias, url: subItem.url});
                    }
                });

            }

        });

        return breadCrumbs;

    },

    setSelected: function(key) {

        this.selectedItem = key;

        this.$el.find('.selected, .opened').removeClass('selected').removeClass('opened');
        this.$menuItems
            .filter('.' + this.selectedItem + 'Link').addClass('selected')
            .parents('li:eq(1)').addClass('opened')
            .find('> .itemToggle').addClass('selected');

        return this;

    },

    getFlattenedNavigationItems: function() {

        return _.chain(this.viewData.navigationItems || this.getNavigationItems(app.get('router'))).map(function(item) {
            return item.subItems ? item.subItems : item;
        }).flatten().value();

    },

    showSearch: function() {

        serviceContainer.get('AppSearch', function(AppSearch) {

            if (!this.appSearch) {

                this.appSearch = new AppSearch({
                    items: _.map(this.getFlattenedNavigationItems(), function(item) {
                        return {caption: item.name, url: item.url};
                    })
                });

            }

            this.appSearch.open();

        }.bind(this));

        return this;

    }

});

MainNavigation.UserPanelDropDown = View.extend({

    events: {
        'click >.toggleBtn': function() {
            this.$el.hasClass('active') ? this.close() : this.open();
        }
    },

    open: function() {

        this.$el.addClass('active');
        this.isActive = true;
        this.addDismissListener('close');

        return this;

    },

    close: function() {

        this.$el.removeClass('active');
        this.isActive = false;
        this.removeDismissListener('close');

        return this;

    }

});

module.exports = MainNavigation;
