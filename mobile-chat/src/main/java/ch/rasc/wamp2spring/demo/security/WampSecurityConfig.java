package ch.rasc.wamp2spring.demo.security;

import org.springframework.context.annotation.Configuration;

import ch.rasc.wamp2spring.security.AbstractSecurityWampConfigurer;
import ch.rasc.wamp2spring.security.WampMessageSecurityMetadataSourceRegistry;

@Configuration
public class WampSecurityConfig extends AbstractSecurityWampConfigurer {

	@Override
	protected void configureInbound(WampMessageSecurityMetadataSourceRegistry messages) {
		messages.anyMessage().authenticated();
	}

}
