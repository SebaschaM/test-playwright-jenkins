pipeline {
    agent {
        docker {
            image 'mcr.microsoft.com/playwright:v1.48.1-noble' // La imagen de Playwright
        }
    }

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

        stage('Instalar Dependencias') {
            steps {
                echo 'Instalando dependencias npm...'
                sh 'npm ci' // Instalar dependencias con npm
            }
        }

        stage('Ejecutar Pruebas') {
            steps {
                echo 'Ejecutando pruebas de Playwright...'
                sh 'npx playwright install' // Instalar navegadores si no se ha hecho
                sh 'npx playwright test'    // Ejecutar las pruebas
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
