var $ = require('jquery');
var BaseElement = require('../formElements/baseElement');
var GoogleMapsLoader = require('google-maps');
var bootData = require('../library/bootData');
var app = require('../app');
var translate = require('../library/translate');
var google;

var loadGoogleMaps = function() {

    if (!loadGoogleMaps.deferred) {

        loadGoogleMaps.deferred = $.Deferred();

        GoogleMapsLoader.KEY = bootData('googleMapsApiKey');
        GoogleMapsLoader.LIBRARIES = ['places'];
        GoogleMapsLoader.LANGUAGE = app.getLocale();

        GoogleMapsLoader.load(function(googleLib) {
            google = googleLib;
            loadGoogleMaps.deferred.resolve();
        });
    }

    return loadGoogleMaps.deferred;

};

module.exports = BaseElement.extend({

    elementType: 'map',

    defaults: {
        zoom: 12,
        delimiter: ',',
        initialLat: '45.79815157817745',
        initialLng: '15.970237255096436',
        search: true,
        mapOptions: {}
    },

    events: {
        'tabChange window': function() {
            if (google && this.map) {
                google.maps.event.trigger(this.map, 'resize');
                this.map.setCenter(this.getLatLng());
            }
        },
        'click .removeMarker': function() {

            this.setValue(null);
            this.map.controls[google.maps.ControlPosition.TOP_RIGHT].clear();

            this.marker.setMap(null);
            delete this.marker;

        }
    },

    whenMapApiLoaded: function(callback) {

        return loadGoogleMaps().done(callback.bind(this));

    },

    render: function() {

        BaseElement.prototype.render.call(this);

        this.$inputWrapper.empty().addClass('mapElementType1');
        this.$mapContainer = $('<div />').addClass('container').appendTo(this.$inputWrapper);

        this.whenMapApiLoaded(function() {
            setTimeout(this.setupMap.bind(this), 0);
        });

    },

    getLatLng: function() {

        var elementValue = this.getValue();
        var values = elementValue ? elementValue.split(this.options.delimiter) : [this.options.initialLat, this.options.initialLng];

        return new google.maps.LatLng(
            parseFloat(values[0]),
            parseFloat(values[1])
        );

    },

    setupMap: function() {

        var self = this;
        var latLng = this.getLatLng();

        this.map = new google.maps.Map(this.$mapContainer.get(0), $.extend({
            center: latLng,
            zoom: this.options.zoom,
            disableDefaultUI: true
        }, this.options.mapOptions));

        if (this.getValue()) {
            this.setPosition(latLng);
        }

        google.maps.event.addListener(this.map, 'click', function(e) {
            self.setPosition(e.latLng).setValue(e.latLng);
        });

        if (this.options.search) {
            this.setupSearch();
        }

    },

    setupSearch: function() {

        var searchPlaceholder = translate('formElements.map.searchPlaceholder');
        var $mapSearch = $('<div class="mapSearch iconSearch"></div>');
        var $input = $('<input placeholder="' + searchPlaceholder + '" type="text" />').appendTo($mapSearch);

        $input.on('keydown', function(e) {
            if (e.which === 13) { return false; }
        });

        this.map.controls[google.maps.ControlPosition.TOP_LEFT].push($mapSearch.get(0));

        var searchBox = new google.maps.places.SearchBox($input.get(0));

        google.maps.event.addListener(searchBox, 'places_changed', function() {

            var location = searchBox.getPlaces()[0].geometry.location;
            var latLng = new google.maps.LatLng(
                parseFloat(location.lat()),
                parseFloat(location.lng())
            );

            this.setPosition(latLng).setValue(latLng);
            this.map.panTo(latLng);

        }.bind(this));

    },

    setupRemoveMarker: function() {

        var buttonText = translate('formElements.map.removeMarkerCaption');
        var $button = $('<button type="button" class="removeMarker nBtn iconClose">' + buttonText + '</button>');

        this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push($button.get(0));

    },

    setPosition: function(latLng) {

        var self = this;

        if (!this.marker) {

            this.marker = new google.maps.Marker({
                map: this.map,
                title: 'Location',
                draggable: true,
                position: latLng
            });

            google.maps.event.addListener(this.marker, 'dragend', function(e) {
                self.setValue(e.latLng);
            });

            this.setupRemoveMarker();

        }

        this.marker.setPosition(latLng);

        return this;

    },

    setValue: function(value, options) {

        if (google && value instanceof google.maps.LatLng) {
            value = value.lat() + this.options.delimiter + value.lng();
        }

        return BaseElement.prototype.setValue.call(this, value, options);

    }

});
