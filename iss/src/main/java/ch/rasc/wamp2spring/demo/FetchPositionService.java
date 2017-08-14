package ch.rasc.wamp2spring.demo;

import java.io.IOException;
import java.util.Map;

import org.apache.commons.logging.LogFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import ch.rasc.wampspring.WampPublisher;
import ch.rasc.wampspring.pubsub.SubscriptionRegistry;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.ResponseBody;

@Service
public class FetchPositionService {

	private final static String ISS_NOTIFY_URL = "http://api.open-notify.org/iss-now.json";

	private final SubscriptionRegistry subscriptionRegistry;

	private final WampPublisher wampPublisher;

	private final ObjectMapper objectMapper;

	private final OkHttpClient client;

	public FetchPositionService(WampPublisher wampPublisher,
			SubscriptionRegistry subscriptionRegistry, ObjectMapper objectMapper) {
		this.subscriptionRegistry = subscriptionRegistry;
		this.wampPublisher = wampPublisher;
		this.objectMapper = objectMapper;
		this.client = new OkHttpClient();
	}

	private Map<String, Object> fetchCurrentLocation() {
		Request request = new Request.Builder().url(ISS_NOTIFY_URL).build();
		try (Response response = this.client.newCall(request).execute();
				ResponseBody body = response.body()) {
			if (body != null) {
				Map<String, Object> location = this.objectMapper.readValue(body.string(),
						Map.class);
				return location;
			}
		}
		catch (IOException e) {
			LogFactory.getLog(this.getClass()).error("fetch current location", e);
		}
		return null;
	}

	@Scheduled(initialDelay = 1000, fixedDelay = 3000)
	public void publish() {
		if (this.subscriptionRegistry.hasSubscribers("location")) {
			Map<String, Object> currentLocation = fetchCurrentLocation();
			this.wampPublisher.publishToAll("location", currentLocation);
		}
	}

}
