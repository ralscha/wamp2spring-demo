package ch.rasc.wamp2spring.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.socket.server.HandshakeHandler;

import ch.rasc.wampspring.config.PreferJsonHandshakeHandler;
import ch.rasc.wampspring.config.WampConfiguration;

@SpringBootApplication
// @EnableWamp
public class DemoApplication extends WampConfiguration {

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}

	@Override
	protected HandshakeHandler getHandshakeHandler() {
		return new PreferJsonHandshakeHandler();
	}
}
