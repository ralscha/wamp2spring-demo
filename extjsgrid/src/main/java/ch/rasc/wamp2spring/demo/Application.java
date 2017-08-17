package ch.rasc.wamp2spring.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import ch.rasc.wamp2spring.config.EnableWamp;

@SpringBootApplication
@EnableWamp
public class Application {

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}

}
