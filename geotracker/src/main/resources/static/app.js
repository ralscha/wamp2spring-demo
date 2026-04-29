let map;
let locationMarkers = [];
let stationaryCircles = [];
let currentLocationMarker;
let locationAccuracyCircle;
let path = [];
let previousPosition;

function createOsmStyle() {
  return {
    version: 8,
    sources: {
      openstreetmap: {
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

function featureCollection(features) {
  return {
    type: 'FeatureCollection',
    features: features
  };
}

function pointFeature(longitude, latitude) {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [ Number(longitude), Number(latitude) ]
    }
  };
}

function polygonFeature(coordinates) {
  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [ coordinates ]
    }
  };
}

function createCirclePolygon(longitude, latitude, radiusInMeters, steps) {
  const coordinates = [];
  const pointCount = steps || 64;
  const earthRadius = 6371008.8;
  const lng = Number(longitude);
  const lat = Number(latitude);
  const latRad = lat * Math.PI / 180;

  for (let i = 0; i <= pointCount; i++) {
    const angle = (i / pointCount) * Math.PI * 2;
    const dx = Number(radiusInMeters) * Math.cos(angle);
    const dy = Number(radiusInMeters) * Math.sin(angle);
    const pointLng = lng + (dx / (earthRadius * Math.cos(latRad))) * (180 / Math.PI);
    const pointLat = lat + (dy / earthRadius) * (180 / Math.PI);
    coordinates.push([ pointLng, pointLat ]);
  }

  return polygonFeature(coordinates);
}

function updateSource(name, data) {
  if (map && map.getSource(name)) {
    map.getSource(name).setData(data);
  }
}

function render() {
  updateSource('location-history', featureCollection(locationMarkers));
  updateSource('stationary-zones', featureCollection(stationaryCircles));
  updateSource('current-location', featureCollection(currentLocationMarker ? [ currentLocationMarker ] : []));
  updateSource('current-accuracy', featureCollection(locationAccuracyCircle ? [ locationAccuracyCircle ] : []));
  updateSource('path', featureCollection(path.length > 1 ? [ {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: path
    }
  } ] : []));
}

function init() {
  map = new maplibregl.Map({
    container: 'map',
    style: createOsmStyle(),
    center: [ -8.2, 39.6 ],
    zoom: 6
  });
  map.addControl(new maplibregl.NavigationControl(), 'top-right');

  map.on('load', () => {
    map.addSource('location-history', {
      type: 'geojson',
      data: featureCollection([])
    });
    map.addLayer({
      id: 'location-history',
      type: 'circle',
      source: 'location-history',
      paint: {
        'circle-radius': 7,
        'circle-color': 'green',
        'circle-opacity': 1,
        'circle-stroke-color': 'white',
        'circle-stroke-width': 3
      }
    });

    map.addSource('stationary-zones', {
      type: 'geojson',
      data: featureCollection([])
    });
    map.addLayer({
      id: 'stationary-zones',
      type: 'fill',
      source: 'stationary-zones',
      paint: {
        'fill-color': 'pink',
        'fill-opacity': 0.4
      }
    });

    map.addSource('current-location', {
      type: 'geojson',
      data: featureCollection([])
    });
    map.addLayer({
      id: 'current-location',
      type: 'circle',
      source: 'current-location',
      paint: {
        'circle-radius': 7,
        'circle-color': 'gold',
        'circle-opacity': 1,
        'circle-stroke-color': 'white',
        'circle-stroke-width': 3
      }
    });

    map.addSource('current-accuracy', {
      type: 'geojson',
      data: featureCollection([])
    });
    map.addLayer({
      id: 'current-accuracy',
      type: 'fill',
      source: 'current-accuracy',
      paint: {
        'fill-color': 'purple',
        'fill-opacity': 0.4
      }
    });

    map.addSource('path', {
      type: 'geojson',
      data: featureCollection([])
    });
    map.addLayer({
      id: 'path',
      type: 'line',
      source: 'path',
      paint: {
        'line-color': 'blue',
        'line-opacity': 0.4,
        'line-width': 3
      }
    });

    clear();
    startWampSession();
  });
}

function startWampSession() {
	const serverPathUrl = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
	const wsURL = (window.location.protocol == 'https:' ? 'wss://' : 'ws://') + window.location.host + serverPathUrl + 'wamp';

	const connection = new autobahn.Connection({
    url: wsURL,
    realm: ''
	});

	connection.onopen = (session, details) => {
    session.subscribe('demo.geotracker.clear', clear);
    session.subscribe('demo.geotracker.pos', arg => {
			handlePosition(arg[0]);
		});
    session.subscribe('demo.geotracker.stationary', arg => {
			handleStationary(arg[0]);
		});

		clear();

    session.call('demo.geotracker.getPositions').then(handlePositions);
    session.call('demo.geotracker.getStationaries').then(handleStationaries);
	};

	connection.open();
}

function normalizeRpcList(result) {
  if (Array.isArray(result)) {
    return result;
  }

  if (result && Array.isArray(result.args) && Array.isArray(result.args[0])) {
    return result.args[0];
  }

  return [];
}

function handlePositions(positions) {
  positions = normalizeRpcList(positions);

  for (const position of positions) {
    handlePosition(position);
  }

  if (positions.length > 0) {
    const lastPos = positions[positions.length - 1];
    map.setCenter([ Number(lastPos.longitude), Number(lastPos.latitude) ]);
  }
}

function handleStationaries(stationaries) {
  stationaries = normalizeRpcList(stationaries);

  for (const stationary of stationaries) {
    handleStationary(stationary);
  }
}

function handlePosition(position) {
  const longitude = Number(position.longitude);
  const latitude = Number(position.latitude);

  currentLocationMarker = pointFeature(longitude, latitude);
  locationAccuracyCircle = position.accuracy ? createCirclePolygon(longitude, latitude, position.accuracy) : null;

  if (previousPosition) {
    locationMarkers.push(pointFeature(previousPosition.longitude, previousPosition.latitude));
    if (locationMarkers.length > 100) {
      locationMarkers.shift();
    }
  }
  else {
    map.setCenter([ longitude, latitude ]);
    if (map.getZoom() < 15) {
      map.setZoom(15);
    }
  }

  path.push([ longitude, latitude ]);
  if (path.length > 100) {
    path.shift();
  }

  previousPosition = position;
  render();
}

function handleStationary(stationary) {
  if (stationary.radius) {
    stationaryCircles.push(createCirclePolygon(stationary.longitude, stationary.latitude, stationary.radius));

    if (stationaryCircles.length > 10) {
      stationaryCircles.shift();
    }

    render();
  }
}

function clear() {
  locationMarkers = [];
  stationaryCircles = [];
  currentLocationMarker = null;
  locationAccuracyCircle = null;
  path = [];
  previousPosition = null;
  render();
}

window.addEventListener('load', init);
