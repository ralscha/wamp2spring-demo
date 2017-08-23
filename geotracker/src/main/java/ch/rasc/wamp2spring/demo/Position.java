package ch.rasc.wamp2spring.demo;

import javax.annotation.Nullable;

import org.immutables.value.Value;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

@Value.Immutable
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonSerialize(as = ImmutablePosition.class)
@JsonDeserialize(as = ImmutablePosition.class)
public interface Position {

	@Nullable
	Double accuracy();

	@Nullable
	Double bearing();

	double latitude();

	double longitude();

	@Nullable
	Double speed();

	long time();

}
