package ch.rasc.wamp2spring.demo.security.jwt;

import java.util.Base64;
import java.util.Date;
import java.util.UUID;

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
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.SignatureException;
import io.jsonwebtoken.UnsupportedJwtException;

@Component
public class TokenProvider {

	private final String secretKey;

	private final long tokenValidityInMilliseconds;

	private final UserDetailsService userService;

	public TokenProvider(AppConfig config, UserDetailsService userService) {
		this.secretKey = Base64.getEncoder()
				.encodeToString(config.getSecret().getBytes());
		this.tokenValidityInMilliseconds = 1000 * config.getTokenValidityInSeconds();
		this.userService = userService;
	}

	public String createToken(String username) {
		Date now = new Date();
		Date validity = new Date(now.getTime() + this.tokenValidityInMilliseconds);

		return Jwts.builder().setId(UUID.randomUUID().toString()).setSubject(username)
				.setIssuedAt(now).signWith(SignatureAlgorithm.HS512, this.secretKey)
				.setExpiration(validity).compact();
	}

	public Authentication getAuthentication(Jws<Claims> jws) {
		String username = jws.getBody().getSubject();
		UserDetails userDetails = this.userService.loadUserByUsername(username);

		return new UsernamePasswordAuthenticationToken(userDetails, "",
				userDetails.getAuthorities());
	}

	public Jws<Claims> validateToken(String authToken) {
		try {
			return Jwts.parser().setSigningKey(this.secretKey).parseClaimsJws(authToken);
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
