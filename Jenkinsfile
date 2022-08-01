@Library('devops') _
pipeline {
 agent any
 options {
  disableConcurrentBuilds()
  timestamps()
 }
 stages {
  stage('Initialize') {
   steps {
    cleanWs()
    script {
     def jobName = env.JOB_BASE_NAME
     env.gitCred ="gitlab-hbot-ssh"
     env.gitUrl = "git@radev.amonra.com.tr:/WebCMS/app-cloudweb.git"
     env.branchName = "dev"
     if (!jobName.contains("app-cloudweb")) {
      env.gitUrl = "http://gitlab/WebCMS/app-cloudweb.git"
      env.gitCred = "mez-gitlab"
      env.branchName = "test"
     }
    }
    gitOperations(
     branch: env.branchName,
     credentials: env.gitCred,
     url: env.gitUrl
    )
   }
  }
  stage('Pre Build Application') {
  agent {
    docker {
      image 'node:latest'
      args '--cpus=0.5'
    }
  }
   steps {
     script{
       def jobName = env.JOB_BASE_NAME
	   if (jobName.contains("app-cloudweb")) {
		  writeFile file: '.env', text: '''PROJECT_ENV=development
		  OREST_PATH='/orest'
		  STATIC_URL=http://radev.amonra.com.tr:8223
		  OREST_URL=http://dev.hotech.systems:8223/orest
		  OREST_USER_EMAIL=bot2@hotech.systems
		  OREST_USER_PASS=test
		  REDIS_URL=dev.hotech.systems
		  REDIS_PORT=6379
		  MAIL_SENDER_MAIL=info@hotech.com.tr
		  RECAPTCHA_SITE_KEY=6LciIeQUAAAAAEIPLi05WE4F0I6vYq-xGUGp6Suo
		  RECAPTCHA_SECRET_KEY=6LciIeQUAAAAAAvRyfqZGmt5ITD4rDzRrXiyBBzl
		  GOOGLE_MAP_API_KEY=AIzaSyCaU49TyCMquTLSYekygqEgvoY2_D2Mtks'''
		  sh "npm install"
		  sh "npm run build"
		  sh "ls -la"
	   }
	 }
   }
  }   
  stage('Build Application') {
   steps {
    script {
     def jobName = env.JOB_BASE_NAME
     if (jobName.contains("app-cloudweb")) {
      sh "rsync -a --exclude '.git' . root@192.168.0.223:/var/www/node/appcloudweb;"
      def remote = [:]
	  remote.name = 'dev'
	  remote.host = 'dev.hotech.systems'
	  withCredentials([usernamePassword(credentialsId: 'dev-root-cred', passwordVariable: 'pass', usernameVariable: 'user')]) {
	    remote.user = user
		remote.password = pass
		remote.allowAnyHosts = true
      }
      sshCommand remote: remote, command: "docker-compose -f /root/amonra-dev/docker-compose.yml restart appcloudweb;"
     } else {
        if(jobName.contains("cloudweb-vima")){
            env.suffixForDomain = "vima"
            writeFile file: '.env', text: '''PROJECT_ENV=production
      PROJECT_PATH='cms'
      OREST_PATH='/orest'
      OREST_USER_EMAIL=destek@hotech.systems
      OREST_USER_PASS=1234
      REDIS_URL=hotech-redis-master
      REDIS_PORT=6379
      SSL_STATUS=true
      MAIL_SENDER_MAIL=info@hotech.com.tr
      RECAPTCHA_SITE_KEY=6LciIeQUAAAAAEIPLi05WE4F0I6vYq-xGUGp6Suo
      RECAPTCHA_SECRET_KEY=6LciIeQUAAAAAAvRyfqZGmt5ITD4rDzRrXiyBBzl
      GOOGLE_MAP_API_KEY=AIzaSyCaU49TyCMquTLSYekygqEgvoY2_D2Mtks'''
            sh "rm -rf .gitignore"
        }

      stage('To DockerRegistry') {
       def privateRepo = 'amonra-registry:5000'
       def baseRepo = 'node'
       def appName = 'cloudweb'
       // Kubernetes related definitions
       def deploymentName = 'hotech-cloudweb-'+env.suffixForDomain
       def kubeNamespace = 'products'
       def containerName = "cloudweb"

       // Get the Commit from the head and set names.
       def commitID = gitOperations.findCommitID()
       def commit = commitID.trim()
       def image = "${privateRepo}/${baseRepo}/${appName}"
       def imageTag = "${image}:${commit}"
       def imageLatestTag = "${image}:latest"

       sh("sudo docker build -t ${imageTag} -t ${imageLatestTag} .")
       sh("sudo docker push ${imageTag}")
       sh("sudo docker push ${imageLatestTag}")

       stage('To Kubernetes') {
        sh("kubectl --namespace=${kubeNamespace} set image deployment/${deploymentName} ${containerName}=${imageTag}")
       }
      }
     }
    }
   }
  }
  stage('Post Build Actions'){
    steps{
      script{
        def jobName = env.JOB_BASE_NAME
        if (jobName.contains("app-cloudweb")) {
	    if(currentBuild.currentResult=="SUCCESS"){
	      //gen Change Log
          def clTemp = '''{{#commits}}
{{hash}} {{authorName}}  {{commitTime}}
*{{{messageTitle}}}*
{{#messageBodyItems}}
  {{.}}
{{/messageBodyItems}}
{{/commits}}'''
          def changeLog = gitChangelog from: [type: 'REF', value: 'test'], returnType: 'STRING', template: clTemp, to: [type: 'REF', value: 'dev']
          sh "mv ../CHANGELOGCloudWeb.html ."
          def oldChangeLog = readFile 'CHANGELOGCloudWeb.html'
          env.changeLogSame = 'false'
          if (changeLog == oldChangeLog){
            env.changeLogSame = 'true'
          }

		  writeFile file: 'CHANGELOGCloudWeb.html', text: changeLog
          sh "mv CHANGELOGCloudWeb.html ../"
          env.changeLog = changeLog
          googlechatnotification message: env.changeLog, notifySuccess: true, url: 'https://chat.googleapis.com/v1/spaces/AAAAXhb83Kk/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=iyIvSt2HGh8lV-SHgYH5mk_i1uX-DwSIjCx1Q25rUyg%3D', sameThreadNotification: 'true'
        }
        }
      }
    }
  }
 }
 post {
  always {
    cleanWs()
  }
 }
}
