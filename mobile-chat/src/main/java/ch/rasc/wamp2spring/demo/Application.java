package ch.rasc.wamp2spring.demo;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistration;
import org.springframework.web.socket.server.HandshakeHandler;

import ch.rasc.wamp2spring.servlet.PreferJsonHandshakeHandler;
import ch.rasc.wamp2spring.servlet.WampServletConfiguration;

@SpringBootApplication
public class Application extends WampServletConfiguration {

	public final static Logger logger = LoggerFactory.getLogger(Application.class);

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}

	@Override
	protected HandshakeHandler getHandshakeHandler() {
		return new PreferJsonHandshakeHandler();
	}

	@Override
	public void configureWebSocketHandlerRegistration(
			WebSocketHandlerRegistration registration) {
		registration.setAllowedOrigins("http://localhost:8100");
	}

}
