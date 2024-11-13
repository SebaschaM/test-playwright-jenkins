pipeline {
    agent any
    
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
        stage('Preparation') {
            stages {
                stage('Clean Workspace') {
                    steps {
                        echo 'Cleaning workspace...'
                        cleanWs()
                    }
                }
                stage('Clone Repository') {
                    steps {
                        echo 'Cloning the repository...'
                        git branch: "${BRANCH}", credentialsId: "${CREDENTIALS_ID}", url: "${REPO_URL}"
                    }
                }
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Install NPM Dependencies') {
                    steps {
                        echo 'Installing npm dependencies...'
                        sh 'npm install'
                    }
                }
                stage('Install Playwright Dependencies') {
                    steps {
                        echo 'Installing Playwright dependencies...'
                        sh 'npx playwright install'
                    }
                }
            }
        }

        stage('Run Tests') {
            steps {
                echo 'Running Playwright tests...'
                sh 'npx playwright test'
            }
        }

        stage('Post-Install Cleanup') {
            steps {
                echo 'Cleaning up...'
                sh 'npm cache clean --force'
            }
        }
    }

    post {
        success {
            echo 'Build and tests completed successfully!'

            publishHTML([
                reportName: 'Playwright Report',
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
            echo 'Build or tests failed.'
            sendTelegramNotification('🚨 Jenkins Build FAILURE: El pipeline ha fallado. Revisa los logs para más detalles.')
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
