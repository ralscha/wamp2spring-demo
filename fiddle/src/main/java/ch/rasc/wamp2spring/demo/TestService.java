package ch.rasc.wamp2spring.demo;

import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import ch.rasc.wampspring.WampPublisher;
import ch.rasc.wampspring.annotation.WampListener;
import ch.rasc.wampspring.annotation.WampProcedure;
import ch.rasc.wampspring.event.WampDisconnectEvent;
import ch.rasc.wampspring.event.WampSessionEstablishedEvent;
import ch.rasc.wampspring.event.WampSubscriptionCreatedEvent;
import ch.rasc.wampspring.event.WampSubscriptionDeletedEvent;
import ch.rasc.wampspring.event.WampSubscriptionSubscribedEvent;
import ch.rasc.wampspring.event.WampSubscriptionUnsubscribedEvent;

@Service
public class TestService {

	private final WampPublisher wampEventPublisher;

	public TestService(WampPublisher wampEventPublisher) {
		this.wampEventPublisher = wampEventPublisher;
	}

	@WampProcedure("add")
	public int add(int a, int b) {
		return a + b;
	}

	@EventListener
	public void created(WampSubscriptionCreatedEvent event) {
		System.out.println("created");
		System.out.println(event.getWampSessionId());
		System.out.println(event.getSubscriptionDetail());
		System.out.println("----------------------");
	}

	@EventListener
	public void subscribed(WampSubscriptionSubscribedEvent event) {
		System.out.println("subscribed");
		System.out.println(event.getWampSessionId());
		System.out.println(event.getSubscriptionDetail());
		System.out.println("----------------------");
	}

	@EventListener
	public void unsubscribed(WampSubscriptionUnsubscribedEvent event) {
		System.out.println("unsubscribed");
		System.out.println(event.getWampSessionId());
		System.out.println(event.getSubscriptionDetail());
		System.out.println("----------------------");
	}

	@EventListener
	public void deleted(WampSubscriptionDeletedEvent event) {
		System.out.println("deleted");
		System.out.println(event.getWampSessionId());
		System.out.println(event.getSubscriptionDetail());
		System.out.println("----------------------");
	}

	@EventListener
	public void established(WampSessionEstablishedEvent event) {
		System.out.println("session established");
		System.out.println(event.getWampSessionId());
		System.out.println(event.getWebSocketSessionId());
		System.out.println("----------------------");
	}

	@EventListener
	public void disconnnected(WampDisconnectEvent event) {
		System.out.println("disconnect");
		System.out.println(event.getWampSessionId());
		System.out.println(event.getWebSocketSessionId());
		System.out.println("----------------------");
	}

	@WampListener("com.myapp.hello")
	public void eventListener(String arg) {
		System.out.println(arg);

		this.wampEventPublisher.publishToAll("from_server", 23);
	}

}
