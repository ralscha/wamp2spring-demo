package ch.rasc.wamp2spring.demo.security.jwt;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;
import java.util.UUID;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.exceptions.SignatureVerificationException;
import com.auth0.jwt.exceptions.TokenExpiredException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;

import ch.rasc.wamp2spring.demo.AppConfig;
import ch.rasc.wamp2spring.demo.Application;

@Component
public class TokenProvider {

	private final Algorithm algorithm;

	private final JWTVerifier verifier;

	private final long tokenValidityInMilliseconds;

	private final UserDetailsService userService;

	public TokenProvider(AppConfig config, UserDetailsService userService) {
		byte[] keyBytes = Base64.getEncoder()
				.encodeToString(config.getSecret().getBytes()).getBytes(StandardCharsets.UTF_8);
		this.algorithm = Algorithm.HMAC512(keyBytes);
		this.verifier = JWT.require(this.algorithm).build();
		this.tokenValidityInMilliseconds = 1000 * config.getTokenValidityInSeconds();
		this.userService = userService;
	}

	public String createToken(String username) {
		Date now = new Date();
		Date validity = new Date(now.getTime() + this.tokenValidityInMilliseconds);

		return JWT.create().withJWTId(UUID.randomUUID().toString()).withSubject(username)
				.withIssuedAt(now).withExpiresAt(validity).sign(this.algorithm);
	}

	public Authentication getAuthentication(DecodedJWT decoded) {
		String username = decoded.getSubject();
		UserDetails userDetails = this.userService.loadUserByUsername(username);

		return new UsernamePasswordAuthenticationToken(userDetails, "",
				userDetails.getAuthorities());
	}

	public DecodedJWT validateToken(String authToken) {
		try {
			return this.verifier.verify(authToken);
		}
		catch (SignatureVerificationException e) {
			Application.logger.info("Invalid JWT signature.");
			Application.logger.trace("Invalid JWT signature trace: {}", e);
		}
		catch (TokenExpiredException e) {
			Application.logger.info("Expired JWT token.");
			Application.logger.trace("Expired JWT token trace: {}", e);
		}
		catch (JWTVerificationException e) {
			Application.logger.info("Invalid JWT token.");
			Application.logger.trace("Invalid JWT token trace: {}", e);
		}
		catch (IllegalArgumentException e) {
			Application.logger.info("JWT token compact of handler are invalid.");
			Application.logger.trace("JWT token compact of handler are invalid trace: {}", e);
		}
		return null;
	}

}
