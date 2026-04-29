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

function lineFeature(coordinates) {
	if (coordinates.length < 2) {
		return {
			type: 'FeatureCollection',
			features: []
		};
	}

	return {
		type: 'FeatureCollection',
		features: [ {
			type: 'Feature',
			geometry: {
				type: 'LineString',
				coordinates: coordinates
			}
		} ]
	};
}

function initialize() {
	var flightPlanCoordinates = [];
	var centered = false;
	var map = new maplibregl.Map({
		container: 'map',
		style: createOsmStyle(),
		center: [ 0, 0 ],
		zoom: 2
	});
	map.addControl(new maplibregl.NavigationControl(), 'top-right');

	var markerElement = document.createElement('img');
	markerElement.src = 'saticon.gif';
	markerElement.alt = 'ISS';
	markerElement.title = 'Updating...';
	markerElement.style.width = '40px';
	markerElement.style.height = '40px';

	var marker = new maplibregl.Marker({
		element: markerElement,
		anchor: 'center'
	}).setLngLat([ 0, 0 ]).addTo(map);

	function drawFlightPath(coordinates) {
		marker.setLngLat(coordinates);
		if (map.getSource('flight-path')) {
			map.getSource('flight-path').setData(lineFeature(flightPlanCoordinates));
		}
		if (!centered) {
			map.easeTo({ center: coordinates, zoom: 3 });
			centered = true;
		}
	}

	map.on('load', function() {
		map.addSource('flight-path', {
			type: 'geojson',
			data: lineFeature([])
		});
		map.addLayer({
			id: 'flight-path',
			type: 'line',
			source: 'flight-path',
			paint: {
				'line-color': '#ffff00',
				'line-opacity': 1,
				'line-width': 3
			}
		});

		var serverPathUrl = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
		var wsURL = (window.location.protocol == 'https:' ? 'wss://' : 'ws://') + window.location.host + serverPathUrl + 'wamp';

		var connection = new autobahn.Connection({
			url: wsURL,
			realm: ''
		});
		connection.onopen = function(session, details) {
			session.subscribe('demo.iss.location', function(arg, argkw) {
				if (flightPlanCoordinates.length >= 2) {
					flightPlanCoordinates.shift();
				}

				var position = argkw.iss_position;
				var coordinates = [ Number(position.longitude), Number(position.latitude) ];
				flightPlanCoordinates.push(coordinates);

				drawFlightPath(coordinates);
			});
		};
		connection.open();
	});
}