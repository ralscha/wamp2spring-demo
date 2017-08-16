package ch.rasc.wamp2spring.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.socket.server.HandshakeHandler;

import ch.rasc.wampspring.config.PreferJsonHandshakeHandler;
import ch.rasc.wampspring.config.WampConfiguration;

@SpringBootApplication
@EnableScheduling
public class Application extends WampConfiguration {

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}

	@Override
	protected HandshakeHandler getHandshakeHandler() {
		return new PreferJsonHandshakeHandler();
	}

}
