# TaskMaster Backend

A secure, multi-tenant Spring Boot backend for the TaskMaster SaaS application.

## ⚙️ Requirements
- Java 21 (Temurin)
- Maven 3.9+
- PostgreSQL 16+

## 🔑 Authentication
Authentication is handled via **JWT (JSON Web Token)**. 
- **Secret Key**: Defined via `APP_JWT_SECRET` env var.
- **Stateless**: No sessions storage; tokens must be provided in the `Authorization: Bearer <token>` header.

## 📡 API Endpoints

### Public Endpoints
- `POST /api/auth/register`: Create a new account.
- `POST /api/auth/login`: Authenticate and receive a JWT.
- `GET /v3/api-docs`: OpenAPI definition.
- `GET /swagger-ui/index.html`: Interactive API docs.

### Protected Endpoints (Requires JWT)
- `GET /api/tasks`: List user's tasks (supports search, priority filter, pagination).
- `POST /api/tasks`: Create a new task.
- `PUT /api/tasks/{id}`: Update an existing task.
- `PATCH /api/tasks/{id}/toggle`: Mark task as complete/incomplete.
- `DELETE /api/tasks/{id}`: Remove a task.

## 🧪 Testing
Run the integration tests (including multi-tenancy isolation checks):
```bash
./mvnw test
```

## 🏗️ Build
```bash
./mvnw clean package
```
The Dockerfile uses a multi-stage build to keep the final image minimal.
