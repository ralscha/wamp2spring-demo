package ch.rasc.wamp2spring.demo;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.concurrent.atomic.LongAdder;

import org.springframework.stereotype.Service;

import com.google.auth.oauth2.ServiceAccountCredentials;
import com.google.cloud.translate.Translate;
import com.google.cloud.translate.Translate.TranslateOption;
import com.google.cloud.translate.TranslateOptions;
import com.google.cloud.translate.Translation;

@Service
public class TranslateService {

	private final AppConfig appConfig;

	private final Translate translate;

	private final LongAdder noOfTranslatedCharacters;

	public TranslateService(AppConfig appConfig) throws IOException {
		this.appConfig = appConfig;

		if (appConfig.getCredentialsPath() != null) {
			ServiceAccountCredentials credentials = ServiceAccountCredentials.fromStream(
					Files.newInputStream(Paths.get(appConfig.getCredentialsPath())));

			this.translate = TranslateOptions.newBuilder().setCredentials(credentials)
					.build().getService();
		}
		else {
			this.translate = null;
		}

		this.noOfTranslatedCharacters = new LongAdder();
	}

	public String translate(String text, String sourceLanguage, String targetLanguage) {
		this.noOfTranslatedCharacters.add(text.length());
		if (this.translate != null && this.noOfTranslatedCharacters.sum() < this.appConfig
				.getLimitTranslationCharacters()) {
			Translation translation = this.translate.translate(text,
					TranslateOption.sourceLanguage(sourceLanguage),
					TranslateOption.targetLanguage(targetLanguage));

			return translation.getTranslatedText();
		}
		return text;
	}

}
