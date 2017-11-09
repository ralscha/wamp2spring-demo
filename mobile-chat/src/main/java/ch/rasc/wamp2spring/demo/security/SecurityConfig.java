package ch.rasc.wamp2spring.demo.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import ch.rasc.wamp2spring.demo.security.jwt.JWTConfigurer;
import ch.rasc.wamp2spring.demo.security.jwt.TokenProvider;

@Configuration
public class SecurityConfig extends WebSecurityConfigurerAdapter {

	private final TokenProvider tokenProvider;

	public SecurityConfig(TokenProvider tokenProvider) {
		this.tokenProvider = tokenProvider;
	}

	@Bean
	@Override
	public AuthenticationManager authenticationManagerBean() throws Exception {
		return super.authenticationManagerBean();
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder(12);
	}

	@Override
	protected void configure(HttpSecurity http) throws Exception {
		// @formatter:off
		http
		  .csrf()
		    .disable()
		  .cors()
		    .and()
		  .sessionManagement()
			.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
			.and()
		  .authorizeRequests()
		    .antMatchers("/signup").permitAll()
		    .antMatchers("/login").permitAll()
		    .antMatchers("/public").permitAll()
		    .anyRequest().authenticated()
		    .and()
		  .apply(new JWTConfigurer(this.tokenProvider));
		// @formatter:on
	}

}