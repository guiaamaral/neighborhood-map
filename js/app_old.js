// Global variables
var map;
var infoWindow;


// Places to show on map
var locations = [
    {
        title: 'Grainne\'s Irish Pub',
        fsquareid: '4b317fc8f964a520ff0725e3',
        lat: -22.8993283,
        lng: -47.0491807
    },
    {
        title: 'Brexó Bar e Cozinha',
        fsquareid: '58376e7323188e7d9d05b795',
        lat: -22.8985755,
        lng: -47.0495088
    },
    {
        title: 'Boteco São Bento',
        fsquareid: '4b510337f964a520893d27e3',
        lat: -22.894496,
        lng: -47.053935
    },
    {
        title: 'Seo Rosa',
        fsquareid: '4b48d1b2f964a520895826e3',
        lat: -22.899291,
        lng: -47.050309
    },
    {
        title: 'Club Apô',
        fsquareid: '4b525c7ff964a5204e7927e3',
        lat: -22.8957509,
        lng: -47.057148
    },
    {
        title: 'Giovannetti',
        fsquareid: '4b9415d1f964a520ff6634e3',
        lat: -22.9017339,
        lng: -47.0562716
    },
    {
        title: 'City Bar',
        fsquareid: '4b802c25f964a520165930e3',
        lat: -22.9013259,
        lng: -47.053819
    },
    {
        title: 'Bráz Pizzaria',
        fsquareid: '4b3a7ef5f964a520a26825e3',
        lat: -22.900362,
        lng: -47.05354
    },
    {
        title: 'Cantina Fellini',
        fsquareid: '4b532b6ef964a520f79027e3',
        lat: -22.893769,
        lng: -47.0524546
    },
    {
        title: 'Cafezal em Flor',
        fsquareid: '4bf5efc34d5f20a1618d98fe',
        lat: -22.8914368,
        lng: -47.055777
    }
];

var Location = function(location) {
    var self = this;

    // get info from location array and transform in functions using Knockout
    self.title = ko.observable(location.title);
    self.lat = ko.observable(location.lat);
    self.lng = ko.observable(location.lng);
    self.fsquareid = ko.observable(location.fsquareid);
    self.active = ko.observable(false);

    self.getContent = function(callback) {
        // if self.content has setted, return the value
        if (self.content){
            return self.content();
        }

        // get and format date to use on FourSquare API request
        var utc = new Date().toJSON().slice(0,10).replace(/-/g,'');

        // connect to FourSquare API
        var foursquareUrl = 'https://api.foursquare.com/v2/venues/' + self.fsquareid() +
            '?client_id=PM2GJF5A5VO0ERYO5J2KTLW2IU0SU2LRQTLHVMQT4NES1TZJ' +
            '&client_secret=YLHBMIB1KVPBZV0W30APQJBPKGTLZDCE5TMB4L4HYB5WFKFZ' +
            '&v=' + utc;
        jQuery.ajax({
            url: foursquareUrl,
            dataType: 'json'
        })
        .done(function(data) {
            var fsquareContent = '';

            // if api return data proceed and store content into fsquareContent variable
            if (data) {
                var fsquareQuery =  data.response.venue;
                $.each(fsquareQuery, function(i, venue) {
                    fsquareContent =
                        '<img src="' + fsquareQuery.bestPhoto.prefix +
                        'width200' + fsquareQuery.bestPhoto.suffix + '"><br>' +
                        '<h1>' + fsquareQuery.name + '<small><em> ' + fsquareQuery.categories[0].name + '</em></small></h1>' +
                        '<p>' + fsquareQuery.location.address +
                        '<br>' + fsquareQuery.location.city + ', ' + fsquareQuery.location.state +
                        '<br><hr>Nota: <span class="rating" style="background: #' +
                        fsquareQuery.ratingColor + '">' + fsquareQuery.rating + '</span>' +
                        '<br>Avaliado por: ' + fsquareQuery.ratingSignals + ' usuários' +
                        '<br>Preço segundo clientes: ' + fsquareQuery.price.message + '</p>' +
                        '<a href="' + fsquareQuery.canonicalUrl + '" target="_blank">' +
                        '<small>Veja mais no Foursquare</small></a>';
                    self.content = ko.observable(fsquareContent);
                });
            }
            // if fsquareContent has data show content else show error message
            if (fsquareContent !== '') {
                self.content = ko.observable(fsquareContent);
            } else {
                self.content = ko.observable('<p>Ocorreu um problema ao conectar com o Foursquare</p>');
            }
        })
        // if api fail show error message
        .fail(function() {
            console.log("error in ajax call to FourSquare's api");
            self.content = ko.observable('<p>Ocorreu um problema ao conectar com o Foursquare</p>');
        })
        .always(function() {
            if (typeof callback !== "undefined"){
                callback(self);
            }
        });
        // return a spinner while the API is loading
        return '<p><span class="spinner"></span></p>';
    };

    // create marker for location object on object contruction
    self.createMarker = (function() {

        // create markers for location
        self.marker = new google.maps.Marker({
            position: {lat: self.lat(), lng: self.lng()},
            map: map,
            title: self.title()
        });

        // extend map bounds with new marker
        map.bounds.extend(self.marker.position);

        // add click event listener to marker
        self.marker.addListener('click', function() {
            selectLocation(self);
        });

    })();
};

