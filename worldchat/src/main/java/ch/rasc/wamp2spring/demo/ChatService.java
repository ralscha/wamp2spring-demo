package ch.rasc.wamp2spring.demo;

import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.stream.Collectors;

import javax.annotation.Nonnull;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Service;

import ch.rasc.wamp2spring.demo.ChatMessage.ChatMessageType;
import ch.rasc.wampspring.WampPublisher;
import ch.rasc.wampspring.annotation.WampProcedure;
import ch.rasc.wampspring.event.WampDisconnectEvent;
import ch.rasc.wampspring.event.WampSubscriptionCreatedEvent;
import ch.rasc.wampspring.event.WampSubscriptionDeletedEvent;

@Service
public class ChatService {

	private final static String[] sitEmotes = {
			"sits down pretzel style cause they're cool like that.", "sits down to rest.",
			"sits down because they can't handle the standing." };

	private final static String[] laughEmotes = { "laughs at everyone in this chat.",
			"laughs maniacally while rubbing hands together.", "laughs", "chuckles",
			"giggles", "tee-hee's like an anime girl" };

	private final static String[] yawnEmotes = { "yawns.", "yawns out of boredom.",
			"yawns sleepily." };

	private final static String[] hideEmotes = {
			"sees a spider and hides in complete fear.",
			"hides in an undisclosed location.", "hides in plain sight." };

	private final static String[] screamEmotes = { "screams in agonizing terror.",
			"screams in furious rage.", "screams like a fan-girl.",
			"screams and breaks a wine glass." };

	private final Random rand = new Random();

	private final WampPublisher wampPublisher;

	private final TranslateService translateService;

	private final Set<ChatUser> users = new LinkedHashSet<>();

	private final Set<String> subscribedLanguages = new HashSet<>();

	private final Map<Long, ChatUser> connectedUsers = new HashMap<>();

	public ChatService(WampPublisher wampPublisher, TranslateService translateService) {
		this.wampPublisher = wampPublisher;
		this.translateService = translateService;
	}

	@EventListener
	public void created(WampSubscriptionCreatedEvent event) {
		String topic = event.getSubscriptionDetail().getTopic();
		if (topic.startsWith("msg.")) {
			this.subscribedLanguages.add(topic.substring(4));
		}
	}

	@EventListener
	public void disconnect(WampDisconnectEvent event) {
		ChatUser user = this.connectedUsers.remove(event.getWampSessionId());
		if (user != null) {
			this.wampPublisher.publishToAll("special",
					new SpecialMessage(user.getName(), "disconnected"));
		}
	}

	@EventListener
	public void deleted(WampSubscriptionDeletedEvent event) {
		String topic = event.getSubscriptionDetail().getTopic();
		if (topic.startsWith("msg.")) {
			this.subscribedLanguages.remove(topic.substring(4));
		}
	}

	@WampProcedure("connect")
	public void connect(ChatUser user, @Header("WAMP_SESSION_ID") long wampSessionId) {
		this.connectedUsers.put(wampSessionId, user);

		this.wampPublisher.publishToAll("special",
				new SpecialMessage(user.getName(), "connected"));

	}

	@WampProcedure("username.list")
	public List<String> listUsers() {
		return this.users.stream().map(ChatUser::getName).collect(Collectors.toList());
	}

	@WampProcedure("send")
	public void sendMessage(ChatMessage message) {
		if (message.getType() == ChatMessageType.NORMAL) {
			for (String lang : this.subscribedLanguages) {
				if (message.getLang().equals(lang)) {
					this.wampPublisher.publishToAll("msg." + lang, message);
				}
				else {
					String translatedMsg = this.translateService
							.translate(message.getContent(), message.getLang(), lang);
					this.wampPublisher.publishToAll("msg." + lang,
							message.copyWithContent(translatedMsg));
				}
			}
		}
		else {
			this.wampPublisher.publishToAll("special", generateSpecialMessage(message));
		}
	}

	@WampProcedure("change.icon")
	public void changeIcon(String icon, @Header("WAMP_SESSION_ID") long wampSessionId) {
		ChatUser user = this.connectedUsers.get(wampSessionId);
		if (user != null) {
			user.setIcon(icon);
			this.wampPublisher.publishToAll("icon.changed", user);
		}
	}

	@WampProcedure("change.name")
	public void changeName(String newName,
			@Header("WAMP_SESSION_ID") long wampSessionId) {
		ChatUser user = this.connectedUsers.get(wampSessionId);
		if (user != null) {
			Map<String, String> nameChange = new HashMap<>();
			nameChange.put("oldName", user.getName());
			nameChange.put("newName", newName);
			user.setName(newName);
			this.wampPublisher.publishToAll("name.changed", nameChange);
		}
	}

	private int randBetween(int min, int max) {
		return this.rand.ints(min, max + 1).limit(1).findFirst().getAsInt();
	}

	@Nonnull
	private SpecialMessage generateSpecialMessage(ChatMessage msg) {
		switch (msg.getContent()) {
		case "/sit":
			return new SpecialMessage(msg.getName(),
					sitEmotes[randBetween(0, sitEmotes.length - 1)]);
		case "/laugh":
			return new SpecialMessage(msg.getName(),
					laughEmotes[randBetween(0, laughEmotes.length - 1)]);
		case "/yawn":
			return new SpecialMessage(msg.getName(),
					yawnEmotes[randBetween(0, yawnEmotes.length - 1)]);
		case "/hide":
			return new SpecialMessage(msg.getName(),
					hideEmotes[randBetween(0, hideEmotes.length - 1)]);
		case "/scream":
			return new SpecialMessage(msg.getName(),
					screamEmotes[randBetween(0, screamEmotes.length - 1)]);
		default:
			return new SpecialMessage(msg.getName(),
					"tried to do an emote that doesn't exist. Everyone point and laugh at them!");
		}
	}

}
