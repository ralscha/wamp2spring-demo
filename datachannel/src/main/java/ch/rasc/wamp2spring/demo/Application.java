package ch.rasc.wamp2spring.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.socket.server.HandshakeHandler;

import ch.rasc.wamp2spring.servlet.PreferJsonHandshakeHandler;
import ch.rasc.wamp2spring.servlet.WampServletConfiguration;

@SpringBootApplication
public class Application extends WampServletConfiguration {

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}

	@Override
	protected HandshakeHandler getHandshakeHandler() {
		return new PreferJsonHandshakeHandler();
	}

}
