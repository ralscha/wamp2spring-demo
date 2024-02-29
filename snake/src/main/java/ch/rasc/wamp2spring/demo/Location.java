/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package ch.rasc.wamp2spring.demo;

import com.fasterxml.jackson.annotation.JsonIgnore;

public class Location {

	public int x;

	public int y;

	public Location(int x, int y) {
		this.x = x;
		this.y = y;
	}

	@JsonIgnore
	public Location getAdjacentLocation(Direction direction) {
		return switch (direction) {
		case NORTH -> new Location(this.x, this.y - SnakeUtils.GRID_SIZE);
		case SOUTH -> new Location(this.x, this.y + SnakeUtils.GRID_SIZE);
		case EAST -> new Location(this.x + SnakeUtils.GRID_SIZE, this.y);
		case WEST -> new Location(this.x - SnakeUtils.GRID_SIZE, this.y);
		case NONE -> this;
		default -> this;
		};
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) {
			return true;
		}
		if (o == null || getClass() != o.getClass()) {
			return false;
		}

		Location location = (Location) o;

		if ((this.x != location.x) || (this.y != location.y)) {
			return false;
		}

		return true;
	}

	@Override
	public int hashCode() {
		int result = this.x;
		return 31 * result + this.y;
	}
}
