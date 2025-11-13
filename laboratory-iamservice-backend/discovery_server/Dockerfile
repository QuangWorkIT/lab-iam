FROM maven:3.9.9-eclipse-temurin-21 as builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN  mvn clean package -DskipTests \
         -Dmaven.test.skip=true \
         -Dmaven.compile.fork=true

# run app
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S spring && adduser -S spring -G spring
USER spring
COPY --from=builder --chown=spring:spring /app/target/*.jar app.jar

ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

EXPOSE 8761
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]