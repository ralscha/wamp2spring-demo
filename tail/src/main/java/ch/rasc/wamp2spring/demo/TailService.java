package ch.rasc.wamp2spring.demo;

import java.io.IOException;
import java.net.InetAddress;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.io.input.Tailer;
import org.apache.commons.io.input.TailerListenerAdapter;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.maxmind.geoip2.DatabaseReader;
import com.maxmind.geoip2.exception.AddressNotFoundException;
import com.maxmind.geoip2.exception.GeoIp2Exception;
import com.maxmind.geoip2.model.CityResponse;

import ch.rasc.wamp2spring.WampPublisher;
import eu.bitwalker.useragentutils.UserAgent;
import jakarta.annotation.PreDestroy;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Service
public class TailService {

	final Pattern accessLogPattern = Pattern.compile(getAccessLogRegex(),
			Pattern.CASE_INSENSITIVE | Pattern.DOTALL);

	final WampPublisher wampPublisher;

	private final ObjectMapper objectMapper;

	public ExecutorService executor;

	private final List<Tailer> tailers;

	private DatabaseReader reader = null;

	public TailService(@Value("${geoip2.cityfile}") String cityFile,
			@Value("${access.logs}") String accessLogs, WampPublisher wampPublisher) {
		this.wampPublisher = wampPublisher;
		this.objectMapper = new ObjectMapper();

		String databaseFile = cityFile;
		if (databaseFile != null) {
			Path database = Paths.get(databaseFile);
			if (Files.exists(database)) {
				try {
					this.reader = new DatabaseReader.Builder(database.toFile()).build();
				}
				catch (IOException e) {
					LoggerFactory.getLogger(getClass()).error("GeoIPCityService init", e);
				}
			}
		}

		this.tailers = new ArrayList<>();

		for (String logFile : accessLogs.split(",")) {
			Path p = Paths.get(logFile.trim());
			this.tailers.add(new Tailer(p.toFile(), new ListenerAdapter()));
		}

		this.executor = Executors.newFixedThreadPool(this.tailers.size());
		for (Tailer tailer : this.tailers) {
			this.executor.execute(tailer);
		}
	}

	@PreDestroy
	public void preDestroy() {
		if (this.tailers != null) {
			for (Tailer tailer : this.tailers) {
				tailer.stop();
			}
		}

		if (this.executor != null) {
			this.executor.shutdown();
		}
	}

	class ListenerAdapter extends TailerListenerAdapter {
		@Override
		public void handle(String line) {
			try {
				Access access = parseJsonAccess(line);
				if (access == null) {
					access = parseClassicAccess(line);
				}

				if (access == null) {
					System.out.println(line);
					return;
				}

				TailService.this.wampPublisher.publishToAll("demo.tail.geoip", access);
			}
			catch (Exception e) {
				e.printStackTrace();
			}
		}
	}

	private Access parseClassicAccess(String line) {
		Matcher matcher = this.accessLogPattern.matcher(line);
		if (!matcher.matches()) {
			return null;
		}

		return createAccess(matcher.group(1), Instant.now().toEpochMilli(),
				matcher.group(4), matcher.group(9));
	}

	private Access parseJsonAccess(String line) throws IOException {
		String trimmedLine = line.trim();
		if (!trimmedLine.startsWith("{")) {
			return null;
		}

		JsonNode root = this.objectMapper.readTree(trimmedLine);
		JsonNode request = root.path("request");

		String ip = textValue(request, "remote_ip");
		if (ip == null) {
			ip = textValue(request, "client_ip");
		}

		String message = joinRequest(textValue(request, "method"),
				textValue(request, "uri"));
		if (message == null) {
			message = textValue(root, "msg");
		}

		String userAgent = firstHeaderValue(request.path("headers"), "User-Agent");
		long date = epochMillis(root.path("ts"));

		return createAccess(ip, date, message, userAgent);
	}

