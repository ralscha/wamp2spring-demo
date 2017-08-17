package ch.rasc.wamp2spring.demo;

public class Bullet {
	private long ownerWampSessionId;

	private double speedX;

	private double speedY;

	private double x;

	private double y;

	private double angle;

	public long getOwnerWampSessionId() {
		return this.ownerWampSessionId;
	}

	public void setOwnerWampSessionId(long ownerWampSessionId) {
		this.ownerWampSessionId = ownerWampSessionId;
	}

	public double getSpeedX() {
		return this.speedX;
	}

	public void setSpeedX(double speedX) {
		this.speedX = speedX;
	}

	public double getSpeedY() {
		return this.speedY;
	}

	public void setSpeedY(double speedY) {
		this.speedY = speedY;
	}

	public double getX() {
		return this.x;
	}

	public void setX(double x) {
		this.x = x;
	}

	public double getY() {
		return this.y;
	}

	public void setY(double y) {
		this.y = y;
	}

	public double getAngle() {
		return this.angle;
	}

	public void setAngle(double angle) {
		this.angle = angle;
	}

	public void incXandY() {
		this.x += this.speedX;
		this.y += this.speedY;
	}

}
