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

	@WampProcedure("demo.mobilechat.readRooms")
	@RequireAdminAuthority
	public Collection<Room> readRooms() {
		return this.rooms.values();
	}

	@WampProcedure("demo.mobilechat.newRoom")
	@RequireAdminAuthority
	public void newRoom(Room room) {
		this.rooms.put(room.getId(), room);
	}

	@WampProcedure("demo.mobilechat.removeRoom")
	@RequireAdminAuthority
	public void newRoom(String id) {
		this.rooms.remove(id);
	}

	@WampProcedure("demo.mobilechat.sendMessage")
	@RequireAdminAuthority
	public void sendMessage(String roomId, Message message) {
		this.messages.computeIfAbsent(roomId, _ -> new ArrayList<>()).add(message);
		this.wampPublisher.publish(this.wampPublisher.publishMessageBuilder("chat." + roomId)
				.notExcludeMe().addArgument(message).build());
	}

	@WampListener(topic = "chat", match = MatchPolicy.PREFIX)
	@RequireAdminAuthority
	public void storeMessage(Message msg, EventMessage event) {
		String topic = event.getTopic();
		if (topic != null) {
			String roomId = topic.substring(5);
			this.messages.computeIfAbsent(roomId, _ -> new ArrayList<>()).add(msg);
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
