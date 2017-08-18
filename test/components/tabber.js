var assert = require('chai').assert;
var $ = require('jquery');
var Tabber = require('js/components/tabber');
var sinon = require('sinon');

describe('COMPONENT: Tabber', function() {

    var $layoutContainer = $('<div class="layoutContainer">').appendTo('body'),
        $tabContainer = $('<div>').appendTo($layoutContainer);

    $('<div class="panel" data-id="1">').appendTo($tabContainer);

    var tabber = new Tabber({
        el: $tabContainer,
        buildNavigation: true,
        onTabChange: function() {
            changedTab = true
        }
    });

    beforeEach(function() {

        changedTab = false;
        sandbox = sinon.sandbox.create();

    });

    afterEach(function() {

        sandbox.restore();

    });

    after(function() {

        tabber.remove();

    });

    it ('setup basic tabber with navigation', function() {

        tabber.$el.find('.tabBtn').trigger('click');

        assert.equal(tabber.$el.length, 1);
        assert.equal(tabber.$el.find('.tabNav').length, 1);
        assert.equal(changedTab, true);

    });

    it ('goes to tab by index', function() {

        tabber.goToTab(0);

        assert.equal(changedTab, true);

    });

    it ('goes to tab by index and url', function() {

        sandbox.stub($, 'get').callsFake(function() {

            var deferred = $.Deferred();

            return deferred.resolve('<p>Lorem ipsum dolor sit ament.</p>');

        });

        tabber.goToTab(1, '/');

        assert.equal(changedTab, true);

    });

});
