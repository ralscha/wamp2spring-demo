package ch.rasc.wamp2spring.demo;

import java.io.IOException;
import java.net.URL;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import ch.rasc.wamp2spring.WampPublisher;
import ch.rasc.wamp2spring.annotation.WampProcedure;
import ch.rasc.wamp2spring.pubsub.SubscriptionRegistry;

@Service
public class EarthquakeService {

	private final static String pastHour = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson";

	private final static Log logger = LogFactory.getLog(EarthquakeService.class);

	private GeoJson lastResult = null;

	private final SubscriptionRegistry subscriptionRegistry;

	private final WampPublisher wampPublisher;

	private final ObjectMapper objectMapper;

	public EarthquakeService(WampPublisher wampPublisher,
			SubscriptionRegistry subscriptionRegistry, ObjectMapper objectMapper) {
		this.subscriptionRegistry = subscriptionRegistry;
		this.wampPublisher = wampPublisher;
		this.objectMapper = objectMapper;
	}

	@WampProcedure("initialload")
	public GeoJson initialload() {
		if (this.lastResult == null) {
			readLatestData();
		}
		return this.lastResult;
	}

	@Scheduled(initialDelay = 2_000, fixedDelay = 60_000)
	public void pollData() {
		if (this.subscriptionRegistry.hasSubscribers("earthquakes")) {
			readLatestData();
			if (this.lastResult != null) {
				this.wampPublisher.publishToAll("earthquakes", this.lastResult);
			}
		}
	}

	private void readLatestData() {
		try {
			this.lastResult = this.objectMapper.readValue(new URL(pastHour),
					GeoJson.class);
		}
		catch (IOException e) {
			logger.error("poll data", e);
		}
	}

}
