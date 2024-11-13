pipeline {
    agent { label 'docker-ubuntu-worker' }
    // prueba
    tools {
        nodejs 'nodeversion21'
    }

    environment {
        REPO_URL = 'https://github.com/SebaschaM/test-playwright-jenkins'
        BRANCH = 'main'
        CREDENTIALS_ID = 'credentials'
        TELEGRAM_TOKEN = credentials('TELEGRAM_TOKEN')
        TELEGRAM_CHAT_ID = credentials('TELEGRAM_CHAT_ID')
    }

    stages {

        stage('Limpiar Workspace') {
            steps {
                echo 'Limpiando el workspace...'
                cleanWs()
            }
        }
        
        stage('Clonar Repositorio') {
            steps {
                echo 'Clonando el repositorio...'
                git branch: "${BRANCH}", credentialsId: "${CREDENTIALS_ID}", url: "${REPO_URL}"
            }
        }

        stage('Instalar Dependencias') {
            parallel {
                stage('Instalar Dependencias NPM') {
                    steps {
                        echo 'Instalando dependencias npm...'
                        sh 'npm ci'
                    }
                }
                stage('Instalar Dependencias Playwright') {
                    steps {
                        echo 'Instalando dependencias de Playwright...'
                        sh 'npx playwright install --with-deps'
                    }
                }
            }
        }

        stage('Ejecutar Pruebas') {
            steps {
                echo 'Ejecutando pruebas de Playwright...'
                sh 'npx playwright install'
                sh 'npx playwright test'
            }
        }

       stage('Limpieza Post-Instalación') {
            steps {
                echo 'Realizando limpieza...'
                sh 'npm cache clean --force'
            }
       }
    }

    post {
        success {
            def endTime = System.currentTimeMillis()
            def duration = (endTime - currentBuild.startTimeInMillis) / 1000
    
            echo '¡Compilación y pruebas completadas con éxito!'
            publishHTML([
                reportName: 'Reporte de Playwright',
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                keepAll: true,
                alwaysLinkToLastBuild: true,
                allowMissing: true
            ])
    
            sendTelegramNotification("🎉 Jenkins Build SUCCESS: Finalizado exitosamente.\nDuración: ${duration} segundos\nReporte: [Ver reporte](URL_DEL_REPORTE)")
        }
        failure {
            echo 'La compilación o las pruebas fallaron.'
            sendTelegramNotification("🚨 Jenkins Build FAILURE: Fallido. Revisa los logs.\nReporte: [Ver reporte](URL_DEL_REPORTE)")
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

def sendScreenshotToTelegram() {
    script {
        def screenshotFile = 'screenshot.png'
        if (fileExists(screenshotFile)) {
            withCredentials([string(credentialsId: 'TELEGRAM_TOKEN', variable: 'TOKEN'), string(credentialsId: 'TELEGRAM_CHAT_ID', variable: 'CHAT_ID')]) {
                sh """
                curl -F chat_id=\$CHAT_ID -F photo=@${screenshotFile} \\
                "https://api.telegram.org/bot\$TOKEN/sendPhoto" -F "caption=Captura del Reporte de Pruebas de Playwright"
                """
            }
        } else {
            echo "El archivo ${screenshotFile} no existe, no se enviará la captura a Telegram."
        }
    }
}

def sendPDFToTelegram() {
    script {
        def pdfFile = 'report.pdf'
        if (fileExists(pdfFile)) {
            withCredentials([string(credentialsId: 'TELEGRAM_TOKEN', variable: 'TOKEN'), string(credentialsId: 'TELEGRAM_CHAT_ID', variable: 'CHAT_ID')]) {
                sh """
                curl -F chat_id=\$CHAT_ID -F document=@${pdfFile} \\
                "https://api.telegram.org/bot\$TOKEN/sendDocument" -F "caption=Reporte de Pruebas de Playwright en PDF"
                """
            }
        } else {
            echo "El archivo ${pdfFile} no existe, no se enviará el PDF a Telegram."
        }
    }
}
