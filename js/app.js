// Variable to map
var map;

// Variable to infoWindow
var infoWindow;

// Variable with custom map style get from snazzymaps.com
var blackStyle = [
    {
        "featureType": "all",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "saturation": 36
            },
            {
                "color": "#000000"
            },
            {
                "lightness": 40
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#000000"
            },
            {
                "lightness": 16
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "lightness": 20
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "lightness": 17
            },
            {
                "weight": 1.2
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "lightness": 20
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "lightness": 21
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "lightness": 17
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "lightness": 29
            },
            {
                "weight": 0.2
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "lightness": 18
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "lightness": 16
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "lightness": 19
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "lightness": 17
            }
        ]
    }
];

// Variable with places
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
        title: 'City Bar',
        fsquareid: '4b802c25f964a520165930e3',
        lat: -22.9013259,
        lng: -47.053819
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

// Variable to store markers to show on map
var markers = [];

// Function that observe locations data and create marker
var Location = function(location) {
    var self = this;

    // Get info from locations array
    self.title = ko.observable(location.title);
    self.fsquareid = ko.observable(location.fsquareid);
    self.lat = ko.observable(location.lat);
    self.lng = ko.observable(location.lng);

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
    }).done(function(data) {
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
            });
        }
        self.content = ko.observable(fsquareContent);
        console.log(self.content())
    }).fail(function() {
        self.content = ko.observable('<p>Ocorreu um problema ao conectar com o Foursquare</p>');
    });

    // Create marker and display on map
    var marker = new google.maps.Marker({
        position: {lat: self.lat(), lng: self.lng()},
        animation: google.maps.Animation.DROP,
        title: self.title(),
        map: map
    });
    markers.push(marker);

    infoWindow = new google.maps.InfoWindow({
        content: self.content,
        maxWidth: 350
    });

    marker.addListener('click', function() {
        infoWindow.open(map, marker);
    });
};

var ViewModel = function() {
    var self = this;

    // Observable that get the array of locations
    this.locationList = ko.observableArray([]);

    // Add location objects to the locationList
    locations.forEach(function(location) {
        self.locationList.push( new Location(location));
    });

    // Observe the search term
    self.searchTerm = ko.observable('');
    // Compute the list of search result
    self.searchResults = ko.computed(function () {
        var filter = self.searchTerm().toLowerCase();

        // Return a list of locations by search term
        if (!filter) {
            return self.locationList();
        } else {
            return ko.utils.arrayFilter(self.locationList(), function (location) {
                return location.title().toLowerCase().indexOf(filter) !== -1;
            });
        }
    });
};

function initMap() {
    // Initialize map, hide navigation controls and set custom style
    map = new google.maps.Map(document.getElementById('map'), {
        mapTypeControl: false,
        disableDefaultUI: true,
        styles: blackStyle,
        center: {
            lat: -22.8945359,
            lng: -47.0539138
        },
        zoom: 16
    });
};

// This is called by the Google Maps Api as a callback
var initApp = function() {
    initMap();
    ko.applyBindings( new ViewModel() );
};