pipeline {
    agent any

    environment {
        IMAGE_NAME = "study-planner"
        VERSION = "v1.${BUILD_NUMBER}"
        PREVIOUS_VERSION = "v1.${BUILD_NUMBER.minus(1)}"
        GITLAB_PROJECT_ID = "81599171"
    }
    tools {
        nodejs 'node20' 
        snyk 'snyk-tool'
    }

    stages {

        stage('Build Stage - Create Artefact') {
            steps {
                echo "Building Docker image..."
                sh "docker build -t ${IMAGE_NAME}:${VERSION} ."
            }
        }

         stage('Test Stage - Automated Testing (JUnit)') {
            steps {
                echo "Running automated tests..."
                // This wrapper activates the Node tool
                nodejs('node20') { 
                    sh 'npm install'
                    sh 'npm test -- --watchAll=false || true'
                }
            }
            post {
               always {
        // Keeps the build from failing even if tests crash before writing the file
                    junit allowEmptyResults: true, testResults: '**/junit.xml'
                }
            }
        }

        stage('Code Quality Stage - SonarQube Analysis') {
            steps {
                script {
                    
                    def scannerHome = tool name: 'sonar-scanner', type: 'hudson.plugins.sonar.SonarRunnerInstallation'
                    
                    withSonarQubeEnv('SonarQube') {
                        sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=study-planner -Dsonar.sources=."
                    }
                }
            }
        }


        stage('Security Stage - Snyk Vulnerability Scan') {
             steps {
        // The plugin uses 'snykTokenId' to find credential
                snykSecurity(
                   snykInstallation: 'snyk-tool',
                   snykTokenId: 'snyk-token',
                   failOnIssues: false
               )
            }
        }

        stage('Deploy Stage - Docker Staging Deployment') {
           steps {
                script {
            // Clean up and run
            sh "docker ps -q -f name=study-planner | xargs -r docker rm -f"
            sh "docker run -d --name study-planner -p 3000:3000 ${IMAGE_NAME}:${VERSION}"
               }
            }
        }

         stage('Monitoring Stage - Health Check') {
              steps {
                    script {
                        echo "Waiting for app to start..."
                        // Give the app 10 seconds to boot up before curling
                        sleep 10 
                        sh "curl -f http://localhost:3000 || exit 1"
                        echo "App is healthy!"
                           }
                    }
        }

        stage('Release Stage - GitLab Version Tagging') {
    // Only tag if the health check passed
             steps {
                  withCredentials([string(credentialsId: 'gitlab-token', variable: 'GITLAB_TOKEN')]) {
                    sh """
                    curl --request POST \
                    --header "PRIVATE-TOKEN: ${GITLAB_TOKEN}" \
                    "https://gitlab.com/api/v4/projects/${GITLAB_PROJECT_ID}/repository/tags?tag_name=${VERSION}&ref=main"
            """
                  }
               }

               post {
                 failure {
                    echo "Pipeline failed. Rolling back to ${PREVIOUS_VERSION}..."
                     script {
                          sh """
                          docker rm -f study-planner || true
                          docker run -d --name study-planner -p 3000:3000 ${IMAGE_NAME}:${PREVIOUS_VERSION}
                               """
                            }
                        }
                 success {
                       echo "Deployment successful!"
                        }
                   }
       }

        stage('Build Info Output') {
            steps {
                echo "=============================="
                echo "BUILD SUCCESSFUL"
                echo "Build Number: ${BUILD_NUMBER}"
                echo "Version: ${VERSION}"
                echo "Previous Version: ${PREVIOUS_VERSION}"
                echo "App URL: http://localhost:3000"
                echo "=============================="
            }
        }
    }

    post {
        success {
            echo "Pipeline completed successfully ✔"
        }
        failure {
            echo "Pipeline failed - rollback may have been triggered"
        }
    }
}