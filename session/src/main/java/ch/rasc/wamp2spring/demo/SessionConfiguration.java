package ch.rasc.wamp2spring.demo;

import org.springframework.context.annotation.Bean;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.session.data.mongo.config.annotation.web.http.EnableMongoHttpSession;

import com.mongodb.client.MongoClients;

import ch.rasc.wamp2spring.session.servlet.EnableWampServletSession;

@EnableMongoHttpSession
@EnableWampServletSession
public class SessionConfiguration {

	@SuppressWarnings("resource")
	@Bean
	public MongoOperations mongoOperations() {
		return new MongoTemplate(MongoClients.create(), "sessiondemo");
	}

}
