let map;
let locationMarkers = [];
let stationaryCircles = [];
let currentLocationMarker;
let locationAccuracyCircle;
let path;
let previousPosition;

function init() { 
  loadMap();
  startWampSession();
}

function loadMap() {
  const latLng = new google.maps.LatLng(39, 34);

  const mapOptions = {
    center: latLng,
    zoom: 3,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }

  map = new google.maps.Map(document.getElementById("map"), mapOptions);
}

function startWampSession() {
	const serverPathUrl = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
	const wsURL = (window.location.protocol == "https:" ? "wss://" : "ws://") + window.location.host + serverPathUrl + "wamp";

	const connection = new autobahn.Connection({
		url: wsURL
	});

	connection.onopen = (session, details) => {
		session.subscribe('clear', clear);
		session.subscribe('pos', arg => {
			handlePosition(arg[0]);			
		});
		session.subscribe('stationary', arg => {
			handleStationary(arg[0]);
		});
		
		clear();
		
		session.call('getPositions').then(handlePositions);
		session.call('getStationaries').then(handleStationaries);
	};

	connection.open();
}

function handlePositions(positions) {
  for (let position of positions) {
    handlePosition(position);
  }
  
  if (positions.length > 0) {
    const lastPos = positions[positions.length - 1];
    const latlng = new google.maps.LatLng(lastPos.latitude, lastPos.longitude);
    map.setCenter(latlng);
  }
}

function handleStationaries(stationaries) {
  for (const stationary of stationaries) {
    handleStationary(stationary);
  }
}

function handlePosition(position) {
  const latlng = new google.maps.LatLng(position.latitude, position.longitude);

  if (!currentLocationMarker) {
    currentLocationMarker = new google.maps.Marker({
      map: map,
      position: latlng,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 7,
        fillColor: 'gold',
        fillOpacity: 1,
        strokeColor: 'white',
        strokeWeight: 3
      }
    });
    locationAccuracyCircle = new google.maps.Circle({
      fillColor: 'purple',
      fillOpacity: 0.4,
      strokeOpacity: 0,
      map: map,
      center: latlng,
      radius: position.accuracy
    });
  }
  else {
    currentLocationMarker.setPosition(latlng);
    locationAccuracyCircle.setCenter(latlng);
    locationAccuracyCircle.setRadius(position.accuracy);
  }

  if (previousPosition) {
    locationMarkers.push(new google.maps.Marker({
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 7,
        fillColor: 'green',
        fillOpacity: 1,
        strokeColor: 'white',
        strokeWeight: 3
      },
      map: map,
      position: new google.maps.LatLng(previousPosition.latitude, previousPosition.longitude)
    }));

    if (locationMarkers.length > 100) {
      const removedMarker = locationMarkers.shift();
      removedMarker.setMap(null);
    }
  }
  else {
    map.setCenter(latlng);
    if (map.getZoom() < 15) {
      map.setZoom(15);
    }
  }

  if (!path) {
    path = new google.maps.Polyline({
      map: map,
      strokeColor: 'blue',
      strokeOpacity: 0.4
    });
  }
  const pathArray = path.getPath();
  pathArray.push(latlng);
  if (pathArray.getLength() > 100) {
    pathArray.removeAt(0);
  }

  previousPosition = position;
}

function handleStationary(stationary) {
  if (stationary.radius) {
	  const stationaryCircle = new google.maps.Circle({
	    fillColor: 'pink',
	    fillOpacity: 0.4,
	    strokeOpacity: 0,
	    map: map,
	    center: new google.maps.LatLng(stationary.latitude, stationary.longitude),
	    radius: stationary.radius
	  });
	  stationaryCircles.push(stationaryCircle);
	
	  if (stationaryCircles.length > 10) {
	    const removedCircle = stationaryCircles.shift();
	    removedCircle.setMap(null);
	  }
  }
}

function clear() {
  locationMarkers.forEach(r => r.setMap(null));
  locationMarkers = [];
  previousPosition = null;

  stationaryCircles.forEach(r => r.setMap(null));
  stationaryCircles = [];

  if (currentLocationMarker) {
    currentLocationMarker.setMap(null);
    currentLocationMarker = null;
  }

  if (locationAccuracyCircle) {
    locationAccuracyCircle.setMap(null);
    locationAccuracyCircle = null;
  }

  if (path) {
    path.setMap(null);
    path = null;
  }
}
