package ch.rasc.wamp2spring.demo.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.SecurityContextHolderFilter;

import ch.rasc.wamp2spring.demo.security.jwt.JWTFilter;
import ch.rasc.wamp2spring.demo.security.jwt.TokenProvider;

@Configuration
public class SecurityConfig {

	private final TokenProvider tokenProvider;

	public SecurityConfig(TokenProvider tokenProvider) {
		this.tokenProvider = tokenProvider;
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder(12);
	}

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http.csrf(AbstractHttpConfigurer::disable).cors(Customizer.withDefaults())
				.sessionManagement(
						c -> c.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.authorizeHttpRequests(c -> c.requestMatchers("/signup").permitAll()
						.requestMatchers("/login").permitAll().requestMatchers("/public")
						.permitAll().anyRequest().authenticated())
				.addFilterAfter(new JWTFilter(this.tokenProvider),
						SecurityContextHolderFilter.class);
		return http.build();
	}

}