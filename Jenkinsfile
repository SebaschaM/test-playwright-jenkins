pipeline {
    agent { label 'docker-ubuntu-worker' }
    
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
                script {
                    // Guardamos el tiempo de inicio
                    env.START_TIME = System.currentTimeMillis().toString()
                }
                sh 'npx playwright install'
                // Ejecutamos las pruebas y generamos un reporte en JSON
                sh 'npx playwright test --reporter=json > playwright-report/report.json'
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
            script {
                def endTime = System.currentTimeMillis()
                def duration = (endTime - env.START_TIME.toLong()) / 1000

                // Leer y parsear el reporte JSON
                def reportFile = 'playwright-report/report.json'
                def passedTests = 0
                def failedTests = 0
                if (fileExists(reportFile)) {
                    def reportContent = readJSON(file: reportFile)
                    passedTests = reportContent.suites[0].specs.findAll { it.ok == true }.size()
                    failedTests = reportContent.suites[0].specs.findAll { it.ok == false }.size()
                }

                echo '¡Compilación y pruebas completadas con éxito!'
                publishHTML([
                    reportName: 'Reporte de Playwright',
                    reportDir: 'playwright-report',
                    reportFiles: 'index.html',
                    keepAll: true,
                    alwaysLinkToLastBuild: true,
                    allowMissing: true
                ])

                sendTelegramNotification("🎉 Jenkins Build SUCCESS: Finalizado exitosamente.\nDuración: ${duration} segundos\nPruebas: ✅ ${passedTests} exitosas, ❌ ${failedTests} fallidas\n[Ver reporte](URL_DEL_REPORTE)")
            }
        }
        failure {
            echo 'La compilación o las pruebas fallaron.'
            sendTelegramNotification("🚨 Jenkins Build FAILURE: Fallido. Revisa los logs para más detalles.\n[Ver reporte](URL_DEL_REPORTE)")
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
