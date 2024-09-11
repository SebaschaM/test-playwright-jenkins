pipeline {
    agent {
        docker {
            image 'mcr.microsoft.com/playwright:v1.44.1-jammy'
        }
    }
    stages {
        stage('e2e-tests') {
            steps {
                sh 'npm ci'
                sh 'npx playwright test'
            }
        }
    }
    post {
        always {
            script {
                sh 'curl -X POST -H "Content-Type: application/json" -d \'{"chat_id": "-4254450938", "text": "Ejecución de pruebas e2e finalizada"}\' "https://api.telegram.org/bot7469614639:AAEGvFH8Pi5Q7v_vM_jnctAIl9GO_n6nFyg/sendMessage"'
            }
            script {
                def result = currentBuild.result
                if (result != 'SUCCESS') {
                    sh 'curl -X POST -H "Content-Type: application/json" -d \'{"chat_id": "-4254450938", "text": "Error en la ejecución de pruebas e2e"}\' "https://api.telegram.org/bot7469614639:AAEGvFH8Pi5Q7v_vM_jnctAIl9GO_n6nFyg/sendMessage"'
                }
            }
            publishHTML([
                reportName: 'Playwright Report',
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                keepAll: true,
                alwaysLinkToLastBuild: true,
                allowMissing: false
            ])
        }
    }
}
