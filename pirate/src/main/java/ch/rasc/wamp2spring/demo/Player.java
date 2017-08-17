package ch.rasc.wamp2spring.demo;

public class Player {
	private long id;
	private double x;
	private double y;
	private double angle;
	private double type;

	public long getId() {
		return this.id;
	}

	public void setId(long id) {
		this.id = id;
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

	public double getType() {
		return this.type;
	}

	public void setType(double type) {
		this.type = type;
	}

}
