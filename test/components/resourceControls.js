var assert = require('chai').assert;
var $ = require('jquery');
var ResourceControls = require('js/components/resourceControls');

describe('COMPONENT: Resource controls', function() {

    var $layoutContainer = $('<div class="layoutContainer">').appendTo('body');

    var resourceControls = new ResourceControls();
    resourceControls.appendTo($layoutContainer);

    var actionCalled = false;

    after(function() {

        resourceControls.remove();

    });

    it ('setup resource controls', function() {

        resourceControls.addControl({
            tagName: 'control1',
            className: 'btnControl',
            action: function() {
                actionCalled = true;
            }
        });

        resourceControls.$el.find('.btnControl').trigger('click');

        assert.equal(resourceControls.$el.length, 1);
        assert.equal(resourceControls.controlsCounter, 1);
        assert.equal(resourceControls.hasControls(), true);
        assert.equal(actionCalled, true);

    });

    it ('support dropdowns', function() {

        resourceControls.addDropdownControl({
            items: ['test1', 'test2']
        });

        assert.equal(resourceControls.controlsCounter, 2);

        resourceControls.$el.find('.toggleBtn').trigger('click');
        assert.isTrue($('.dropdownControls').hasClass('active'));

        resourceControls.$el.find('.toggleBtn').trigger('click');
        assert.isFalse($('.dropdownControls').hasClass('active'));

    });

    it ('support links', function() {

        resourceControls.addControl({
            className: 'linkControl',
            url: 'www.test.com'
        });

        assert.equal(resourceControls.controlsCounter, 3);
        assert.equal(resourceControls.$el.find('.linkControl').length, 1);

    });

});