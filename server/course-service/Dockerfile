# Use an official OpenJDK runtime as a parent image
FROM openjdk:21-jdk-slim

# Set the working directory in the container
WORKDIR /app

# Argument for the JAR file name (makes it easier to update if version changes)
# Assumes the JAR is in build/libs/ and is the only JAR there, or matches a pattern.
# Spring Boot typically names it <artifactId>-<version>.jar.
# From your build.gradle, version is '0.0.1-SNAPSHOT'.
# Assuming artifactId is 'course-service'.
ARG JAR_FILE=build/libs/course-service-*.jar

# Copy the fat JAR from the build context to the container
COPY ${JAR_FILE} ./app.jar

# Expose the port the application runs on
EXPOSE 8080

# Command to run the application
ENTRYPOINT ["java", "-jar", "app.jar"]