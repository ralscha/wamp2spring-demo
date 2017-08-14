package ch.rasc.wamp2spring.demo;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@ConfigurationProperties(prefix = "app")
@Component
public class AppConfig {
	private String credentialsPath;

	private long limitTranslationCharacters;

	public String getCredentialsPath() {
		return this.credentialsPath;
	}

	public void setCredentialsPath(String credentialsPath) {
		this.credentialsPath = credentialsPath;
	}

	public long getLimitTranslationCharacters() {
		return this.limitTranslationCharacters;
	}

	public void setLimitTranslationCharacters(long limitTranslationCharacters) {
		this.limitTranslationCharacters = limitTranslationCharacters;
	}

}
