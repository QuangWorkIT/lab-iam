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

To provide a clearer and more visual overview of the technologies used in this project, the stack is grouped by layer and illustrated with recognizable icons.

### Backend (`laboratory-iamservice-backend`)

| Category          | Technology                                                                                                       |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| Language          | ![Java](https://img.shields.io/badge/Java-17-ED8B00?logo=openjdk\&logoColor=white)                               |
| Framework         | ![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3-6DB33F?logo=springboot\&logoColor=white)             |
| Microservices     | ![Spring Cloud](https://img.shields.io/badge/Spring%20Cloud-2023-6DB33F?logo=spring\&logoColor=white)            |
| API Gateway       | ![Spring Cloud Gateway](https://img.shields.io/badge/Gateway-Spring%20Cloud-6DB33F?logo=spring\&logoColor=white) |
| Service Discovery | ![Eureka](https://img.shields.io/badge/Eureka-Service%20Registry-6DB33F?logo=spring\&logoColor=white)            |
| Relational DB     | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql\&logoColor=white)                   |
| NoSQL DB          | ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb\&logoColor=white)                            |
| Cache             | ![Redis](https://img.shields.io/badge/Redis-DC382D?logo=redis\&logoColor=white)                                  |
| Messaging         | ![Apache Kafka](https://img.shields.io/badge/Kafka-000000?logo=apachekafka\&logoColor=white)                     |
| Security          | ![JWT](https://img.shields.io/badge/JWT-Authentication-000000?logo=jsonwebtokens\&logoColor=white)               |
| Build Tool        | ![Maven](https://img.shields.io/badge/Maven-Build-C71A36?logo=apachemaven\&logoColor=white)                      |
| Containerization  | ![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker\&logoColor=white)                               |

---

### Frontend (`laboratory-iamservice-frontend`)

| Category         | Technology                                                                                          |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| Framework        | ![React](https://img.shields.io/badge/React-18-61DAFB?logo=react\&logoColor=black)                  |
| Language         | ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript\&logoColor=black) |
| Build Tool       | ![Vite](https://img.shields.io/badge/Vite-Build-646CFF?logo=vite\&logoColor=white)                  |
| State Management | ![Redux](https://img.shields.io/badge/Redux-Toolkit-764ABC?logo=redux\&logoColor=white)             |
| Styling          | ![CSS3](https://img.shields.io/badge/CSS3-Styling-1572B6?logo=css3\&logoColor=white)                |
| HTTP Client      | ![Axios](https://img.shields.io/badge/Axios-HTTP-5A29E4)                                            |
| Web Server       | ![Nginx](https://img.shields.io/badge/Nginx-Server-009639?logo=nginx\&logoColor=white)              |
| Containerization | ![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker\&logoColor=white)                  |

---

### DevOps & Infrastructure

![Docker Compose](https://img.shields.io/badge/Docker%20Compose-Orchestration-2496ED?logo=docker\&logoColor=white)
![Git](https://img.shields.io/badge/Git-Version%20Control-F05032?logo=git\&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?logo=github\&logoColor=white)


## Prerequisites

-   [Git](https://git-scm.com/)
-   [Docker](https://www.docker.com/products/docker-desktop/)
-   [Node.js](https://nodejs.org/en/) (for local frontend development)
-   [JDK 17](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html) (for local backend development)

## Cloning the Project

To get a local copy up and running, follow these simple steps.

```sh
git clone https://github.com/QuangWorkIT/lab-iam.git
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

