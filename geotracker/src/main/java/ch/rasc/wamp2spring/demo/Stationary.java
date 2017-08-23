package ch.rasc.wamp2spring.demo;

import javax.annotation.Nullable;

import org.immutables.value.Value;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

@Value.Immutable
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonSerialize(as = ImmutableStationary.class)
@JsonDeserialize(as = ImmutableStationary.class)
public interface Stationary {

	@Nullable
	Double accuracy();

	@Nullable
	Long time();

	double latitude();

	double longitude();

	@Nullable
	Double radius();

}
