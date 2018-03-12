var _ = require('underscore');

module.exports = {
    flatten: function(namespacedParams) {

        var formattedParams = {};

        _.each(namespacedParams, function(params, namespace) {

            if (_.isObject(params) && !_.isEmpty(params)) {

                _.each(params, function(value, key) {
                    formattedParams[namespace + '[' + key + ']'] = value;
                });

            } else {

                formattedParams[namespace] = params;

            }

        });

        return formattedParams;

    }
};
