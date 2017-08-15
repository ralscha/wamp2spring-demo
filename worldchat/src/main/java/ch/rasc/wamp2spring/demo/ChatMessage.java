package ch.rasc.wamp2spring.demo;

import javax.annotation.Nonnull;

public class ChatMessage {

	private long ts;
	private String userId;
	private String lang;
	private String content;
	private String type;

	public long getTs() {
		return this.ts;
	}

	public void setTs(long ts) {
		this.ts = ts;
	}

	public String getUserId() {
		return this.userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public String getType() {
		return this.type;
	}

	public void setType(String type) {
		this.type = type;
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

	@Nonnull
	public ChatMessage copyWithContent(String translatedMsg) {
		ChatMessage msg = new ChatMessage();
		msg.setContent(translatedMsg);
		msg.setLang(this.getLang());
		msg.setUserId(this.getUserId());
		msg.setTs(this.getTs());
		msg.setType(this.getType());
		return msg;
	}

}
