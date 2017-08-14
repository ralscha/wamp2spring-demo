function initialize() {
	var flightPlanCoordinates = [];
	var centered = false;
	
	var latlng = new google.maps.LatLng(0, 0);
	var mapOptions = {
		center: latlng,
		zoom: 7,
		mapTypeId: google.maps.MapTypeId.SATELLITE
	};
	var map = new google.maps.Map(document.getElementById("map"), mapOptions);
	var marker = new google.maps.Marker({		
		map: map,
		title: "Updating...",
		icon: 'saticon.gif'
	});

	function drawFlightPath(latlng) {
		var flightPath = new google.maps.Polyline({
			path: flightPlanCoordinates,
			geodesic: true,
			strokeColor: '#ffff00',
			strokeOpacity: 1.0,
			strokeWeight: 3
		});

		flightPath.setMap(map);
		marker.setPosition(latlng);
		if (!centered) {
			map.panTo(latlng);
			centered = true;
		}
	}
	
	var serverPathUrl = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
	var wsURL = (window.location.protocol == "https:" ? "wss://" : "ws://") + window.location.host + serverPathUrl + "wamp";

	var connection = new autobahn.Connection({
		url: wsURL
	});
	connection.onopen = function(session, details) {
		session.subscribe('location', function(arg, argkw) {			
			if (flightPlanCoordinates.length >= 2) {
				flightPlanCoordinates.shift();
			}
			
			var position = argkw.iss_position;
            var latlng = new google.maps.LatLng(position.latitude, position.longitude);
            flightPlanCoordinates.push(latlng);
            
            drawFlightPath(latlng);
		});
	};
	connection.open();

}