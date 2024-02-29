package ch.rasc.wamp2spring.demo;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import ch.rasc.wamp2spring.WampPublisher;
import ch.rasc.wamp2spring.annotation.WampProcedure;
import ch.rasc.wamp2spring.annotation.WampSessionId;
import ch.rasc.wamp2spring.event.WampDisconnectEvent;

@Service
public class GameService {

	private final Map<Long, Player> players = new ConcurrentHashMap<>();

	private final Set<Bullet> bullets = ConcurrentHashMap.newKeySet();

	private final WampPublisher wampPublisher;

	public GameService(WampPublisher wampPublisher) {
		this.wampPublisher = wampPublisher;
	}

	@EventListener
	public void onDisconnnect(WampDisconnectEvent event) {
		this.players.remove(event.getWampSessionId());
		this.wampPublisher.publishToAllExcept(event.getWampSessionId(), "update.players",
				this.players.values());
	}

	@WampProcedure("new.player")
	public void newPlayer(@WampSessionId long wampSessionId, Player player) {
		player.setId(wampSessionId);
		this.players.put(wampSessionId, player);
		this.wampPublisher.publishToAllExcept(wampSessionId, "update.players",
				this.players.values());
	}

	@WampProcedure("move.player")
	public void movePlayer(@WampSessionId long wampSessionId, Position position) {
		Player player = this.players.get(wampSessionId);
		if (player != null) {
			player.setX(position.getX());
			player.setY(position.getY());
			player.setAngle(position.getAngle());

			this.wampPublisher.publishToAllExcept(wampSessionId, "update.players",
					this.players.values());
		}
	}

	@WampProcedure("shoot.bullet")
	public void shootBullet(@WampSessionId long wampSessionId, Bullet bullet) {
		bullet.setOwnerWampSessionId(wampSessionId);
		this.bullets.add(bullet);
	}

	@Scheduled(fixedDelay = 16)
	public void gameLoop() {
		boolean removed = false;
		for (Bullet bullet : this.bullets) {
			bullet.incXandY();

			for (Player player : this.players.values()) {
				if (bullet.getOwnerWampSessionId() != player.getId()) {
					double dx = player.getX() - bullet.getX();
					double dy = player.getY() - bullet.getY();
					double dist = Math.sqrt(dx * dx + dy * dy);
					if (dist < 70) {
						this.wampPublisher.publishToAll("player.hit", player.getId());
					}
				}
			}

			// Remove if it goes too far off screen
			if (bullet.getX() < -10 || bullet.getX() > 1000 || bullet.getY() < -10
					|| bullet.getY() > 1000) {
				this.bullets.remove(bullet);
				removed = true;
			}

		}

		if (removed || !this.bullets.isEmpty()) {
			this.wampPublisher.publishToAll("bullets.update", this.bullets);
		}
	}

}
