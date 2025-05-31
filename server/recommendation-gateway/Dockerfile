# Build stage
FROM gradle:8.9.0-jdk21 AS build
WORKDIR /app
COPY . .
RUN gradle build --no-daemon

# Run stage
FROM openjdk:21-jdk-slim

WORKDIR /app

ARG JAR_FILE=build/libs/recommendation-gateway-*.jar

COPY ${JAR_FILE} ./app.jar

EXPOSE 8090

ENTRYPOINT ["java", "-jar", "app.jar"]