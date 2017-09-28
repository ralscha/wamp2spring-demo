package ch.rasc.wamp2spring.demo;

import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Component;

import ch.rasc.wamp2spring.config.DestinationMatch;
import ch.rasc.wamp2spring.message.PublishMessage;
import ch.rasc.wamp2spring.pubsub.EventStore;

@Component
public class NoOpEventStore implements EventStore {

	@Override
	public void retain(PublishMessage publishMessage) {
		
	}

	@Override
	public List<PublishMessage> getRetained(DestinationMatch query) {
		return Collections.emptyList();
	}

}
