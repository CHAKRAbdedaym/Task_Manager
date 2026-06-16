# TaskMaster Frontend

A premium Angular 19 standalone application with a modern Glassmorphism design system.

## 🎨 Design Philosophy
- **Glassmorphism**: Translucent cards with backdrop blur.
- **Responsive**: Fluid layouts for mobile, tablet, and desktop.
- **User-Centric**: Skeleton loaders, toast notifications, and empty states.

## 🛠️ Development
### Setup
```bash
npm install
```

### Run (Local Dev)
```bash
npm start
```
By default, the Angular dev server expects the backend on port 8080.

## 🚀 Production Deployment
The application is containerized using **Nginx**.
- **Stage 1**: Angular build (Build Optimizer enabled).
- **Stage 2**: Nginx server configuration (SPA routing fallback enabled).

## 🔒 Security Integration
- **Auth Service**: Manages user state and JWT storage.
- **Auth Interceptor**: Automatically attaches JWT to all API requests.
- **Auth Guard**: Protects `/tasks` route from unauthenticated access.

## 📁 Key Directories
- `src/app/core`: Interceptors, guards, and shared services.
- `src/app/pages`: Main view components (Tasks, Login, Register).
- `src/app/services`: API interaction layer.
- `src/styles.css`: Global design system and theme tokens.
