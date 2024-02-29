package ch.rasc.wamp2spring.demo;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import ch.rasc.wamp2spring.WampPublisher;
import ch.rasc.wamp2spring.annotation.WampListener;
import ch.rasc.wamp2spring.annotation.WampProcedure;
import ch.rasc.wamp2spring.event.WampSubscriptionDeletedEvent;
import ch.rasc.wamp2spring.event.WampSubscriptionSubscribedEvent;
import ch.rasc.wamp2spring.message.EventMessage;
import ch.rasc.wamp2spring.pubsub.MatchPolicy;

@Service
public class ChatService {

	private final Map<String, Room> rooms = new ConcurrentHashMap<>();

	private final Map<String, List<Message>> messages = new ConcurrentHashMap<>();

	private final WampPublisher wampPublisher;

	public ChatService(WampPublisher wampPublisher) {
		this.wampPublisher = wampPublisher;
	}

	@WampProcedure("readRooms")
	@RequireAdminAuthority
	public Collection<Room> readRooms() {
		return this.rooms.values();
	}

	@WampProcedure("newRoom")
	@RequireAdminAuthority
	public void newRoom(Room room) {
		this.rooms.put(room.getId(), room);
	}

	@WampProcedure("removeRoom")
	@RequireAdminAuthority
	public void newRoom(String id) {
		this.rooms.remove(id);
	}

	@WampListener(topic = "chat", match = MatchPolicy.PREFIX)
	@RequireAdminAuthority
	public void storeMessage(Message msg, EventMessage event) {
		String topic = event.getTopic();
		if (topic != null) {
			String roomId = topic.substring(5);
			this.messages.computeIfAbsent(roomId, key -> new ArrayList<>()).add(msg);
		}
	}

	@EventListener
	public void handleSubscribed(WampSubscriptionSubscribedEvent event) {
		String topic = event.getSubscriptionDetail().getTopic();
		if (topic.startsWith("chat.")) {
			String roomId = topic.substring(5);
			List<Message> msgs = this.messages.get(roomId);
			if (msgs != null) {
				this.wampPublisher.publishTo(event.getWampSessionId(), topic, msgs);
			}
		}
	}

	@EventListener
	public void handleDeletedSubscription(WampSubscriptionDeletedEvent event) {
		this.messages.remove(event.getSubscriptionDetail().getTopic());
	}
}
