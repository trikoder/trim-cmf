var translate = require('../library/translate');
var BaseController = require('./baseAdmin');

module.exports = BaseController.extend({

    pageNotFound: function() {

        var title = translate('errorPages.pageNotFound.title');
        var message = translate('errorPages.pageNotFound.message');

        this.setPageTitle(title + ' - ' + message).render();

        this.$el.append(
            '<div class="errorPageType1">' +
                '<div class="box">' +
                    '<h1>' + title + '</h1>' +
                    '<p>' + message + '</p>' +
                '</div>' +
            '</div>'
        );

    }

});
