pipeline {
    agent any

    tools { 
        nodejs "nodeversion21"  // Asegúrate que 'nodeversion21' esté configurado en Jenkins
    }

    environment {
        REPO_URL = 'https://github.com/SebaschaM/test-playwright-jenkins'
        BRANCH = 'main'
        CREDENTIALS_ID = 'credentials'  // Asegúrate que este ID corresponda a tus credenciales almacenadas
    }

    stages {
        stage('Prepare') {
            steps {
                echo 'Preparing environment...'
                cleanWs()  // Limpia el workspace antes de iniciar
            }
        }

        stage('Git Clone') {
            steps {
                echo 'Cloning the repository...'
                script {
                    try {
                        git branch: "${BRANCH}", credentialsId: "${CREDENTIALS_ID}", url: "${REPO_URL}"
                    } catch (Exception e) {
                        error "Failed to clone repository: ${e.getMessage()}"
                    }
                }
            }
        }

        stage('Install System Dependencies') {
            steps {
                echo 'Installing system dependencies...'
                script {
                    try {
                        // Instala las dependencias del sistema para Playwright
                        sh 'npx playwright install-deps' 
                    } catch (Exception e) {
                        error "Failed to install system dependencies: ${e.getMessage()}"
                    }
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing npm dependencies...'
                script {
                    try {
                        sh 'npm install --silent'  // `--silent` para reducir el ruido en los logs
                    } catch (Exception e) {
                        error "Failed to install npm dependencies: ${e.getMessage()}"
                    }
                }
            }
        }

        stage('Install Playwright') {
            steps {
                echo 'Installing Playwright...'
                script {
                    try {
                        sh 'npx playwright install'  // Instala las dependencias de Playwright necesarias
                    } catch (Exception e) {
                        error "Failed to install Playwright: ${e.getMessage()}"
                    }
                }
            }
        }

        stage('Run Playwright Tests') {
            steps {
                echo 'Running Playwright tests...'
                script {
                    try {
                        sh 'npx playwright test'  // Ejecuta las pruebas con Playwright
                    } catch (Exception e) {
                        error "Playwright tests failed: ${e.getMessage()}"
                    }
                }
            }
        }

        stage('Post-Install Cleanup') {
            steps {
                echo 'Cleaning up temporary files...'
                sh 'npm cache clean --force'  // Limpieza de caché npm
            }
        }
    }

    post {
        always {
            echo 'Cleaning up workspace...'
            cleanWs()  // Limpia el workspace después del pipeline
        }
        success {
            echo 'Build and tests completed successfully!'
        }
        failure {
            echo 'Build or tests failed. Please check the logs.'
        }
    }
}
