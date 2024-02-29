package ch.rasc.wamp2spring.demo;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import ch.rasc.wamp2spring.annotation.WampProcedure;

@Service
public class WampTestService {

	@WampProcedure("firstcall")
	public String firstCall(@AuthenticationPrincipal UserDetails user) {
		System.out.println("first call");
		System.out.println(user);
		return "first";
	}

	@WampProcedure("secondcall")
	@RequireAdminAuthority
	public int secondCall(@AuthenticationPrincipal UserDetails user) {
		System.out.println("second call");
		System.out.println(user);
		return 23;
	}

}
