pipeline {
    agent any

    environment {
        REGISTRY   = "docker.io"
        IMAGE_NAME = "nguyentt07/certificate-app-frontend"   // đổi nếu username khác
        TAG        = "dev-${env.BUILD_NUMBER}"
        // Địa chỉ Backend mà TRÌNH DUYỆT người dùng gọi tới - không phải DNS nội bộ cluster
        NEXT_PUBLIC_API_URL = "http://100.77.202.105:30300"
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Check Environment') {
            steps {
                sh '''
                    node -v
                    npm -v
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                    if [ -f package-lock.json ]; then
                        npm ci
                    else
                        npm install
                    fi
                '''
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint --if-present || true'
            }
        }

        stage('Test') {
            steps {
                sh 'npm run test --if-present || true'
            }
        }

        // Build thật sự diễn ra bên trong Docker build (builder stage), không build ở đây
        // để đảm bảo NEXT_PUBLIC_API_URL được inline đúng lúc build image, không lệch môi trường.

        stage('Build & Push Image to Registry') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'REG_USER',
                    passwordVariable: 'REG_PASS'
                )]) {
                    sh '''
                    echo "$REG_PASS" | docker login "$REGISTRY" -u "$REG_USER" --password-stdin
                    docker build \
                        --build-arg NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" \
                        -t "$IMAGE_NAME:$TAG" .
                    docker push "$IMAGE_NAME:$TAG"
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([file(credentialsId: 'cert-dev-kubeconfig', variable: 'KUBECONFIG_FILE')]) {
                    sh '''
                    export KUBECONFIG="$KUBECONFIG_FILE"
                    kubectl set image deployment/frontend-deployment \
                        frontend="$IMAGE_NAME:$TAG" -n blockchain-dev
                    kubectl rollout status deployment/frontend-deployment \
                        -n blockchain-dev --timeout=120s
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "✅ Frontend CI/CD succeeded: ${IMAGE_NAME}:${TAG} deployed to blockchain-dev"
        }
        failure {
            echo 'Frontend CI/CD failed. Please check the Console Output.'
        }
        always {
            deleteDir()
        }
    }
}