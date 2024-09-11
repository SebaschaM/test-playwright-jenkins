pipeline {
    agent any

    tools {
        nodejs 'nodeversion21'  // Asegúrate de que 'nodeversion21' esté configurado en Jenkins
    }

    environment {
        REPO_URL = 'https://github.com/SebaschaM/test-playwright-jenkins'
        BRANCH = 'main'
        CREDENTIALS_ID = 'credentials'  // Asegúrate de que este ID corresponda a tus credenciales almacenadas
        TELEGRAM_TOKEN = '7377618683:AAEx00qqBQ_VfXS6mIQBZdQcuGrs9SuWpgg'  // Token del bot de Telegram
        TELEGRAM_CHAT_ID = '1852594941'  // Chat ID donde se enviarán las notificaciones
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

        success {
            echo 'Build and tests completed successfully!'

            // Publica el reporte HTML, permitir que continúe si no existe
            publishHTML([
                reportName: 'Playwright Report',
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                keepAll: true,
                alwaysLinkToLastBuild: true,
                allowMissing: true  // Cambiado a true para permitir que continúe si no encuentra el reporte
            ])

            echo 'Entrando a la carpeta playwright-report...'

            // Notificación de éxito en Telegram
            script {
                sh """
                curl -s -X POST https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage \\
                -d chat_id=${TELEGRAM_CHAT_ID} \\
                -d text="🎉 Jenkins Build SUCCESS: El pipeline ha finalizado exitosamente."
                """
            }

            // Enviar el archivo index.html del reporte a Telegram, verificando que el archivo exista
            script {
                def reportFile = "playwright-report/index.html"
                if (fileExists(reportFile)) {
                    sh """
                    curl -F "chat_id=${TELEGRAM_CHAT_ID}" -F "document=@${reportFile}" \\
                    "https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendDocument?caption=Playwright Test Report"
                    """
                } else {
                    echo "El archivo ${reportFile} no existe, no se enviará el reporte a Telegram."
                }
            }
        }

        failure {
            echo 'Build or tests failed. Please check the logs.'

            // Notificación de fallo en Telegram
            script {
                sh """
                curl -s -X POST https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage \\
                -d chat_id=${TELEGRAM_CHAT_ID} \\
                -d text="🚨 Jenkins Build FAILURE: El pipeline ha fallado. Revisa los logs para más detalles."
                """
            }
        }
    }
}
