var $ = require('jquery');

var api = {

    http: $.ajax,

    ajax: function(config) {

        var deferred = $.Deferred();
        var requestConfig = $.extend({}, this.requestDefaults, config);
        var responseInterceptors = this.responseInterceptors;

        $.each({
            success: 'done',
            error: 'fail',
            complete: 'always'
        }, function(key, value) {
            deferred[value](requestConfig[key]);
            delete requestConfig[key];
        });

        this.http(requestConfig).done(function(data) {
            if (responseInterceptors && responseInterceptors.done) {
                responseInterceptors.done(data, deferred, requestConfig);
            } else {
                deferred.resolve(data);
            }
        }).fail(function(error) {
            if (responseInterceptors && responseInterceptors.fail) {
                responseInterceptors.fail(error, deferred, requestConfig);
            } else {
                deferred.reject(error);
            }
        });

        return deferred;

    },

    responseInterceptors: {},

    requestDefaults: {}

};

$.each(['get', 'post'], function(i, method) {

    api[method] = function(url, data, callback, type) {

        if ($.isFunction(data)) {
            type = type || callback;
            callback = data;
            data = undefined;
        }

        return api.ajax({
            type: method,
            url: url,
            data: data,
            success: callback,
            dataType: type
        });

    };
});

module.exports = api;
