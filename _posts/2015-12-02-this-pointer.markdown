---
layout: post
title:  "Almighty this Pointer"
date:   2015-12-02 01:24:55 +0530
type: technology
categories: javascript
tags: javascript this-pointer
place: Mumbai, India
image: 

---
This post is all about the most confusing topic of javascript this pointer. This post will try to illustrate the behavior of this pointer
in different context and will uncover the magic behind those scenarios. I would also like to give some very common use cases of this pointer
and will try to use our knowledge to feel the depth.
<!--more-->

### What is this in JavaScript?

Can you answer who asked you to do a recharge and who ordered you to complete your home work? Do you think that the below code can answer this? Lets try it on your browser.

{% highlight javascript linenos%}

var doIt = function(task){
	console.log( this.who + ' asked me to do '+ task); //Check 1
};

var mother = {
	who : 'Mother',
	order: function(task){
		doIt(task); // Check 2
	}
};

mother.order('home work');

{% endhighlight %}

Output

	undefined asked me to do recharge
	undefined asked me to do home work

From the output its pretty clear that **this** is now behaving as per our expectation. If we put a logger at *Check 1* and print this on console we will see this points to the *Window* object and on *Check 2* we can observe this points to our parent correctly. Lets first make this snippet working as per our expectation then we could do in depth analysis of it. So how do you suggest me to do that? Lets try it!

##### Way 1 : A naive approach  
{% highlight javascript linenos%}
var doIt = function(task,parent){
	console.log( parent.who + ' asked me to do '+ task);
};

var mother = {
	who : 'Mother',
	order: function(task){
		doIt(task, this);
	}
};

mother.order('home work');
{% endhighlight %}


##### Way 2 : An expert approach

{% highlight javascript linenos%}
var doIt = function(task){
	console.log( this.who + ' asked me to do '+ task);
};

var father = {
	who : 'Father',
	order: function(task){
		doIt.apply(this, [task]); //Check 3

	}
};

var mother = {
	who : 'Mother',
	order: function(task){
		doIt.call(this, task);  //Check 6
	}
};
father.order('recharge');
mother.order('home work');
{% endhighlight %}
Output

	Father asked me to do recharge
	Mother asked me to do home work


I will not discuss the approach shown in the *Way 1*, its self explanatory. Let us concentrate on the *Way 2*. Here we have used two method namely **bind()** and **call()**. Both the method works hard to achieve our desired output. Before going to discuss about these method let us try to understand why our first code failed.

As discussed in the **Scope** chapter all the global variables declared are kept inside the *Window* container. As we are directly calling the global *doIt()* function, this implicitly pointing to the *Window* (though in the strict mode it will be undefined) with which it is attached to. You are always welcome to inspect the *Window* object but please don't blame me if you are overwhelmed. As we could expect that *this* pointer not always points to the object we are expecting and this opens up the question 'Is there any way to make *this* pointing to our desired object?'. **bind()** and **call()** function serves the same purpose.


### Call



------------------------------
{% highlight javascript linenos%}
fun.call(thisArg[, arg1[, arg2[, ...]]])
{% endhighlight %}
A different this object can be assigned when calling an existing function. this refers to the current object, the calling object. With call, you can write a method once and then inherit it in another object, without having to rewrite the method for the new object... [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call)


----------------------------

First part of the definition is clear from our previous example (don't worry if you have some doubts, take deep breathe and go on, surely will clear in next few examples) but the inheritance part is bit hazy right ! Let's take that part in the next example.

{% highlight javascript linenos%}
var tasks = {
		doIt: function(task){
			console.log( this.who + ' asked me to do '+ task +' I am doing it');
		}
};

var mother = {

	who : 'Mother',
	order: function(task){
		tasks.doIt.call(this, task); //Check 8		
	}
};

mother.order('home work');
{% endhighlight %}

Observing the call at Check 7 and 8 we could understand that the doIt method although belongs to the object tasks, using it from the context of mother, giving way to access its own property like who, as if doIt is inherited by mother object.

Sounds easy!!








> Written with [StackEdit](https://stackedit.io/).
[jekyll-docs]: http://jekyllrb.com/docs/home
[jekyll-gh]:   https://github.com/jekyll/jekyll
[jekyll-talk]: https://talk.jekyllrb.com/
