package ch.rasc.wamp2spring.demo;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import jakarta.servlet.http.HttpSession;

@Controller
public class TestController {

	@GetMapping("/index")
	public String setSessionAttributes(HttpSession session) {
		session.setAttribute("test", 1);
		return "forward:/hidden.html";
	}

}
