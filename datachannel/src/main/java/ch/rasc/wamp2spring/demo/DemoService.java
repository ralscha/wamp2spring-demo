package ch.rasc.wamp2spring.demo;

import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import ch.rasc.wamp2spring.WampPublisher;
import ch.rasc.wamp2spring.event.WampDisconnectEvent;

@Service
public class DemoService {

	private final WampPublisher wampPublisher;

	public DemoService(WampPublisher wampPublisher) {
		this.wampPublisher = wampPublisher;
	}

	@EventListener
	public void handleDisconnect(WampDisconnectEvent event) {
		this.wampPublisher.publishToAll("peer.disconnected", event.getWampSessionId());
	}

}
