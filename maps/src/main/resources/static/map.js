function createOsmStyle() {
	return {
		version: 8,
		sources: {
			'openstreetmap': {
				type: 'raster',
				tiles: [
					'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
					'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
					'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
				],
				tileSize: 256,
				attribution: '&copy; OpenStreetMap contributors'
			}
		},
		layers: [ {
			id: 'osm',
			type: 'raster',
			source: 'openstreetmap'
		} ]
	};
}

function createCarMarker(map, carColour, latlng) {
	var element = document.createElement('img');
	element.src = 'car_' + carColour + '.png';
	element.alt = carColour + ' car';
	element.style.width = '32px';
	element.style.height = '32px';
	return new maplibregl.Marker({
		element: element,
		anchor: 'center'
	}).setLngLat([ latlng.lng, latlng.lat ]).addTo(map);
}

function initialize() {
	var map = new maplibregl.Map({
		container: 'map_canvas',
		style: createOsmStyle(),
		center: [ 7.444608, 46.947922 ],
		zoom: 14
	});
	map.addControl(new maplibregl.NavigationControl(), 'top-right');

	var blueCar = null;
	var redCar = null;

	map.on('contextmenu', function(event) {
		console.log('Lat=' + event.lngLat.lat + '; Lng=' + event.lngLat.lng);
	});

	var moveCar = function(carColour, latlng) {
		var car = carColour === 'red' ? redCar : blueCar;
		var coordinates = [ Number(latlng.lng), Number(latlng.lat) ];

		if (!car) {
			car = createCarMarker(map, carColour, latlng);
			if (carColour === 'red') {
				redCar = car;
			}
			else {
				blueCar = car;
			}
		}
		else {
			car.setLngLat(coordinates);
		}
	};

	var serverPathUrl = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
	var wsURL = (window.location.protocol == 'https:' ? 'wss://' : 'ws://') + window.location.host + serverPathUrl + 'wamp';

	var connection = new autobahn.Connection({
		url: wsURL,
		realm: ''
	});
	connection.onopen = function(session, details) {
		session.subscribe('map.blue', function(arg, argkw) {
			moveCar('blue', argkw);
		});
		session.subscribe('map.red', function(arg, argkw) {
			moveCar('red', argkw);
		});
	};
	connection.open();
}
