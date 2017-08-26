package ch.rasc.wamp2spring.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import ch.rasc.wamp2spring.config.EnableWamp;
import ch.rasc.wamp2spring.config.Feature;

@SpringBootApplication
@EnableWamp(disable = Feature.DEALER)
public class Application {

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}
}
