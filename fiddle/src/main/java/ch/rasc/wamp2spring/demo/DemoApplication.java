package ch.rasc.wamp2spring.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.socket.server.HandshakeHandler;

import ch.rasc.wamp2spring.config.Feature;
import ch.rasc.wamp2spring.config.Features;
import ch.rasc.wamp2spring.config.PreferJsonHandshakeHandler;
import ch.rasc.wamp2spring.config.WampConfiguration;

@SpringBootApplication
//@EnableWamp(disable = Feature.DEALER)
public class DemoApplication extends WampConfiguration {

	public static void main(String[] args) {		
		SpringApplication.run(DemoApplication.class, args);
	}

	@Override
	protected void configureFeatures(Features features) {
		features.disable(Feature.DEALER);
	}

	@Override
	protected HandshakeHandler getHandshakeHandler() {
		return new PreferJsonHandshakeHandler();
		// return new PreferCborHandshakeHandler();
	}
}
