# TaskMaster SaaS

TaskMaster is a modern, premium, multi-user SaaS application built with **Java/Spring Boot** and **Angular**. It transforms the traditional task management experience into a secure, multi-tenant workspace with advanced filtering, real-time feedback, and a stunning glassmorphism UI.

## 🚀 Key Features

- **JWT-Based Authentication**: Secure login and registration.
- **Multi-Tenancy**: Complete data isolation between accounts.
- **Rich Task Features**: Priorities (Low/Medium/High), Due Dates, Categories, search, and pagination.
- **Premium UI/UX**: A responsive design with glassmorphism aesthetics, sidebar navigation, and loading skeletons.
- **API Documentation**: Integrated Swagger/OpenAPI documentation.

## 🏗️ Architecture

- **Backend**: Java 21, Spring Boot 3.5.x, JPA/Hibernate, PostgreSQL, JJWT.
- **Frontend**: Angular 19 (Standalone), CSS3, Material Symbols.
- **Infrastructure**: Docker, Kubernetes, Nginx.

---

## 🛠️ How to Run

### 1. Without Docker (Direct Host)

#### Prerequisites:
- Java 21+
- Node.js 20+
- PostgreSQL instance running on localhost:5432

#### Steps:
1.  **Backend**:
    ```bash
    cd Backend
    export APP_JWT_SECRET="your-64-char-hex-secret"
    ./mvnw spring-boot:run
    ```
2.  **Frontend**:
    ```bash
    cd Frontend/taskmanager-ui
    npm install
    npm start
    ```
    *Note: Access at http://localhost:4200. You may need to update the proxy config if running without Nginx.*

---

### 2. With Docker Compose

The simplest way to run the full stack locally with data persistence.

```bash
docker-compose up --build
```
- **Frontend**: http://localhost
- **Backend API**: http://localhost:8080 (Proxied)
- **Swagger UI**: http://localhost:8080/swagger-ui/index.html

---

### 3. With Kubernetes (K8s)

A production-ready setup with orchestration and ingress.

1.  **Start Cluster**:
    ```bash
    minikube start --addons=ingress
    ```
2.  **Sync Local Images** (Fixes "old version" issue):
    ```bash
    # Point terminal to minikube's Docker daemon
    eval $(minikube docker-env)

    # Build images inside minikube
    docker build -t taskmanager-backend:latest ./Backend
    docker build -t taskmanager-frontend:latest ./Frontend/taskmanager-ui
    ```
3.  **Apply Manifests**:
    ```bash
    kubectl apply -f k8s/
    ```
4.  **Force Refresh** (if images were already built):
    ```bash
    kubectl rollout restart deployment taskmanager-backend
    kubectl rollout restart deployment taskmanager-frontend
    ```
5.  **Access**: Use `minikube service taskmanager-frontend-service`.

---

### 4. Without Kubernetes (Docker Only)

If you wish to run individual containers without orchestration:
```bash
docker run -d --name task-db -e POSTGRES_PASSWORD=taskpassword postgres:16-alpine
docker build -t task-backend ./Backend
docker run -d --link task-db:db -e SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/taskmanager task-backend
```

---

## 🔒 Security & Environment

The following environment variables are required for a secure setup:
- `APP_JWT_SECRET`: A 256-bit (64-character hex) key for signing tokens.
- `SPRING_DATASOURCE_URL`: PostgreSQL connection string.

## 📄 License & Maintainers
Generated and Optimized by **Antigravity AI**.
Tagged: `v2.0.0-saas`
