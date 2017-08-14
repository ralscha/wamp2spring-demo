package ch.rasc.wamp2spring.demo;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.annotation.Nonnull;

import org.springframework.core.io.ClassPathResource;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import com.fasterxml.jackson.databind.ObjectMapper;

import ch.rasc.wampspring.WampPublisher;
import ch.rasc.wampspring.pubsub.SubscriptionRegistry;

@Service
public class CarDriver {

	private final SubscriptionRegistry subscriptionRegistry;

	private final WampPublisher wampPublisher;

	private int blueRoutePos = 0;

	private int redRoutePos = 0;

	private final List<LatLng> blueRoute;

	private final List<LatLng> redRoute;

	private final ObjectMapper objectMapper;

	public CarDriver(WampPublisher wampPublisher,
			SubscriptionRegistry subscriptionRegistry, ObjectMapper objectMapper)
			throws IOException {
		this.subscriptionRegistry = subscriptionRegistry;
		this.wampPublisher = wampPublisher;
		this.objectMapper = objectMapper;

		this.blueRoute = readLatLng("/map/route_blue.txt");
		this.redRoute = readLatLng("/map/route_red.txt");
	}

	private static List<LatLng> readLatLng(@Nonnull String resource) throws IOException {
		List<LatLng> route;
		ClassPathResource cp = new ClassPathResource(resource);
		try (InputStream is = cp.getInputStream()) {
			@SuppressWarnings("null")
			String content = StreamUtils.copyToString(is, StandardCharsets.UTF_8);
			route = Arrays.stream(content.split("\n")).map(LatLng::new)
					.collect(Collectors.toList());
		}
		return route;
	}

	@SuppressWarnings("unchecked")
	@Scheduled(initialDelay = 1000, fixedDelay = 1000)
	public void driveBlueCar() {
		if (this.subscriptionRegistry.hasSubscribers("map.blue")) {
			LatLng latLng = this.blueRoute.get(this.blueRoutePos);
			this.blueRoutePos++;
			if (this.blueRoutePos >= this.blueRoute.size()) {
				this.blueRoutePos = 0;
			}

			this.wampPublisher.publishToAll("map.blue",
					this.objectMapper.convertValue(latLng, Map.class));
		}
	}

	@SuppressWarnings("unchecked")
	@Scheduled(initialDelay = 2000, fixedDelay = 1200)
	public void driveRedCar() {
		if (this.subscriptionRegistry.hasSubscribers("map.red")) {
			LatLng latLng = this.redRoute.get(this.redRoutePos);
			this.redRoutePos++;
			if (this.redRoutePos >= this.redRoute.size()) {
				this.redRoutePos = 0;
			}

			this.wampPublisher.publishToAll("map.red",
					this.objectMapper.convertValue(latLng, Map.class));
		}
	}

}
