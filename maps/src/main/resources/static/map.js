function initialize() {
	var mapOptions = {
		center: new google.maps.LatLng(46.947922, 7.444608),
		zoom: 14,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	var map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

	var blueCar = null;
	var redCar = null;

	google.maps.event.addListener(map, "rightclick", function(event) {
		var lat = event.latLng.lat();
		var lng = event.latLng.lng();
		console.log("Lat=" + lat + "; Lng=" + lng);
	});

	var moveCar = function(carColour, latlng) {
		var car = carColour === 'red' ? redCar : blueCar;
		
		if (!car) {
			car = new google.maps.Marker({
				position: new google.maps.LatLng(latlng.lat, latlng.lng),
				icon: 'car_'+carColour+'.png',
				map: map
			});
			if (carColour === 'red') {
				redCar = car;
			}
			else {
				blueCar = car;
			}
		}
		else {
			car.setPosition(new google.maps.LatLng(latlng.lat, latlng.lng));
		}
	}
	
	var serverPathUrl = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')+1);
	var wsURL = (window.location.protocol == "https:" ? "wss://" : "ws://") + window.location.host + serverPathUrl + "wamp";    
	
	var connection = new autobahn.Connection({
		url: wsURL
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
