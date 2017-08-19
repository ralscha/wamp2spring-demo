#!/bin/sh

export JAVA_HOME=/opt/java
chmod 700 ./mvnw

cd bandwidth
../mvnw clean package
cp target/bandwidth.jar ../..

cd ../datachannel
../mvnw clean package
cp target/datachannel.jar ../..

cd ../earthquake
../mvnw clean package
cp target/earthquake.jar ../..

cd ../gauge
../mvnw clean package
cp target/gauge.jar ../..

cd ../iss
../mvnw clean package
cp target/iss.jar ../..

cd ../maps
../mvnw clean package
cp target/maps.jar ../..

cd ../pirate
../mvnw clean package
cp target/pirate.jar ../..

cd ../simple-chat
../mvnw clean package
cp target/simple-chat.jar ../..

cd ../smoothie
../mvnw clean package
cp target/smoothie.jar ../..

cd ../snake
../mvnw clean package
cp target/snake.jar ../..

cd ../tail
../mvnw clean package
cp target/tail.jar ../..

cd ../worldchat
../mvnw clean package
cp target/worldchat.jar ../..