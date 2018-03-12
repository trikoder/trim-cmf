var assert = require('chai').assert;
var $ = require('jquery');

//var Sort = require('js/components/sort');

describe.skip('COMPONENT: Sort', function() {

    //var $sortField = $('<nav class="sort sortType1">').appendTo('body');

    it ('setup sort with multiple sort options', function() {

        var sort = new Sort();

        //sort.$el.appendTo($sortField);

        assert.equal(sort.getDefaultSort(), undefined);

        sort.add([{
            label: 'Asc',
            field: 'asc'
        }, {
            label: 'Desc',
            field: 'desc'
        }]);

        sort.add({
            label: 'Date',
            field: 'date'
        });

        sort.createElement();
        sort.render();

        assert.equal(sort.hasMultipleSortOptions(), true);
        assert.equal(sort.getDefaultSort(), 'asc');

        sort.setSort('desc');
        assert.equal(sort.getSort(), 'desc');

        sort.$el.find('select').val('date').change();
        assert.equal(sort.$el.find('select').val(), 'date');

    });


});