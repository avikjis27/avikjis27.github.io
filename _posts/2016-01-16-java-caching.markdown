---
layout: post
title:  "Apache Commons - Java Caching System"
date:   2016-01-16 23:00:00 +0530
type: technology
categories: java
tags: java caching javaplot
place: Pune, India
---

Yet another nice and useful project from our favorite Apache team. It's quite a new contribution amongst all other Java caching framework like [Ehcached](http://www.ehcache.org/), [Memcached](http://memcached.org/).
<!--more-->
Let me share the situation when I felt caching may help. I am building an application where user could search for some common queries. Each time user hits for the query system fetch the result from database and then process it and return. So for queries which were very common we need to optimize the response time. The good option was to use some enterprise search solution like [Elasticsearch](https://www.elastic.co/products/elasticsearch) or [Apache Solr](http://lucene.apache.org/solr/) or other products like these. But we are financially constrained to use those products. So finally we decided to use MongoDB and one caching layer of JCS to reduce the load on DB layer. I will discuss how the performance improved using the caching layer in this post.
