var DateTimeElement = require('js/listElements/dateTime');

module.exports = DateTimeElement.extend({

    tagName: 'p',
    className: 'dateListItemType1',
    elementType: 'date',

    defaults: {
        format: 'DD.MM.YYYY'
    }

});
