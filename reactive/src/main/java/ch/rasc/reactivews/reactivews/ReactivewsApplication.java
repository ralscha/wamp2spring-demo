package ch.rasc.reactivews.reactivews;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import ch.rasc.wamp2spring.reactive.EnableReactiveWamp;

@SpringBootApplication
@EnableScheduling
@EnableReactiveWamp
public class ReactivewsApplication {

	public static void main(String[] args) {
		SpringApplication.run(ReactivewsApplication.class, args);
	}
}
