var translate = require('js/library/translate');

module.exports = require('js/controllers/baseAdmin').extend({

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
