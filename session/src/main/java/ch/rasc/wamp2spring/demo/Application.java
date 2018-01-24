package ch.rasc.wamp2spring.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import ch.rasc.wamp2spring.servlet.WampServletConfiguration;

@SpringBootApplication
@EnableScheduling
public class Application extends WampServletConfiguration {

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}

	@Override
	protected String getWebSocketHandlerPath() {
		return "/wampsession";
	}

}
