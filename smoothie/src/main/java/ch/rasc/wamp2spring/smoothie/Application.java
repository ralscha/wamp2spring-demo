package ch.rasc.wamp2spring.smoothie;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import ch.rasc.wamp2spring.config.EnableWamp;

@SpringBootApplication
@EnableScheduling
@EnableWamp
public class Application {

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}
}
