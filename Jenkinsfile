pipeline {
    agent any

    environment {
        REPO_URL = 'https://github.com/SebaschaM/test-playwright-jenkins'
        BRANCH = 'main'
        CREDENTIALS_ID = 'credentials'  // Asegúrate de que este ID corresponda a tus credenciales almacenadas
    }

    stages {
        stage('Prepare') {
            steps {
                echo 'Preparing environment...'
                cleanWs()  // Limpia el workspace antes de iniciar
            }
        }

        stage('Git Clone') {
            when {
                branch 'main'  // Solo clona si la rama es 'main'
            }
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

        stage('Install Playwright') {
            when {
                expression { env.BRANCH == 'main' }  // Solo instala si está en la rama 'main'
            }
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
            when {
                expression { env.BRANCH == 'main' }  // Solo ejecuta las pruebas si la rama es 'main'
            }
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
        success {
            echo 'Build and tests completed successfully!'

            // Publica el reporte HTML solo si el archivo de reporte existe
            when {
                fileExists('playwright-report/index.html')  // Solo publica si el archivo existe
            }
            publishHTML([
                reportName: 'Playwright Report',
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                keepAll: true,
                alwaysLinkToLastBuild: true,
                allowMissing: true
            ])

            // Notificación de éxito en Telegram, solo si estamos en la rama 'main'
            when {
                branch 'main'
            }
            sendTelegramNotification("🎉 Jenkins Build SUCCESS: El pipeline ha finalizado exitosamente.")

            // Enviar el archivo index.html del reporte a Telegram, verificando que el archivo exista
            sendReportToTelegram()
        }

        failure {
            echo 'Build or tests failed. Please check the logs.'

            // Notificación de fallo en Telegram solo si el fallo ocurre en la rama 'main'
            when {
                branch 'main'
            }
            sendTelegramNotification("🚨 Jenkins Build FAILURE: El pipeline ha fallado. Revisa los logs para más detalles.")
        }
    }
}

def sendTelegramNotification(String message) {
    script {
        withCredentials([string(credentialsId: 'TELEGRAM_TOKEN', variable: 'TOKEN'), string(credentialsId: 'TELEGRAM_CHAT_ID', variable: 'CHAT_ID')]) {
            withEnv(['TELEGRAM_TOKEN=' + TOKEN, 'TELEGRAM_CHAT_ID=' + CHAT_ID]) {
                sh """
                curl -s -X POST https://api.telegram.org/bot\$TELEGRAM_TOKEN/sendMessage \\
                -d chat_id=\$TELEGRAM_CHAT_ID \\
                -d text="${message}"
                """
            }
        }
    }
}

def sendReportToTelegram() {
    script {
        def reportFile = 'playwright-report/index.html'
        if (fileExists(reportFile)) {
            withCredentials([string(credentialsId: 'TELEGRAM_TOKEN', variable: 'TOKEN'), string(credentialsId: 'TELEGRAM_CHAT_ID', variable: 'CHAT_ID')]) {
                withEnv(['TELEGRAM_TOKEN=' + TOKEN, 'TELEGRAM_CHAT_ID=' + CHAT_ID]) {
                    sh """
                    curl -F chat_id=\$TELEGRAM_CHAT_ID -F document=@${reportFile} \\
                    "https://api.telegram.org/bot\$TELEGRAM_TOKEN/sendDocument" -F "caption=Playwright Test Report"
                    """
                }
            }
        } else {
            echo "El archivo ${reportFile} no existe, no se enviará el reporte a Telegram."
        }
    }
}
