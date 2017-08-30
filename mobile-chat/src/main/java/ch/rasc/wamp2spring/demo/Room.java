package ch.rasc.wamp2spring.demo;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class Room {
	private final String id;

	private final String name;

	@JsonCreator
	public Room(@JsonProperty("id") String id, @JsonProperty("name") String name) {
		this.id = id;
		this.name = name;
	}

	public String getId() {
		return this.id;
	}

	public String getName() {
		return this.name;
	}

}
