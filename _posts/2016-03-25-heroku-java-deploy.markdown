---
layout: post
title:  "Java web application hosting in Heroku"
date:   2016-03-25 23:00:00 +0530
categories: cloud
tags: JAVA CLOUD HEROKU
place: Pune, India
author: Avik Chakraborty
---

##Step 0
Hosting Java web application in in Heroku is very easy compared to the other cloud PAAS. Before being started be ready with the following software

 - Account on Heroku [Heroku Signup](https://id.heroku.com/login)
 - Java 8 [Download](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)
 - Maven 3 [Download](https://maven.apache.org/download.cgi)
 - Git Bash [Download](https://git-scm.com/downloads)
 
The links are, when ever applicable, of Windows. So if you are mischievious and using some different platform then do google when ever needed.

##Step 1
Install the Heroku toolbelt software from this [link](https://toolbelt.heroku.com/windows) and follow the prompts and click on the finish. After installing the Heroku toolbelt restart the system.

##Step 2
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
##Step 3
Create a simple maven web application in your favourite IDE and modify the *pom.xml* file as shown below
	<project>
		...
		<build>
			...
			<plugins>
				...
				<plugin>
					<groupId>org.apache.maven.plugins</groupId>
					<artifactId>maven-dependency-plugin</artifactId>
					<version>2.3</version>
					<executions>
						<execution>
							<phase>package</phase>
							<goals>
								<goal>copy</goal>
							</goals>
							<configuration>
								<artifactItems>
									<artifactItem>
										<groupId>com.github.jsimone</groupId>
										<artifactId>webapp-runner</artifactId>
										<version>8.0.30.2</version>
										<destFileName>webapp-runner.jar</destFileName>
									</artifactItem>
								</artifactItems>
							</configuration>
						</execution>
					</executions>
				</plugin>
			</plugins>
		</build>
		...
	</project>





