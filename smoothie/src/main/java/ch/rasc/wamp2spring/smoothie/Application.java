package ch.rasc.wamp2spring.smoothie;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistration;

import ch.rasc.wamp2spring.config.Feature;
import ch.rasc.wamp2spring.servlet.EnableServletWamp;
import ch.rasc.wamp2spring.servlet.WampServletConfigurer;

@SpringBootApplication
@EnableScheduling
@EnableServletWamp(disable = Feature.DEALER)
public class Application implements WampServletConfigurer {

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}

	@Override
	public void configureWebSocketHandlerRegistration(
			WebSocketHandlerRegistration registration) {
		registration.setAllowedOrigins("*");
	}

}
