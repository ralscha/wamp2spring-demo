package ch.rasc.wamp2spring.demo.security.jwt;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;
import java.util.UUID;

import javax.crypto.SecretKey;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import ch.rasc.wamp2spring.demo.AppConfig;
import ch.rasc.wamp2spring.demo.Application;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;

@Component
public class TokenProvider {

	private final String secretKey;

	private final SecretKey hmacShaKey;

	private final long tokenValidityInMilliseconds;

	private final UserDetailsService userService;

	private final JwtParser jwtsParser;

	public TokenProvider(AppConfig config, UserDetailsService userService) {
		this.secretKey = Base64.getEncoder()
				.encodeToString(config.getSecret().getBytes());
		this.hmacShaKey = Keys
				.hmacShaKeyFor(this.secretKey.getBytes(StandardCharsets.UTF_8));
		this.tokenValidityInMilliseconds = 1000 * config.getTokenValidityInSeconds();
		this.userService = userService;
		this.jwtsParser = Jwts.parser().verifyWith(this.hmacShaKey).build();
	}

	public String createToken(String username) {
		Date now = new Date();
		Date validity = new Date(now.getTime() + this.tokenValidityInMilliseconds);

		return Jwts.builder().id(UUID.randomUUID().toString()).subject(username)
				.issuedAt(now).signWith(this.hmacShaKey).expiration(validity).compact();
	}

	public Authentication getAuthentication(Jws<Claims> jws) {
		String username = jws.getPayload().getSubject();
		UserDetails userDetails = this.userService.loadUserByUsername(username);

		return new UsernamePasswordAuthenticationToken(userDetails, "",
				userDetails.getAuthorities());
	}

	public Jws<Claims> validateToken(String authToken) {
		try {
			return this.jwtsParser.parseSignedClaims(authToken);
		}
		catch (SignatureException e) {
			Application.logger.info("Invalid JWT signature.");
			Application.logger.trace("Invalid JWT signature trace: {}", e);
		}
		catch (MalformedJwtException e) {
			Application.logger.info("Invalid JWT token.");
			Application.logger.trace("Invalid JWT token trace: {}", e);
		}
		catch (ExpiredJwtException e) {
			Application.logger.info("Expired JWT token.");
			Application.logger.trace("Expired JWT token trace: {}", e);
		}
		catch (UnsupportedJwtException e) {
			Application.logger.info("Unsupported JWT token.");
			Application.logger.trace("Unsupported JWT token trace: {}", e);
		}
		catch (IllegalArgumentException e) {
			Application.logger.info("JWT token compact of handler are invalid.");
			Application.logger.trace("JWT token compact of handler are invalid trace: {}",
					e);
		}
		return null;
	}

}
