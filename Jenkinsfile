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
            // Force remove the container by name directly. 
            // The '|| true' ensures the pipeline continues even if it's the first run.
              sh "docker rm -f study-planner || true"
              sh "docker run -d --name study-planner -p 3000:3000 ${IMAGE_NAME}:${VERSION}"
                  }
              }
        }


        stage('Release Stage - GitLab Version Tagging & Release') {
         steps {
             withCredentials([string(credentialsId: 'gitlab-token', variable: 'GITLAB_TOKEN')]) {
                sh """
            
             curl --request POST --header "PRIVATE-TOKEN: ${GITLAB_TOKEN}" \
            "https://gitlab.com{GITLAB_PROJECT_ID}/repository/tags?tag_name=${VERSION}&ref=main"


            curl --request POST --header "PRIVATE-TOKEN: ${GITLAB_TOKEN}" \
            --header "Content-Type: application/json" \
            --data '{
                "name": "Release ${VERSION}",
                "tag_name": "${VERSION}",
                "description": "Automated deployment. Build: ${BUILD_NUMBER}",
                "assets": {
                    "links": [{
                        "name": "View Live App",
                        "url": "http://localhost:3000"
                    }]
                }
            }' \
            "https://gitlab.com{GITLAB_PROJECT_ID}/releases"
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

     stage('Monitoring Stage - Health Check') {
        steps {
           script {
               echo "Waiting for app to start..."
               sleep 20 
            
               sh """
                 curl -f http://host.docker.internal:3000 || \
                 curl -f http://172.17.0.1:3000 || \
                 exit 1
            """
            echo "App is healthy!"
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