// Google Maps
function initMap() {
    // initialize map, hide navigation controls and set custom style
    map = new google.maps.Map(document.getElementById('map'), {
        mapTypeControl: false,
        disableDefaultUI: true,
        styles: blackStyle
    });

    // initialize bounds variable
    map.bounds = new google.maps.LatLngBounds();

    // initialize infoWindow
    infoWindow = new google.maps.InfoWindow({
        content: ''
    });

    // button to close infoWindow
    google.maps.event.addListener(infoWindow, 'closeclick', function(){
        resetActiveState();

        // open nav when close infoWindow
        if ( $(window).width() < 810) {
            self.openNav();
        }
    });

    // add eventlistener to resize map when resizes the browser
    google.maps.event.addDomListener(window, 'resize', function() {
        map.fitBounds(map.bounds);
    });
}

var ViewModel = function() {
    var self = this;

    // show map if load properly
    this.mapNotLoaded = ko.observable(false);

    // initialize observableArray on locationsList
    this.locationsList = ko.observableArray([]);

    // add location objects to the locationsList
    locations.forEach(function(location) {
        self.locationsList.push( new Location(location));
    });

    // fit map to new bounds
    map.fitBounds(map.bounds);

    // initialize current location
    this.currentLocation = ko.observable(locationsList()[0]);

    // initialize searchTerm which is used to filter the locations
    this.searchTerm = ko.observable('');

    // reset any active state
    this.resetActiveState = function() {
        self.currentLocation().active(false);
        self.currentLocation().marker.setAnimation(null);
        infoWindow.close();
    };

    // compute the list of locations filtered
    this.filteredLocations = ko.computed(function() {
        // reset any active state
        resetActiveState();

        // return a list of locations filtered
        return self.locationsList().filter(function (location) {
            var display = true;
            if (self.searchTerm() !== ''){
                // check if the location name contains the term searched
                if (location.title().toLowerCase().indexOf(self.searchTerm().toLowerCase()) !== -1){
                    display = true;
                }else {
                    display = false;
                }
            }

            // toggle map marker based on the filter
            location.marker.setVisible(display);

            return display;
        });
    });

    // function that trigger a location click
    this.selectLocation = function(clickedLocation) {
        if (self.currentLocation() == clickedLocation && self.currentLocation().active() === true) {
            resetActiveState();
            return;
        }

        // reset any active state
        resetActiveState();

        // update currentLocation
        self.currentLocation(clickedLocation);

        // activate new currentLocation
        self.currentLocation().active(true);

        // close nav when open infoWindow
        // open nav when close infoWindow
        if ( $(window).width() < 810) {
            self.closeNav();
        }

        // bounce marker
        self.currentLocation().marker.setAnimation(google.maps.Animation.BOUNCE);

        // open infoWindow for the current location
        infoWindow.setContent(self.currentLocation().getContent(function(l){
            // This is a call back function passed to Location.getContent()
            // When Location has finished getting info from external API it will call this function
            // check if infoWindow is still open for the location calling this call back function
            if (self.currentLocation() == l){
                infoWindow.setContent(l.content());
            }
        }));
        infoWindow.open(map, self.currentLocation().marker);

        // center map on current marker
        map.panTo(self.currentLocation().marker.position);
    };

    // function that close nav list
    this.closeNav = function() {
        $("#nav").css("width", "0");
        google.maps.event.trigger(map, 'resize');
        map.fitBounds(map.bounds);
    };

    // function that open nav list
    this.openNav = function() {
        if ( $(window).width() > 810) {
            $("#nav").css("width", "30%");
        } else {
            $("#nav").css("width", "70%");
        }
        google.maps.event.trigger(map, 'resize');
        map.fitBounds(map.bounds);
    };
};

// This is called by the Google Maps Api as a callback
var mapsApp = function() {
    initMap();
    ko.applyBindings(ViewModel);
};

// Fallback for Google Maps Api
function googleMapsApiError(){
    console.log('Erro: a API do Google maps não pôde ser carregada');
    $('body').prepend('<p id="map-error">Nos desculpe, houve um problema ao carregar a API do Google Maps.</p>');
}