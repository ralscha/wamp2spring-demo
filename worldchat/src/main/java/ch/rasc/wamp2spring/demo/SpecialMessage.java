package ch.rasc.wamp2spring.demo;

public class SpecialMessage {
	private final String name;

	private final String emote;

	public SpecialMessage(String name, String emote) {
		this.name = name;
		this.emote = emote;
	}

	public String getName() {
		return this.name;
	}

	public String getEmote() {
		return this.emote;
	}

}
