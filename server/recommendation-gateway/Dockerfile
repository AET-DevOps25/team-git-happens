# Build stage
FROM gradle:8.9.0-jdk21 AS build
WORKDIR /app
COPY . .
RUN gradle build --no-daemon

# Run stage
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]