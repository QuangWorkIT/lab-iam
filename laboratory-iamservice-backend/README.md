# IamServiceApplication

This is an IAM (Identity and Access Management) service built with Spring Boot.

## Overview

This service provides basic IAM functionalities. It is designed to be run as a microservice and includes features for
service discovery with Netflix Eureka.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing
purposes.

### Prerequisites

* Java 21
* Maven 3.9+
* Docker (optional, for running with Docker)
* A running PostgreSQL instance
* A running Eureka server (optional, can be disabled in `application.yml`)

### Configuration

**Eureka:**
If you are not using a Eureka server, you can disable it by setting `eureka.client.enabled` to `false` in
`iam_service/src/main/resources/application.yml`.

### Folder `postgres-init` 

The `postgres-init` folder contains SQL scripts that are used to initialize the PostgreSQL database. When the PostgreSQL
container is started for the first time using `docker-compose`, it will execute the scripts in this folder to create the
necessary tables and schema for the application.

* **`V1_create_table.sql`**: This script creates the initial tables required for the IAM service.

### Configuration Files

This project uses a set of `application.yml` files to manage different configuration environments.

* **`application.yml`**: This is the base configuration file. It is always loaded. It's used to set the active Spring
  profile and to define common settings that are shared across all environments. In this project, it's used to set the
  active profile to `dev` and to disable the Eureka client by default.

* **`application-dev.yml`**: This file contains the configuration for the **development** environment. It is activated
  when the `spring.profiles.active` property is set to `dev`. This file is typically used for local development and
  contains settings such as the database connection to a local database.

* **`application-prod.yml`**: This file contains the configuration for the **production** environment. It is activated
  when the `spring.profiles.active` property is set to `prod`. This file contains settings for the production database,
  and other production-specific settings. The `Dockerfile` is configured to use the `prod` profile.

## Running the application

You can run the application in several ways:

### 1. Using your IDE

* Import the project into your favorite IDE (e.g., IntelliJ IDEA, Eclipse).
* Run the `IamServiceApplication` class.

### 2. Using Maven

```bash
  cd iam_service
  ./mvnw spring-boot:run
```

The application will be available at `http://localhost:8081`.

## Building with Maven

To build the application into a JAR file, run the following command:

```bash
  cd iam_service
  ./mvnw clean package
```

The JAR file will be created in the `target` directory.

## Running with Docker

You can also run the application using Docker for deployment/production.

### 1. Build the Docker image

```bash
  docker build -t iam-service .
```

### 2. Run the Docker container

```bash
  docker run -p 8081:8081 iam-service
```

This will start the application, and it will be accessible at `http://localhost:8081`.

The Docker configuration uses the `prod` profile, so it will connect to the PostgreSQL database on a host named
`postgres`. You can use the provided `docker-compose.yml` file to start both the application and a PostgreSQL database.

### Using Docker Compose

To run the application and a PostgreSQL database together, use Docker Compose.

**Before building or starting the containers run these command on window powershell**

Create this file script in the backend directory
```shell
  ./set-env.sh
```

Next, run this command
```shell
  chmod +x set-env.sh
```

Use the script
````shell
  source ./set-env.sh
````

**Start containers**

```shell
  docker compose up -d
```

This will start the `iam-service` and a PostgreSQL database in detached mode. To stop the services, run:

```bash
  docker-compose down
```
