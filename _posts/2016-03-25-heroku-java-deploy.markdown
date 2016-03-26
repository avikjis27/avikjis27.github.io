---
layout: post
title:  "Java web application hosting in Heroku"
date:   2016-03-25 23:00:00 +0530
categories: cloud
tags: JAVA CLOUD HEROKU
place: Pune, India
author: Avik Chakraborty
---

## Step 0
Hosting Java web application in in Heroku is very easy compared to the other cloud PAAS. Before being started be ready with the following software

 - Account on Heroku [Heroku Signup](https://id.heroku.com/login)
 - Java 8 [Download](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)
 - Maven 3 [Download](https://maven.apache.org/download.cgi)
 - Git Bash [Download](https://git-scm.com/downloads)
 
The links are, when ever applicable, of Windows. So if you are mischievious and using some different platform then do google when ever needed.

## Step 1
Install the Heroku toolbelt software from this [link](https://toolbelt.heroku.com/windows) and follow the prompts and click on the finish. After installing the Heroku toolbelt restart the system.

## Step 2
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

## Step 3
Login to your heroku account.

	C:\Users\Avik>heroku login
	Enter your Heroku credentials.
	Email: avikjis27@gmail.com
	Password (typing will be hidden):
	Logged in as avikjis27@gmail.com

## Step 5
Go inside your project folder and initialize git on that using following command

	C:\Users\Avik\git\Test>git init
	Initialized empty Git repository in C:/Users/Avik/git/Test/.git/

## Step 6
Add the remote repository for the heroku application

	C:\Users\Avik\git\Test>heroku git:remote -a myherokutestapp01
	set git remote heroku to https://git.heroku.com/myherokutestapp01.git

To cross check, whether the remote repository correctly added, run the following command

	C:\Users\Avik\git\Test>git remote -v
	heroku  https://git.heroku.com/myherokutestapp01.git (fetch)
	heroku  https://git.heroku.com/myherokutestapp01.git (push)

## Step 4
Create a simple maven web application in your favourite IDE and modify the *pom.xml* file as shown below
<script src="https://gist.github.com/avikjis27/64c3fa61df1dc50e24a6.js"></script>

## Step 7
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