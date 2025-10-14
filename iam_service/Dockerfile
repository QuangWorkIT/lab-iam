# Stage 1: Build with Maven
FROM maven:3.9.9-eclipse-temurin-21 AS builder
WORKDIR /app

# Copy pom.xml first for better layer caching
COPY pom.xml .
# Download dependencies in a separate layer
RUN mvn dependency:go-offline -B

# Copy source code and build
COPY src ./src
RUN mvn clean package -DskipTests \
    -Dmaven.test.skip=true \
    -Dmaven.compile.fork=true

# Stage 2: Run the app
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring
USER spring

# Copy the application jar
COPY --from=builder --chown=spring:spring /app/target/iam_service-0.0.1-SNAPSHOT.jar app.jar

# Use JVM options for containerized environments
ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

EXPOSE 8081

# Shell form for better signal handling and environment variable expansion
ENTRYPOINT exec java $JAVA_OPTS -jar app.jar