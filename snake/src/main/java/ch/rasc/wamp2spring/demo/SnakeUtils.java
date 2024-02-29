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

import java.awt.Color;
import java.util.Random;

public class SnakeUtils {

	public static final int PLAYFIELD_WIDTH = 640;

	public static final int PLAYFIELD_HEIGHT = 480;

	public static final int GRID_SIZE = 10;

	private static final Random random = new Random();

	public static String getRandomHexColor() {
		float hue = random.nextFloat();
		// sat between 0.1 and 0.3
		float saturation = (random.nextInt(2000) + 1000) / 10000f;
		float luminance = 0.9f;
		Color color = Color.getHSBColor(hue, saturation, luminance);
		return '#'
				+ Integer.toHexString(color.getRGB() & 0xffffff | 0x1000000).substring(1);
	}

	public static Location getRandomLocation() {
		int x = roundByGridSize(random.nextInt(PLAYFIELD_WIDTH));
		int y = roundByGridSize(random.nextInt(PLAYFIELD_HEIGHT));
		return new Location(x, y);
	}

	private static int roundByGridSize(int value) {
		int newValue = value + GRID_SIZE / 2;
		newValue = newValue / GRID_SIZE;
		return newValue * GRID_SIZE;
	}

}
