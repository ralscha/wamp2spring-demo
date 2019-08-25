Collection of example [wamp2spring](https://github.com/ralscha/wamp2spring) applications that show you the capabilities of WAMP and the library.
Not everything is developed by me. I found examples on the internet, replaced the connection part
with [autobahn-js](https://github.com/crossbario/autobahn-js) and the server part with a [Spring 5](http://projects.spring.io/spring-framework/) / [Spring Boot 2](http://projects.spring.io/spring-boot/) application.
In the source column you find a link to the original repository.

| Project | Description | Source | 
|---------|-------------|--------|
| bandwidth | Displays received and sent bytes of the server network interface (eth0). The server sends this information periodically to all connected browsers. | [GitHub](https://github.com/pesarkhobeee/Realtime-Bandwidth-Grapher) | 
| datachannel  | Establish RTCPeerConnection connections and send data over DataChannels. WAMP is used for the signalling process (WebRTC dance) |        | 
| earthquake | The server reads data from the <a href="https://earthquake.usgs.gov/">Earthquake Hazards Program</a> and sends it periodically to the clients. | [GitHub](https://github.com/bijukunjummen/si-spring-websockets) | 
| extjsgrid |  An Ext JS 6.5.1 application with a model that uses a WAMP proxy. Create, update and delete operations are broadcasted to all connected clients.  |        |
| gauge | Server sends periodically random data to all connected browsers where the data is displayed with the gauge diagram from the [echarts](https://ecomfe.github.io/echarts-doc/public/en/index.html) library. |        | 
| iss | The server reads periodically the position of the International Space Station from api.open-notify.org and sends the location to all connected browsers. |        | 
| maps | Server sends periodically coordinates to all connected clients that move two car icons on a Google Maps. |        | 
| pirate | Port of a multiplayer game from an Envato Tuts+ tutorial. | [Tutorial](https://code.tutsplus.com/tutorials/create-a-multiplayer-pirate-shooter-game-in-your-browser--cms-23311)  | 
| simple-chat | Simple chat application |        | 
| smoothie | Server generates random data every second and sends it to all connected clients where the data is displayed with the [smoothie.js](http://smoothiecharts.org/) library. | [GitHub](https://github.com/joewalnes/smoothie) |
| snake | Port of the WebSocket snake demo included in the Tomcat distribution. | [Homepage](http://tomcat.apache.org/) | 
| tail |  The server application follows the Nginx access log, translates the IP address of new entries to latitude/longitude with the [GeoLite2 City](https://dev.maxmind.com/geoip/geoip2/geolite2/) database and sends the information to all connected clients. | [GitHub](https://github.com/stagas/maptail), [GitHub](https://github.com/mape/node-wargames) | 
| worldchat | A more sophisticated chat example where each user can select his language and the server translates the messages with the Google Translation API before it sends it to the other users.  | [GitHub](https://github.com/Grandclosing/WorldChat) |







