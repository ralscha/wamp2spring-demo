package ch.rasc.wamp2spring.demo;

import javax.servlet.http.HttpSession;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class TestController {

	@GetMapping("/index")
	public String setSessionAttributes(HttpSession session) {
		session.setAttribute("test", 1);
		return "forward:/hidden.html";
	}

}
