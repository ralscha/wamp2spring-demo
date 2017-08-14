package ch.rasc.wamp2spring.demo;

import javax.annotation.Nonnull;

public class ChatMessage {

	public enum ChatMessageType {
		NORMAL, SPECIAL
	}

	private long ts;
	private String icon;
	private String name;
	private String lang;
	private String content;
	private ChatMessageType type;

	public long getTs() {
		return this.ts;
	}

	public void setTs(long ts) {
		this.ts = ts;
	}

	public String getIcon() {
		return this.icon;
	}

	public void setIcon(String icon) {
		this.icon = icon;
	}

	public String getName() {
		return this.name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getLang() {
		return this.lang;
	}

	public void setLang(String lang) {
		this.lang = lang;
	}

	public String getContent() {
		return this.content;
	}

	public void setContent(String content) {
		this.content = content;
	}

	public ChatMessageType getType() {
		return this.type;
	}

	public void setType(ChatMessageType type) {
		this.type = type;
	}

	@Nonnull
	public ChatMessage copyWithContent(String translatedMsg) {
		ChatMessage msg = new ChatMessage();
		msg.setContent(translatedMsg);
		msg.setIcon(this.getIcon());
		msg.setLang(this.getLang());
		msg.setName(this.getName());
		msg.setTs(this.getTs());
		msg.setType(this.getType());
		return msg;
	}

	@Override
	public String toString() {
		return "ChatMessage [ts=" + this.ts + ", icon=" + this.icon + ", name="
				+ this.name + ", lang=" + this.lang + ", content=" + this.content
				+ ", type=" + this.type + "]";
	}

}
