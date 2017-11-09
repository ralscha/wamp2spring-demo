package ch.rasc.wamp2spring.demo;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import ch.rasc.wamp2spring.WampPublisher;
import ch.rasc.wamp2spring.annotation.WampProcedure;

@RestController
@CrossOrigin
public class GeoController {

	private final WampPublisher wampPublisher;

	private final List<Position> positions;

	private final List<Stationary> stationaries;

	public GeoController(WampPublisher wampPublisher) {
		this.wampPublisher = wampPublisher;
		this.positions = new ArrayList<>();
		this.stationaries = new ArrayList<>();
	}

	@WampProcedure("getPositions")
	public List<Position> getPositions() {
		return this.positions;
	}

	@WampProcedure("getStationaries")
	public List<Stationary> getStationaries() {
		return this.stationaries;
	}

	@DeleteMapping("/clear")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void clear() {
		this.stationaries.clear();
		this.positions.clear();

		this.wampPublisher.publishToAll("clear");
	}

	@PostMapping("/pos")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void handleLocation(@RequestBody Position position) {
		this.wampPublisher.publishToAll("pos", position);

		this.positions.add(position);
		if (this.positions.size() > 100) {
			this.positions.remove(0);
		}
	}

	@PostMapping("/stationary")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void handleStationary(@RequestBody Stationary stationary) {
		this.wampPublisher.publishToAll("stationary", stationary);

		this.stationaries.add(stationary);
		if (this.stationaries.size() > 10) {
			this.stationaries.remove(0);
		}
	}

	@PostMapping("/clienterror")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void handleError(String errorMessage) {
		Application.logger.error(errorMessage);
	}

}
