var assert = require('chai').assert;
var $ = require('jquery');
var EntityModel = require('js/library/entity').Model;
var MapInput = require('inject-loader!js/formElements/map')({
    'js/library/bootData': function() {
        return 'AIzaSyBVqg9EqOqARXVIaKRSC7pJpVeHKDRoU2I';
    }
});

var model;

function waitForGoogleMap(callback) {

    if (typeof google !== 'undefined') {

        setTimeout(function() {
            callback();
        }, 50);

    } else {

        setTimeout(function() {
            waitForGoogleMap(callback);
        }, 50);

    }

}


beforeEach(function() {

    model = EntityModel.createFromApiData({
        data: {
            type: 'article',
            id: '1',
            attributes: {
                title: 'Article title',
                author: 'Mike Hammer',
                location: '45.42331231,44.124532523'
            }
        }
    });

});

describe('FORM ELEMENT: map element', function() {

    it('Render map element', function(done) {

        var mapInput = new MapInput();

        mapInput.render();

        waitForGoogleMap(function() {

            assert.equal(mapInput.$inputWrapper.is('.mapElementType1'), true);
            assert.equal(mapInput.$mapContainer.is('.container'), true);

            done();

        });

    });

    it('Setup google maps', function(done) {

        var mapInput = new MapInput({
            entityModel: model,
            options: {
                name: 'location',
                value: model.get('location')
            }
        });

        mapInput.render();

        waitForGoogleMap(function() {

            assert.equal(typeof mapInput.map !== 'undefined', true);

            done();

        });

    });

    it('On click change marker position', function(done) {

        var mapInput = new MapInput({
            entityModel: model,
            options: {
                name: 'location',
                value: model.get('location')
            }
        });

        mapInput.render();

        waitForGoogleMap(function() {

            google.maps.event.trigger(mapInput.map, 'click', {
              latLng: new google.maps.LatLng(0, 0)
            });

            assert.equal(mapInput.getValue(), '0,0');

            done();

        });

    });

    it('On drag change marker position', function(done) {

        var mapInput = new MapInput({
            entityModel: model,
            options: {
                name: 'location',
                value: model.get('location')
            }
        });

        mapInput.render();

        waitForGoogleMap(function() {

            google.maps.event.trigger(mapInput.marker, 'dragend', {
              latLng: new google.maps.LatLng(2, 2)
            });

            assert.equal(mapInput.getValue(), '2,2');

            done();

        });

    });

    it('Search input on enter keydown does nothing', function(done) {

        var mapInput = new MapInput({
            entityModel: model,
            options: {
                name: 'location',
                value: model.get('location')
            }
        });

        mapInput.render();

        waitForGoogleMap(function() {

            var e = $.Event('keydown');
                e.which = 13;

            mapInput.$el.find('.mapSearch input').trigger(e);

            done();

        });

    });

    it('Search change marker position', function(done) {

        var mapInput = new MapInput({
            entityModel: model,
            options: {
                name: 'location',
                value: model.get('location')
            }
        });

        mapInput.render();

        waitForGoogleMap(function() {

            var $input = mapInput.$el.find('.mapSearch input');

            $input.val('zagreb');

            google.maps.event.trigger($input.get(0), 'focus');
            google.maps.event.trigger($input.get(0), 'keydown', { keyCode: 13 });

            google.maps.event.addListener(mapInput.map, 'center_changed', function(e) {

                assert.equal(mapInput.getValue() !== '45.42331231,44.124532523', true);

                done();

            });

        });

    });

    it('Remove marker', function(done) {

        var mapInput = new MapInput({
            entityModel: model,
            options: {
                name: 'location',
                value: model.get('location')
            }
        });

        mapInput.render();

        waitForGoogleMap(function() {

            mapInput.$el.find('.removeMarker').trigger('click');

            assert.equal(mapInput.getValue(), null);
            assert.equal(typeof mapInput.marker, 'undefined');

            done();

        });

    });

    it('Map center on tab change', function(done) {

        var mapInput = new MapInput({
            entityModel: model,
            options: {
                name: 'location',
                value: model.get('location')
            }
        });

        mapInput.render();

        waitForGoogleMap(function() {

            google.maps.event.addListener(mapInput.map, 'resize', function(e) {

                done();

            });

            $(window).trigger('tabChange');

        });

    });

});
