package ch.rasc.wamp2spring.demo;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class Message {

	private final long ts;

	private final String msg;

	private final String sender;

	@JsonCreator
	public Message(@JsonProperty("ts") long ts, @JsonProperty("msg") String msg,
			@JsonProperty("sender") String sender) {
		this.ts = ts;
		this.msg = msg;
		this.sender = sender;
	}

	public long getTs() {
		return this.ts;
	}

	public String getMsg() {
		return this.msg;
	}

	public String getSender() {
		return this.sender;
	}

}
