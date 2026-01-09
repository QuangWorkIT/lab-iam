# Laboratory Management - IAM Service

## Overview

This project is a comprehensive Identity and Access Management (IAM) system designed for a laboratory management platform. It is built with a microservices architecture to ensure scalability, resilience, and maintainability. The system handles user authentication, authorization, role management, and other critical security functions.

The backend is powered by Spring Boot, providing robust and scalable services, while the frontend is a modern and responsive single-page application built with React.

## Architecture Overview

The project follows a microservices pattern:

-   **Frontend UI**: A React-based single-page application that serves as the user interface for all IAM-related tasks.
-   **API Gateway**: The single entry point for all frontend requests. It routes traffic to the appropriate downstream service and handles cross-cutting concerns like security and rate limiting.
-   **Service Registry**: A discovery server (e.g., Eureka) that allows microservices to register themselves and discover others, enabling dynamic communication.
-   **IAM Service**: The core service responsible for managing users, roles, permissions, authentication (including JWT generation), and authorization.
-   **Notification Service**: A dedicated service for sending emails, SMS, or other notifications.
-   **Databases**: The system utilizes PostgreSQL for relational data (users, roles) and MongoDB for other data (e.g., notifications). Redis is used for caching.
-   **Message Broker**: Kafka is used for asynchronous communication between services.

All services are containerized using Docker for consistent development, testing, and production environments.

## Technology Stack

### Backend (`laboratory-iamservice-backend`)

-   **Framework**: Spring Boot 3
-   **Language**: Java 17
-   **Microservice Stack**: Spring Cloud (Gateway, Eureka)
-   **Database**: PostgreSQL, MongoDB
-   **Caching**: Redis
-   **Messaging**: Apache Kafka
-   **Build Tool**: Maven
-   **Containerization**: Docker

### Frontend (`laboratory-iamservice-frontend`)

-   **Framework**: React
-   **Language**: JavaScript (ES6+)
-   **Build Tool**: Vite
-   **State Management**: Redux Toolkit
-   **Styling**: CSS (with potential for a framework like Material-UI or Tailwind CSS)
-   **HTTP Client**: Axios
-   **Containerization**: Docker with Nginx

## Prerequisites

-   [Git](https://git-scm.com/)
-   [Docker](https://www.docker.com/products/docker-desktop/)
-   [Node.js](https://nodejs.org/en/) (for local frontend development)
-   [JDK 17](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html) (for local backend development)

## Cloning the Project

To get a local copy up and running, follow these simple steps.

```sh
git clone <YOUR_REPOSITORY_URL>
cd laboratory-management-iam-service
```

## Running the Project with Docker

The entire application can be started easily using Docker Compose.

### 1. Create Environment File

Navigate to the backend directory and create a `.env` file.

```sh
cd laboratory-iamservice-backend
touch .env
```

Open the `.env` file and add the following environment variables. Replace the placeholder values with your actual configuration.

```env
# PostgreSQL Configuration
POSTGRES_USER=admin
POSTGRES_PASSWORD=supersecretpassword
POSTGRES_DB=iam_db
PGTZ=Asia/Ho_Chi_Minh

# MongoDB Configuration
MONGO_INITDB_ROOT_USERNAME=mongoadmin
MONGO_INITDB_ROOT_PASSWORD=supersecretpassword

# JWT & Security Configuration
JWT_SECRET=your-super-strong-and-long-jwt-secret-key
APP_ENCRYPTION_KEY=your-32-character-long-encryption-key
ALLOWED_ORIGIN=http://localhost:5173
ALLOWED_PORT=5173
ALLOWED_IPS=127.0.0.1,172.25.0.1,172.25.0.11,172.25.0.12,172.25.0.13

# Mail Server (SMTP) Configuration
MAIL_USERNAME=youremail@example.com
MAIL_PASSWORD=yourapppassword

# Frontend Configuration
VITE_API_URL=http://localhost:8080
VITE_GOOGLE_CLIENT=your-google-client-id.apps.googleusercontent.com
```

### 2. Build and Run Containers

Once the `.env` file is configured, run the following command from the `laboratory-iamservice-backend` directory to build and start all the service containers.

```sh
docker-compose up --build
```

The `--build` flag forces Docker to rebuild the images from the source code. You can omit this flag for subsequent runs to start the services faster.

The application will be available at the following endpoints:
-   **Frontend**: [http://localhost:5173](http://localhost:5173)
-   **API Gateway**: [http://localhost:8080](http://localhost:8080)
-   **Service Registry**: [http://localhost:8761](http://localhost:8761)
-   **Swagger Document**: [http://localhost:8089/api/swagger-ui/index.html](http://localhost:8089/api/swagger-ui/index.html)

You can find initial account's credentials in the *DataSeeder.java* file in the backend src folder.

