package ch.rasc.wamp2spring.smoothie;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.socket.server.HandshakeHandler;

import ch.rasc.wamp2spring.config.EnableWamp;
import ch.rasc.wamp2spring.config.Feature;
import ch.rasc.wamp2spring.config.PreferJsonHandshakeHandler;
import ch.rasc.wamp2spring.config.WampConfiguration;

@SpringBootApplication
@EnableScheduling
@EnableWamp(disable = Feature.DEALER)
public class Application extends WampConfiguration {

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}

	@Override
	protected HandshakeHandler getHandshakeHandler() {
		return new PreferJsonHandshakeHandler();
		// return new PreferCborHandshakeHandler();
	}

}
