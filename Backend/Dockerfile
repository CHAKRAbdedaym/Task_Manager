# ──────────────────────────────────────────
# STAGE 1: Build the app using Maven
# ──────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-21 AS builder

# Set a working directory inside the container
WORKDIR /app

# Copy pom.xml first (so Docker can cache dependencies)
COPY pom.xml .

# Download all dependencies (this layer gets cached if pom.xml doesn't change)
RUN mvn dependency:go-offline -B

# Now copy the rest of the source code
COPY src ./src

# Build the project, skip tests for now
RUN mvn clean package -DskipTests

# ──────────────────────────────────────────
# STAGE 2: Run the app using a lightweight JRE
# ──────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy only the built .jar from stage 1
COPY --from=builder /app/target/*.jar app.jar

# Expose the port Spring Boot runs on
EXPOSE 8080

# Command to start the app
ENTRYPOINT ["java", "-jar", "app.jar"]
