pipeline {
    agent any

    environment {
        BACKEND_IMAGE  = 'taskmanager-backend'
        FRONTEND_IMAGE = 'taskmanager-frontend'
        IMAGE_TAG      = "${env.BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend Image') {
            steps {
                sh "docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} -t ${BACKEND_IMAGE}:latest ./Backend"
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh "docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} -t ${FRONTEND_IMAGE}:latest ./Frontend/taskmanager-ui"
            }
        }

       stage('Test Backend') {
    steps {
        sh """
            docker build --target tester -t taskmanager-backend-test:${IMAGE_TAG} ./Backend
            docker run --rm \
                --network=host \
                -e SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/taskmanager \
                -e SPRING_DATASOURCE_USERNAME=taskuser \
                -e SPRING_DATASOURCE_PASSWORD=taskpassword \
                taskmanager-backend-test:${IMAGE_TAG}
        """
    }
}

        stage('Load Images into Minikube') {
            steps {
                sh "minikube image load ${BACKEND_IMAGE}:${IMAGE_TAG}"
                sh "minikube image load ${FRONTEND_IMAGE}:${IMAGE_TAG}"
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh "kubectl set image deployment/taskmanager-backend backend=${BACKEND_IMAGE}:${IMAGE_TAG}"
                sh "kubectl set image deployment/taskmanager-frontend frontend=${FRONTEND_IMAGE}:${IMAGE_TAG}"
                sh "kubectl rollout status deployment/taskmanager-backend --timeout=120s"
                sh "kubectl rollout status deployment/taskmanager-frontend --timeout=120s"
            }
        }

        stage('Verify') {
            steps {
                sh "kubectl get pods"
                sh "kubectl get ingress"
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline completed successfully — build #${IMAGE_TAG} is live on Kubernetes"
        }
        failure {
            echo "❌ Pipeline failed — check the stage logs above"
        }
        always {
            sh "docker image prune -f --filter 'until=24h' || true"
        }
    }
}