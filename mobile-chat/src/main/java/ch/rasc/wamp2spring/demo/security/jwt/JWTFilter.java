package ch.rasc.wamp2spring.demo.security.jwt;

import java.io.IOException;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.GenericFilterBean;

import ch.rasc.wamp2spring.demo.Application;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Filters incoming requests and installs a Spring Security principal if a header
 * corresponding to a valid user is found.
 */
public class JWTFilter extends GenericFilterBean {

	public final static String AUTHORIZATION_HEADER = "Authorization";

	private final TokenProvider tokenProvider;

	public JWTFilter(TokenProvider tokenProvider) {
		this.tokenProvider = tokenProvider;
	}

	@Override
	public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse,
			FilterChain filterChain) throws IOException, ServletException {
		try {
			HttpServletRequest httpServletRequest = (HttpServletRequest) servletRequest;
			String jwt = resolveToken(httpServletRequest);
			if (StringUtils.hasText(jwt)) {
				Jws<Claims> jws = this.tokenProvider.validateToken(jwt);
				if (jws != null) {
					Authentication authentication = this.tokenProvider
							.getAuthentication(jws);
					SecurityContextHolder.getContext().setAuthentication(authentication);
				}
			}
			filterChain.doFilter(servletRequest, servletResponse);
		}
		catch (ExpiredJwtException | UnsupportedJwtException | MalformedJwtException
				| SignatureException | UsernameNotFoundException e) {
			Application.logger.info("Security exception {}", e.getMessage());
			((HttpServletResponse) servletResponse)
					.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
		}
	}

	private static String resolveToken(HttpServletRequest request) {
		String bearerToken = request.getHeader(AUTHORIZATION_HEADER);
		if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
			return bearerToken.substring(7);
		}
		String jwt = request.getParameter("access_token");
		if (StringUtils.hasText(jwt)) {
			return jwt;
		}
		return null;
	}
}
