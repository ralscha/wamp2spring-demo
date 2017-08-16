package ch.rasc.wamp2spring.demo;

import java.util.List;
import java.util.Map;

import javax.annotation.Nonnull;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonInclude(Include.NON_NULL)
public class SnakeMessage {
	private final String type;

	private final Object data;

	private final Long id;

	private SnakeMessage(String type) {
		this(type, null, null);
	}

	private SnakeMessage(String type, Object data) {
		this(type, data, null);
	}

	private SnakeMessage(String type, Object data, Long id) {
		this.type = type;
		this.data = data;
		this.id = id;
	}

	@Nonnull
	public static SnakeMessage createDeadMessage() {
		return new SnakeMessage("dead");
	}

	@Nonnull
	public static SnakeMessage createKillMessage() {
		return new SnakeMessage("kill");
	}

	@Nonnull
	public static SnakeMessage createUpdateMessage(List<Map<String, Object>> data) {
		return new SnakeMessage("update", data);
	}

	@Nonnull
	public static SnakeMessage createJoinMessage(List<Map<String, Object>> data) {
		return new SnakeMessage("join", data);
	}

	@Nonnull
	public static SnakeMessage createLeaveMessage(Long id) {
		return new SnakeMessage("leave", null, id);
	}

	public String getType() {
		return this.type;
	}

	public Object getData() {
		return this.data;
	}

	public Long getId() {
		return this.id;
	}

}
