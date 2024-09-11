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
            echo 'Build completed successfully!'
        }
        failure {
            echo 'Build failed. Please check the logs.'
        }
    }
}
