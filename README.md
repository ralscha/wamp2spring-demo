Collection of example [wamp2spring](https://github.com/ralscha/wamp2spring) applications that show you the capabilities of WAMP and the library.
Not everything is developed by me. I found examples on the internet, replaced the connection part
with [autobahn-js](https://github.com/crossbario/autobahn-js) and the server part with a [Spring 5](http://projects.spring.io/spring-framework/) / [Spring Boot 2](http://projects.spring.io/spring-boot/) application.
In the source column you find a link to the original repository.

| Project | Description | Source | Online |
|---------|-------------|--------|--------|
| bandwidth | Displays received and sent bytes of the server network interface (eth0). The server sends this information periodically to all connected browsers. | [GitHub](https://github.com/pesarkhobeee/Realtime-Bandwidth-Grapher) | <a href="https://demo.rasc.ch/wamp2spring-demo-bandwidth/">:link:</a> |
| datachannel  | Establish RTCPeerConnection connections and send data over DataChannels. WAMP is used for the signalling process (WebRTC dance) |        | <a href="https://demo.rasc.ch/wamp2spring-demo-datachannel/">:link:</a> |
| earthquake | The server reads data from the <a href="https://earthquake.usgs.gov/">Earthquake Hazards Program</a> and sends it periodically to the clients. | [GitHub](https://github.com/bijukunjummen/si-spring-websockets) | <a href="https://demo.rasc.ch/wamp2spring-demo-earthquake/">:link:</a> |
| extjsgrid |  An Ext JS 6.5.1 application with a model that uses a WAMP proxy. Create, update and delete operations are broadcasted to all connected clients.  |        | <a href="https://demo.rasc.ch/wamp2spring-demo-extjsgrid/">:link:</a> |
| gauge | Server sends periodically random data to all connected browsers where the data is displayed with the gauge diagram from the [echarts](https://ecomfe.github.io/echarts-doc/public/en/index.html) library. |        | <a href="https://demo.rasc.ch/wamp2spring-demo-gauge/">:link:</a> |
| iss | The server reads periodically the position of the Internation Space Station from api.open-notify.org and sends the location to all connected browsers. |        | <a href="https://demo.rasc.ch/wamp2spring-demo-iss/">:link:</a> |
| maps | Server sends periodically coordinates to all connected clients that moves two car icons on a Google Maps. |        | <a href="https://demo.rasc.ch/wamp2spring-demo-maps/">:link:</a> |
| pirate | Port of a multiplayer game from a Envato Tuts+ tutorial. | [Tutorial](https://code.tutsplus.com/tutorials/create-a-multiplayer-pirate-shooter-game-in-your-browser--cms-23311)  | <a href="https://demo.rasc.ch/wamp2spring-demo-pirate/">:link:</a> |
| simple-chat | Simple chat application |        | <a href="https://demo.rasc.ch/wamp2spring-demo-simple-chat/">:link:</a> |
| smoothie | Server generates random data every second and sends it to all connected clients where the data is displayed with the [smoothie.js](http://smoothiecharts.org/) library. | [GitHub](https://github.com/joewalnes/smoothie) | <a href="https://demo.rasc.ch/wamp2spring-demo-smoothie/">:link:</a> |
| snake | Port of the WebSocket snake demo included in the Tomcat distribution. | [Homepage](http://tomcat.apache.org/) | <a href="https://demo.rasc.ch/wamp2spring-demo-snake/">:link:</a> |
| tail |  The server application follows the nginx access log, translates the ip address of new entries to latitude/longitude with the [GeoLite2 City](https://dev.maxmind.com/geoip/geoip2/geolite2/) database and sends the information to all connected clients. | [GitHub](https://github.com/stagas/maptail), [GitHub](https://github.com/mape/node-wargames) | <a href="https://demo.rasc.ch/wamp2spring-demo-tail/">:link:</a> |
| worldchat | A more sophisticated chat example where each user can select his language and the server translates the messages with the Google Translation API before it sends it to the other users.  | [GitHub](https://github.com/Grandclosing/WorldChat) | <a href="https://demo.rasc.ch/wamp2spring-demo-worldchat/">:link:</a> |







