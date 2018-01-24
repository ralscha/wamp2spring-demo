package ch.rasc.wamp2spring.demo.security;

import org.springframework.context.annotation.Configuration;

import ch.rasc.wamp2spring.security.WampMessageSecurityMetadataSourceRegistry;
import ch.rasc.wamp2spring.security.servlet.AbstractSecurityWampServletConfigurer;

@Configuration
public class WampSecurityConfig extends AbstractSecurityWampServletConfigurer {

	@Override
	protected void configureInbound(WampMessageSecurityMetadataSourceRegistry messages) {
		messages.anyMessage().authenticated();
	}

}
