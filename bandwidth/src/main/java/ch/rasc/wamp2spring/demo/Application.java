package ch.rasc.wamp2spring.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import ch.rasc.wampspring.config.EnableWamp;

@SpringBootApplication
@EnableScheduling
@EnableWamp
public class Application {

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}


}
