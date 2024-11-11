---
title: Cognitive Refactoring
author: Avik Chakraborty
date: 2024-05-01
tags: ["post", "featured"]
image: 65535/54116295171_6f2f9458f4
imageAlt: This is a test
description: How frequently during code review do we get review comments asking for refactoring a few lines that seem very obvious to the author? I got similar review comments multiple times. Sometimes it is hard to back those review comments with a strong reason but flagged as a readability concern. But why?
---   

> Programs must be written for people to read, and only incidentally for machines to execute — Harold Abelson

How frequently during code review do we get review comments asking for refactoring a few lines that seem very obvious to the author? I got similar review comments multiple times. Sometimes it is hard to back those review comments with a strong reason but flagged as a readability concern. I know people in the industry who are opinionated about the notion of "clean code" and mostly biased toward 'their definition' of it and won't give space to other ideas of cleanliness. This post intends to discuss the rationale behind attempting such a refactor to enhance its cognitive (readability) quality.

Cognition is one of the main functional tasks of our brain. It involves short-term memory (STM), working memory(WM), and long-term memory (LTM) to work in harmony. The capacity and temporal nature of all these faculties are quite different. We need to 'present' our code in such a manner that the complex cognition process can parse it well for our fellow developers while they try to comprehend our code. 

When we look at the code snippet the STM is engaged first to store the signals. STM can hold a small amount of stimulus for a very short time, say a couple of seconds. As George A. Miller pointed out in his [seminal paper](https://en.wikipedia.org/wiki/The_Magical_Number_Seven,_Plus_or_Minus_Two) STM holds at max 7 ± 2 objects at a time. WM gets the signal from STM and collaborates with the LTM to connect to the past dots ( i.e. experiences) to make 'meaning' out of it. LTM has the 'dots' of our past development experiences of using a particular programming language. When we say "I understand" it indicates that the WM can recognize the signal captured in STM in connection to the dots present in LTM. Otherwise, we say "I don't understand". 

---

"Cognitive refactoring" talks about the re-presentation of a code such that a developer (maybe a newbie developer too) can easily comprehend it. Please read through the code below and figure out what it does.

```python
import random
class Student:
    def __init__(self, marks, roll):
        self.marks = marks
        self.roll = roll

students = [ Student(random.randint(1,100), i) for i in range(1,10)]
passed = [ student.roll for student in students if student.marks>50 ]
print(passed)
```

If you are a seasoned developer you may need little or no time to understand the above code. Think about a fresh Python developer. Won't it hurt? We read code line by line and process it line by line too. So the less information per line of code presented to us the fewer chances of burdening tiny STM, the easier to understand it.

See how it looks after cognitive refactoring it looks like.

```python
import random
class Student:
    def __init__(self, marks, roll):
        self.marks = marks
        self.roll = roll

students = [] 
for i in range(1,10):
    student = Student(random.randint(1,100), i)
    students.append(student)

passed = []
for student in students:
    if student.marks > 50:
        passed.append(student.roll)

print(passed)
```

Now go through each line and you understand what it does without stressing the cognitive ability.

---

Another my favorite example from shell scripting

```bash
ls *.jpg | awk '{print "rm -r " $1}' | bash - 
```

The above script can delete all the .jpg files in the current directory. I always find it difficult to understand such cryptic scripts. awk is a compelling text processing language, no doubt, but using awk in this way is counterintuitive. See another way to accomplish the same task.

```bash
find . -name '*.jpg' -exec rm -r {} \;
```

Isn't it more readable? Mark how different commands and options (e.g. find, name, exec) are in the second script demonstrating the purpose of the script. We are finding some files and executing the rm command to delete those files.

---

Cognitive ability may vary from developer to developer. The more you practice the more dots our LTM will gather and subsequently easier it will be to recognize a cryptic code snippet. That doesn't mean we would always expect an expert to read our code but we should practice targeting code for the broader coder community and make a sweet balance between readability and succinctness. 

With the advancement of AI in the future, we might expect different personalized views of a code as per the convenience of a developer. That day is not far when IDE would come up with such an advanced feature.

This write-up is inspired by the talk [How Your Brain Processes Code](https://www.youtube.com/watch?v=kjbhCgZvC2k) by Felienne Hermans.

Thank you.