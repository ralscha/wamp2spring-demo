package ch.rasc.wamp2spring.smoothie;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import ch.rasc.wamp2spring.WampPublisher;
import ch.rasc.wamp2spring.pubsub.SubscriptionRegistry;

@Service
public class CpuDataService {

	private final Random random = new Random();

	private final SubscriptionRegistry subscriptionRegistry;

	private final WampPublisher wampPublisher;

	@Autowired
	public CpuDataService(WampPublisher wampPublisher,
			SubscriptionRegistry subscriptionRegistry) {
		this.wampPublisher = wampPublisher;
		this.subscriptionRegistry = subscriptionRegistry;
	}

	@Scheduled(initialDelay = 3_000, fixedDelay = 1_000)
	public void sendData() {
		if (this.subscriptionRegistry.hasSubscribers("smoothie")) {
			// System.out.println("SENDING DATA:"+System.currentTimeMillis());
			Map<String, Object> data = new HashMap<>();
			data.put("time", System.currentTimeMillis());
			data.put("host1",
					new double[] { this.random.nextDouble(), this.random.nextDouble(),
							this.random.nextDouble(), this.random.nextDouble() });
			data.put("host2",
					new double[] { this.random.nextDouble(), this.random.nextDouble(),
							this.random.nextDouble(), this.random.nextDouble() });
			data.put("host3",
					new double[] { this.random.nextDouble(), this.random.nextDouble(),
							this.random.nextDouble(), this.random.nextDouble() });
			data.put("host4",
					new double[] { this.random.nextDouble(), this.random.nextDouble(),
							this.random.nextDouble(), this.random.nextDouble() });

			this.wampPublisher.publishToAll("smoothie", data);
		}
	}

}
