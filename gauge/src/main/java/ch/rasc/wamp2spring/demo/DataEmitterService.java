package ch.rasc.wamp2spring.demo;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import ch.rasc.wampspring.WampPublisher;
import ch.rasc.wampspring.pubsub.SubscriptionRegistry;

@Service
public class DataEmitterService {

	private final WampPublisher wampPublisher;

	private final SubscriptionRegistry subscriptionRegistry;

	private final static Random random = new Random();

	public DataEmitterService(WampPublisher wampPublisher,
			SubscriptionRegistry subscriptionRegistry) {
		this.wampPublisher = wampPublisher;
		this.subscriptionRegistry = subscriptionRegistry;
	}

	@Scheduled(initialDelay = 2_000, fixedRate = 1_000)
	public void sendData() {
		if (this.subscriptionRegistry.hasSubscribers("data")) {
			List<Integer> data = new ArrayList<>();
			for (int i = 0; i < 5; i++) {
				data.add(random.nextInt(31));
			}
			this.wampPublisher.publishToAll("data", data);
		}
	}

}
