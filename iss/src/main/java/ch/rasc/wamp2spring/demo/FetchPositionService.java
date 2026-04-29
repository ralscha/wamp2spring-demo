package ch.rasc.wamp2spring.demo;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;

import org.apache.commons.logging.LogFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import ch.rasc.wamp2spring.WampPublisher;
import ch.rasc.wamp2spring.pubsub.SubscriptionRegistry;
import tools.jackson.databind.ObjectMapper;

@Service
public class FetchPositionService {

	private final static String ISS_NOTIFY_URL = "http://api.open-notify.org/iss-now.json";

	private final SubscriptionRegistry subscriptionRegistry;

	private final WampPublisher wampPublisher;

	private final ObjectMapper objectMapper;

	private final HttpClient client;

	public FetchPositionService(WampPublisher wampPublisher,
			SubscriptionRegistry subscriptionRegistry, ObjectMapper objectMapper) {
		this.subscriptionRegistry = subscriptionRegistry;
		this.wampPublisher = wampPublisher;
		this.objectMapper = objectMapper;
		this.client = HttpClient.newHttpClient();
	}

	private Map<String, Object> fetchCurrentLocation() {
		HttpRequest request = HttpRequest.newBuilder().uri(URI.create(ISS_NOTIFY_URL)).GET()
				.build();
		try {
			HttpResponse<String> response = this.client.send(request,
					HttpResponse.BodyHandlers.ofString());
			if (response.body() != null) {
				return this.objectMapper.readValue(response.body(), Map.class);
			}
		}
		catch (IOException e) {
			LogFactory.getLog(this.getClass()).error("fetch current location", e);
		}
		catch (InterruptedException e) {
			Thread.currentThread().interrupt();
			LogFactory.getLog(this.getClass()).error("fetch current location", e);
		}
		return null;
	}

	@Scheduled(initialDelay = 1000, fixedDelay = 3000)
	public void publish() {
		if (this.subscriptionRegistry.hasSubscribers("demo.iss.location")) {
			Map<String, Object> currentLocation = fetchCurrentLocation();
			this.wampPublisher.publishToAll("demo.iss.location", currentLocation);
		}
	}

}