	private Access createAccess(String ip, long date, String message,
			String userAgent) {
		if (ip == null || "-".equals(ip) || "127.0.0.1".equals(ip)) {
			return null;
		}

		CityResponse cr = lookupCity(ip);
		if (cr == null) {
			return null;
		}

		Access access = new Access();
		access.setIp(ip);
		access.setDate(date);
		access.setCity(cr.getCity().getName());
		access.setCountry(cr.getCountry().getName());
		access.setMessage(buildMessage(message, userAgent));
		access.setLl(new Double[] { cr.getLocation().getLatitude(),
				cr.getLocation().getLongitude() });
		return access;
	}

	private static String buildMessage(String message, String userAgent) {
		if (userAgent == null || userAgent.isBlank()) {
			return message;
		}

		UserAgent ua = UserAgent.parseUserAgentString(userAgent);
		if (ua == null) {
			return message;
		}

		String browserVersion = ua.getBrowserVersion() != null
				? ua.getBrowserVersion().getVersion()
				: "";
		if ("Unknown".equals(browserVersion)) {
			browserVersion = "";
		}

		String os = ua.getOperatingSystem() != null ? ua.getOperatingSystem().getName()
				: "";
		if ("Unknown".equals(os)) {
			os = "";
		}

		String browser = ua.getBrowser() != null ? ua.getBrowser().getName() : "";
		if ("Unknown".equals(browser)) {
			return message;
		}

		String uaString = String.join(" ", browser, browserVersion, os).trim()
				.replaceAll("\\s+", " ");
		if (message == null || message.isBlank()) {
			return uaString;
		}
		return message + "; " + uaString;
	}

	private static String joinRequest(String method, String uri) {
		if (method == null && uri == null) {
			return null;
		}
		if (method == null || method.isBlank()) {
			return uri;
		}
		if (uri == null || uri.isBlank()) {
			return method;
		}
		return method + " " + uri;
	}

	private static String textValue(JsonNode node, String fieldName) {
		JsonNode child = node.path(fieldName);
		if (child.isMissingNode() || child.isNull()) {
			return null;
		}
		String value = child.asText();
		return value == null || value.isBlank() ? null : value;
	}

	private static String firstHeaderValue(JsonNode headers, String headerName) {
		JsonNode values = headers.path(headerName);
		if (values.isArray() && !values.isEmpty()) {
			return values.get(0).asText();
		}
		if (!values.isMissingNode() && !values.isNull()) {
			return values.asText();
		}
		return null;
	}

	private static long epochMillis(JsonNode tsNode) {
		if (tsNode == null || tsNode.isMissingNode() || tsNode.isNull()) {
			return Instant.now().toEpochMilli();
		}
		if (tsNode.isNumber()) {
			return (long) (tsNode.asDouble() * 1000);
		}
		return Instant.now().toEpochMilli();
	}

	public CityResponse lookupCity(String ip) {
		if (this.reader != null) {
			CityResponse response;
			try {
				try {
					return this.reader.city(InetAddress.getByName(ip));
				}
				catch (AddressNotFoundException e) {
					return null;
				}
			}
			catch (IOException | GeoIp2Exception e) {
				LoggerFactory.getLogger(getClass()).error("lookupCity", e);
			}
		}

		return null;
	}

	private static String getAccessLogRegex() {
		String regex1 = "^([\\d.:a-z]+)"; // Client IP
		String regex2 = " (\\S+)"; // -
		String regex3 = " (\\S+)"; // -
		String regex4 = " \\[([\\w:/]+\\s[+\\-]\\d{4})\\]"; // Date
		String regex5 = " \"(.*?)\""; // request method and url
		String regex6 = " (\\d{3})"; // HTTP code
		String regex7 = " (\\d+|.+?)"; // Number of bytes
		String regex8 = " \"([^\"]+|.+?)\""; // Referer
		String regex9 = " \"([^\"]*|.*?)\""; // Agent

		return regex1 + regex2 + regex3 + regex4 + regex5 + regex6 + regex7 + regex8
				+ regex9;
	}

}