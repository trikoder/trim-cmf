var _ = require('underscore');
var BaseMedia = require('js/formElements/baseMedia');
var router = require('js/app').get('router');

_.extend(BaseMedia.prototype, {

    getUploadUrl: function() {
        return router.apiUrl('media') + '/upload';
    }

});

module.exports = BaseMedia;
