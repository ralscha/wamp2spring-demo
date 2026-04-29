package ch.rasc.wamp2spring.demo;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import ch.rasc.wamp2spring.WampPublisher;
import ch.rasc.wamp2spring.annotation.WampProcedure;
import ch.rasc.wamp2spring.pubsub.SubscriptionRegistry;
import tools.jackson.databind.ObjectMapper;

@Service
public class EarthquakeService {

	private final static String pastHour = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson";

	private static final String INITIAL_LOAD_PROCEDURE = "demo.earthquake.initialload";

	private static final String EARTHQUAKES_TOPIC = "demo.earthquake.earthquakes";

	private final static Log logger = LogFactory.getLog(EarthquakeService.class);

	private GeoJson lastResult = null;

	private final SubscriptionRegistry subscriptionRegistry;

	private final WampPublisher wampPublisher;

	private final ObjectMapper objectMapper;

	private final HttpClient httpClient;

	public EarthquakeService(WampPublisher wampPublisher,
			SubscriptionRegistry subscriptionRegistry, ObjectMapper objectMapper) {
		this.subscriptionRegistry = subscriptionRegistry;
		this.wampPublisher = wampPublisher;
		this.objectMapper = objectMapper;
		this.httpClient = HttpClient.newHttpClient();
	}

	@WampProcedure(INITIAL_LOAD_PROCEDURE)
	public GeoJson initialload() {
		if (this.lastResult == null) {
			readLatestData();
		}
		return this.lastResult;
	}

	@Scheduled(initialDelay = 2_000, fixedDelay = 60_000)
	public void pollData() {
		if (this.subscriptionRegistry.hasSubscribers(EARTHQUAKES_TOPIC)) {
			readLatestData();
			if (this.lastResult != null) {
				this.wampPublisher.publishToAll(EARTHQUAKES_TOPIC, this.lastResult);
			}
		}
	}

	private void readLatestData() {
		try {
			HttpRequest request = HttpRequest.newBuilder().uri(URI.create(pastHour)).GET()
					.build();
			HttpResponse<String> response = this.httpClient.send(request,
					HttpResponse.BodyHandlers.ofString());
			this.lastResult = this.objectMapper.readValue(response.body(), GeoJson.class);
		}
		catch (IOException e) {
			logger.error("poll data", e);
		}
		catch (InterruptedException e) {
			Thread.currentThread().interrupt();
			logger.error("poll data", e);
		}
	}

}
