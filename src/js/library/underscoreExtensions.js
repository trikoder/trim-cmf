var _ = require('underscore');

_.mixin({

    capitalize: function(string) {
        return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
    },

    limit: function(string, limit, sufix) {

        limit = typeof limit !== 'undefined' ? limit : 100;
        sufix = sufix || '...';

        if (string.length > limit) {
            return string.substring(0, limit) + sufix;
        } else {
            return string;
        }

    },

    words: function(string, limit, sufix) {

        var words = string.split(' ').filter(function(item) {
            return item && item !== '\n';
        });

        limit = typeof limit !== 'undefined' ? limit : 20;
        sufix = sufix || '...';

        if (words.length > limit) {
            return words.slice(0, limit).join(' ') + sufix;
        } else {
            return string;
        }

    },

    stripTags: function(html) {

        var div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';

    }

});

module.exports = _;
