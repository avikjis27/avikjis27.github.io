---
layout: post
title:  "Java web application hosting in Heroku"
date:   2016-03-25 23:00:00 +0530
type: technology
categories: cloud
tags: JAVA CLOUD HEROKU
place: Pune, India
author: Avik Chakraborty
gist: Hosting Java web application in in Heroku is very easy compared to the other cloud PAAS. Before being started be ready with the following software
---

 - Account on Heroku [Heroku Signup](https://id.heroku.com/login)
 - Java 8 [Download](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)
 - Maven 3 [Download](https://maven.apache.org/download.cgi)
 - Git Bash [Download](https://git-scm.com/downloads)
 
The links are, when ever applicable, of Windows. So if you are mischievious and using some different platform then do google when ever needed.

#### Step 1
Install the Heroku toolbelt software from this [link](https://toolbelt.heroku.com/windows) and follow the prompts and click on the finish. After installing the Heroku toolbelt restart the system.

#### Step 2
Open your command prompt and type the following command. The expected result is given below.
	
    C:\Users\Avik\git\Avik>heroku version
	heroku/toolbelt/3.42.44 (i386-mingw32) ruby/2.1.7
	heroku-cli/4.28.2-9156ffa (386-windows) go1.6
	=== Installed Plugins
	heroku-apps@1.6.0
	heroku-cli-addons@0.3.0
	heroku-fork@4.1.1
	heroku-git@2.4.5
	heroku-local@5.0.1
	heroku-orgs@1.0.5
	heroku-pipelines@1.1.1
	heroku-run@3.0.0
	heroku-spaces@2.0.14
	heroku-status@2.1.1

#### Step 3
Login to your heroku account.

	C:\Users\Avik>heroku login
	Enter your Heroku credentials.
	Email: avikjis27@gmail.com
	Password (typing will be hidden):
	Logged in as avikjis27@gmail.com

#### Step 4
Create an application on heroku from the web dashboard

![Heroku - Application creation](/images/blogs/2016-03-25-heroku-java-deploy/createapp1.PNG "Application creation on Heroku"){: .responsive-img } 
![Heroku - Application configuration](/images/blogs/2016-03-25-heroku-java-deploy/createapp2.PNG "Application configuration"){: .responsive-img } 	

#### Step 5
Go inside your project folder and initialize git on that using following command

	C:\Users\Avik\git\Test>git init
	Initialized empty Git repository in C:/Users/Avik/git/Test/.git/

#### Step 6
Add the remote repository for the heroku application

	C:\Users\Avik\git\Test>heroku git:remote -a myherokutestapp01
	set git remote heroku to https://git.heroku.com/myherokutestapp01.git

To cross check, whether the remote repository correctly added, run the following command

	C:\Users\Avik\git\Test>git remote -v
	heroku  https://git.heroku.com/myherokutestapp01.git (fetch)
	heroku  https://git.heroku.com/myherokutestapp01.git (push)

#### Step 7
Create a simple maven web application in your favourite IDE and modify the *pom.xml* file as shown below
<script src="https://gist.github.com/avikjis27/64c3fa61df1dc50e24a6.js"></script>

#### Step 8
Add a procfile in the route folder of your application
<script src="https://gist.github.com/avikjis27/14746257672fdbe26b3c.js"></script>

#### Step 9
Check the status of your working directory

	C:\Users\Avik\git\Test>git status
	On branch master

	Initial commit

	Untracked files:
	(use "git add <file>..." to include in what will be committed)

        .classpath
        .project
        WebContent/
        pom.xml
        src/

	nothing added to commit but untracked files present (use "git add" to track)
	
#### Step 10
Run the following command to commit the changes in local git repository

	C:\Users\Avik\git\Avik>git add .
	On branch master

	Initial commit

	Changes to be committed:
	(use "git rm --cached <file>..." to unstage)

        new file:   .classpath
        new file:   .project
        new file:   WebContent/META-INF/MANIFEST.MF
        new file:   WebContent/index.html
        new file:   pom.xml
        new file:   src/com/avik/Hello.java


	C:\Users\Avik\git\Test>git commit -m "initial commit"
	[master (root-commit) 8663a16] initial commit
	 6 files changed, 177 insertions(+)
	 create mode 100644 .classpath
	 create mode 100644 .project
	 create mode 100644 WebContent/META-INF/MANIFEST.MF
	 create mode 100644 WebContent/index.html
	 create mode 100644 pom.xml
	 create mode 100644 src/com/avik/Hello.java

#### Step 11
Push the changes to Heroku remote repository

	remote:        [INFO] ------------------------------------------------------------------------
	remote:        [INFO] BUILD SUCCESS
	remote:        [INFO] ------------------------------------------------------------------------
	remote:        [INFO] Total time: 12.827 s
	remote:        [INFO] Finished at: 2016-03-26T09:20:25+00:00
	remote:        [INFO] Final Memory: 22M/181M
	remote:        [INFO] ------------------------------------------------------------------------
	remote: -----> Discovering process types
	remote:        Procfile declares types -> (none)
	remote:
	remote: -----> Compressing...
	remote:        Done: 56.4M
	remote: -----> Launching...
	remote:        Released v4
	remote:        https://myherokutestapp01.herokuapp.com/ deployed to Heroku
	remote:
	remote: Verifying deploy.... done.

#### Step 12
Run the following command to scale the dynos


	C:\Users\Avik\git\Test>heroku ps:scale web=1
	Scaling dynos... done, now running web at 1:Free

#### Step 13
Check the application running on [Heroku](https://myherokutestapp01.herokuapp.com/)