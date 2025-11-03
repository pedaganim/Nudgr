# Multi-stage build for optimal image size
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Copy gradle wrapper and build files
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# Copy source code
COPY src src

# Build the application
RUN chmod +x gradlew && \
    ./gradlew build -x test --no-daemon

# Runtime stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring

# Create directories for uploads and logs (before switching user)
RUN mkdir -p /app/uploads /app/logs && \
    chown -R spring:spring /app

# Copy the built jar from builder stage
COPY --from=builder --chown=spring:spring /app/build/libs/*.jar app.jar

# Switch to non-root user
USER spring:spring

# Expose the application port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Run the application
# Heroku sets PORT env var, we pass it to Spring Boot
ENTRYPOINT ["sh", "-c", "java \
    -XX:+UseContainerSupport \
    -XX:MaxRAMPercentage=75.0 \
    -Djava.security.egd=file:/dev/./urandom \
    -Dserver.port=${PORT:-8080} \
    -jar app.jar"]
