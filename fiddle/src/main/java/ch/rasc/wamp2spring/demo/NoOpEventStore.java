package ch.rasc.wamp2spring.demo;

import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Component;

import ch.rasc.wamp2spring.config.EventStore;
import ch.rasc.wamp2spring.config.TopicMatch;
import ch.rasc.wamp2spring.message.PublishMessage;

@Component
public class NoOpEventStore implements EventStore {

	@Override
	public void retain(PublishMessage publishMessage) {
		
	}

	@Override
	public List<PublishMessage> getRetained(TopicMatch query) {
		return Collections.emptyList();
	}

}