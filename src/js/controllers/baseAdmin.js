var _ = require('underscore');
var app = require('../app');
var translate = require('../library/translate');
var template = require('../../templates/controllers/baseAdmin.jst');

module.exports = require('../library/view').extend({

    setPageTitle: function(title) {

        var breadCrumbs = this.getBreadCrumbs();
        var projectSufix = translate('project.urlSufix');

        if (!this.options || !this.options.isExternal) {
            if (breadCrumbs) {
                this.setBreadCrumbs(breadCrumbs);
                window.document.title = _.pluck(breadCrumbs, 'name').concat([title]).join(' / ') + projectSufix;
            } else {
                window.document.title = title + ' / ' + projectSufix;
            }
        }

        return this.setViewData('pageTitle', title);

    },

    getBreadCrumbs: function() {

        return this.resourceName ? app.get('mainNavigation').getBreadCrumbs(this.resourceName) : undefined;

    },

    setBreadCrumbs: function(breadCrumbs) {

        return this.setViewData('breadCrumbs', breadCrumbs);

    },

    cleanUpViews: function() {

        this.removeViews();
        this.$el.empty();

        return this;

    },

    render: function() {

        this.setViewData('projectCaption', app.get('mainNavigation').getProjectCaption());
        this.$el.html(template.render(this.viewData));

        return this;

    },

    setNavSelected: function(key) {

        app.trigger('selectNavIntent', key);

        return this;

    }

});
