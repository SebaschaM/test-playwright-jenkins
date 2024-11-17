pipeline {
    agent any

    environment {
        REPO_URL = 'https://github.com/SebaschaM/test-playwright-jenkins'
        BRANCH = 'main'
        CREDENTIALS_ID = 'credentials'
        TELEGRAM_TOKEN = credentials('TELEGRAM_TOKEN')
        TELEGRAM_CHAT_ID = credentials('TELEGRAM_CHAT_ID')
    }

    stages {
        stage('Clonar Repositorio') {
            steps {
                echo 'Clonando el repositorio...'
                git branch: "${BRANCH}", credentialsId: "${CREDENTIALS_ID}", url: "${REPO_URL}"
            }
        }

        stage('Preparar Entorno') {
            steps {
                script {
                    // Eliminar el contenedor si ya existe
                    sh 'docker rm -f playwright-test || true'
                    // Crear un nuevo contenedor de Playwright
                    sh 'docker run -d --rm --name playwright-test mcr.microsoft.com/playwright:v1.48.1-noble sleep infinity'
                }
            }
        }

        stage('Instalar Node.js y Dependencias') {
            steps {
                echo 'Instalando Node.js y dependencias npm...'
                sh '''
                # Instalar Node.js y npm en el contenedor de Playwright
                docker exec playwright-test bash -c "apt update && apt install -y nodejs npm"
                # Instalar dependencias con npm
                docker exec playwright-test bash -c "cd /var/jenkins_home/workspace/tiendada-test-api && npm ci"
                '''
            }
        }

        stage('Instalar Navegadores y Ejecutar Pruebas') {
            steps {
                echo 'Instalando navegadores y ejecutando pruebas de Playwright...'
                sh '''
                # Instalar navegadores si no se ha hecho
                docker exec playwright-test bash -c "npx playwright install"
                # Ejecutar las pruebas
                docker exec playwright-test bash -c "npx playwright test"
                '''
            }
        }
    }

    post {
        success {
            echo '¡Compilación y pruebas completadas con éxito!'
            publishHTML([
                reportName: 'Reporte de Playwright',
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                keepAll: true,
                alwaysLinkToLastBuild: true,
                allowMissing: true
            ])
            sendTelegramNotification('🎉 Jenkins Build SUCCESS: El pipeline ha finalizado exitosamente.')
            sendReportToTelegram()
        }
        failure {
            echo 'La compilación o las pruebas fallaron.'
            sendTelegramNotification('🚨 Jenkins Build FAILURE: El pipeline ha fallado. Revisa los logs para más detalles.')
        }
    }
}

def sendTelegramNotification(String message) {
    script {
        withCredentials([string(credentialsId: 'TELEGRAM_TOKEN', variable: 'TOKEN'), string(credentialsId: 'TELEGRAM_CHAT_ID', variable: 'CHAT_ID')]) {
            sh """
            curl -s -X POST https://api.telegram.org/bot\$TOKEN/sendMessage \\
            -d chat_id=\$CHAT_ID \\
            -d text="${message}"
            """
        }
    }
}

def sendReportToTelegram() {
    script {
        def reportFile = 'playwright-report/index.html'
        if (fileExists(reportFile)) {
            withCredentials([string(credentialsId: 'TELEGRAM_TOKEN', variable: 'TOKEN'), string(credentialsId: 'TELEGRAM_CHAT_ID', variable: 'CHAT_ID')]) {
                sh """
                curl -F chat_id=\$CHAT_ID -F document=@${reportFile} \\
                "https://api.telegram.org/bot\$TOKEN/sendDocument" -F "caption=Reporte de Pruebas de Playwright"
                """
            }
        } else {
            echo "El archivo ${reportFile} no existe, no se enviará el reporte a Telegram."
        }
    }
}
