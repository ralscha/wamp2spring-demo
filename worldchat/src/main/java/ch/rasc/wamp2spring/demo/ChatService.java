package ch.rasc.wamp2spring.demo;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Random;
import java.util.Set;

import javax.annotation.Nonnull;

import org.owasp.html.PolicyFactory;
import org.owasp.html.Sanitizers;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Service;

import ch.rasc.wampspring.WampPublisher;
import ch.rasc.wampspring.annotation.WampListener;
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

	private final Set<String> subscribedLanguages = new HashSet<>();

	private final Map<String, ChatUser> connectedUsers = new HashMap<>();
	private final Map<Long, String> wampSessionToUserId = new HashMap<>();

	private final PolicyFactory policy;

	public ChatService(WampPublisher wampPublisher, TranslateService translateService) {
		this.wampPublisher = wampPublisher;
		this.translateService = translateService;
		this.policy = Sanitizers.FORMATTING.and(Sanitizers.LINKS);
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
		String userId = this.wampSessionToUserId.get(event.getWampSessionId());
		if (userId != null) {
			ChatUser user = this.connectedUsers.remove(userId);
			if (user != null) {
				this.wampPublisher.publishToAll("special",
						new SpecialMessage(user.getName(), "disconnected"));
			}
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
		this.wampSessionToUserId.put(wampSessionId, user.getId());
		this.connectedUsers.put(user.getId(), user);

		this.wampPublisher.publishToAll("special",
				new SpecialMessage(user.getName(), "connected"));

	}

	@WampProcedure("list.users")
	public Map<String, ChatUser> listUsers() {
		return this.connectedUsers;
	}

	@WampProcedure("send")
	public void sendMessage(ChatMessage message) {
		if (message.getType().equals("N")) {
			for (String lang : this.subscribedLanguages) {
				if (message.getLang().equals(lang)) {
					this.wampPublisher.publishToAll("msg." + lang, message
							.copyWithContent(this.policy.sanitize(message.getContent())));
				}
				else {
					String translatedMsg = this.translateService
							.translate(message.getContent(), message.getLang(), lang);
					this.wampPublisher.publishToAll("msg." + lang,
							message.copyWithContent(this.policy.sanitize(translatedMsg)));
				}
			}
		}
		else {
			this.wampPublisher.publishToAll("special", generateSpecialMessage(message));
		}
	}

	@WampListener("icon.changed")
	public void iconChanged(String userId, String icon) {
		ChatUser user = this.connectedUsers.get(userId);
		if (user != null) {
			user.setIcon(icon);
		}
	}

	@WampListener("name.changed")
	public void nameChanged(String userId, String name) {
		ChatUser user = this.connectedUsers.get(userId);
		if (user != null) {
			user.setName(name);
		}
	}

	private int randBetween(int min, int max) {
		return this.rand.ints(min, max + 1).limit(1).findFirst().getAsInt();
	}

	@Nonnull
	private SpecialMessage generateSpecialMessage(ChatMessage msg) {
		switch (msg.getContent()) {
		case "/sit":
			return new SpecialMessage(getUserName(msg.getUserId()),
					sitEmotes[randBetween(0, sitEmotes.length - 1)]);
		case "/laugh":
			return new SpecialMessage(getUserName(msg.getUserId()),
					laughEmotes[randBetween(0, laughEmotes.length - 1)]);
		case "/yawn":
			return new SpecialMessage(getUserName(msg.getUserId()),
					yawnEmotes[randBetween(0, yawnEmotes.length - 1)]);
		case "/hide":
			return new SpecialMessage(getUserName(msg.getUserId()),
					hideEmotes[randBetween(0, hideEmotes.length - 1)]);
		case "/scream":
			return new SpecialMessage(getUserName(msg.getUserId()),
					screamEmotes[randBetween(0, screamEmotes.length - 1)]);
		default:
			return new SpecialMessage(getUserName(msg.getUserId()),
					"tried to do an emote that doesn't exist. Everyone point and laugh at them!");
		}
	}

	private String getUserName(String id) {
		ChatUser chatUser = this.connectedUsers.get(id);
		if (chatUser != null) {
			return chatUser.getName();
		}
		return "";
	}

}
