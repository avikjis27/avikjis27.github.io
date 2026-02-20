---
title: How a DNS Glitch Triggered a Global AWS Outage, an In-Depth Analysis
author: Avik Chakraborty
date: 2025-10-30
tags: ["post", "featured"]
description: It was Diwali night in India. The on-call person was probably lighting firecrackers in their yard when the PagerDuty storm began. I believe many companies worldwide faced similar challenges on the 19th and 20th of October when the AWS global outage started affecting their services too. After examining the details of the outage provided here, I aimed to demystify the complexities to better grasp their impact. Numerous interdependencies contribute to global outages. In this blog, I will endeavor to dissect the problem for enhanced clarity.
---  

## Incident summary

From October 19th at 11:48 PM to October 20th at 2:40 AM (PST), several AWS services were disrupted due to an outage of the DynamoDB service in the us-east-1 region. DynamoDB acts as a metadata store for the control planes of various AWS services, which were significantly affected during and after the outage. The disruption of multiple services resulted from a single service outage in the us-east-1 region. Besides DynamoDB and EC2, services like NLB, Lambda, API Gateway, ECS, EKS, Step Functions, CloudFormation, and EventBridge were all affected.

## Decoding the Domino Effect: A Step-by-Step Breakdown

**Problem:** DynamoDB service in us-east-1 was not reachable. Why?

- Because the DNS record for dynamodb.us-east-1.amazonaws.com was incorrectly updated to an empty record, removing its regional endpoints. Why?
- The DNS management automation (DNS Enactor) issued a faulty update. Why?
- The DNS Enactor encountered a race condition triggered by unusually high delays in checking endpoint health and applying its plan. Why?
- Those delays caused multiple Enactor instances across AZs to overlap, producing conflicting state updates and an incorrect empty record. Why?
- The retry mechanism—which should have corrected these temporary inconsistencies—failed just before the incident, leaving the wrong plan applied.

**Problem:** EC2 APIs showed high error rates, latency, and instance-launch failures in us-east-1. Why?

- The Droplet Workflow Manager (DWFM), which manages EC2 instance lifecycle, couldn’t bring new droplets (hosts) into service. Why?
- Because DWFM could not update or read instance-state metadata in DynamoDB. Why?
- Because DynamoDB was unreachable due to the DNS outage (see Phase 1).
- Once DynamoDB was restored, DWFM could launch instances but they came without full network configuration. Why?
- The Network Manager service had an enormous backlog of pending requests, choking propagation of ENI and route data across the VPC fabric.

**Problem:** Customers saw increased NLB connection errors and backend flapping in us-east-1. Why?

- The NLB health-checking subsystem began marking healthy backends as unhealthy. Why?
- Because the subsystem was bringing new EC2 instances (for health checks) online while their network state had not yet propagated. Why?
- Network propagation delays came from the Network Manager backlog (see Phase 2). Why?
- This caused intermittent health-check failures, toggling endpoints in and out of DNS records. Why?
- Continuous DNS flapping degraded connectivity for many AWS services relying on NLBs (including DynamoDB, EC2 APIs, and internal control planes).

## Phase 1 : The Initial Spark
19th October 11:48 PM to 20th October 2:40 AM (PST)

> … customers experienced increased Amazon DynamoDB API error rates in the N. Virginia (us-east-1) Region. During this period, customers and other AWS services with dependencies on DynamoDB were unable to establish new connections to the service. The incident was triggered by a latent defect within the service’s automated DNS management system that caused endpoint resolution failures for DynamoDB…

Here is a possible block diagram of the systems involved in the saga, as I understood from the announcement page. Route53 is AWS’s DNS service that manages human-readable domain names (like dynamodb.us-east-1.amazonaws.com) and IP mappings for both internal and external services. Therefore, the domain name and IP mapping of different DynamoDB service endpoints (e.g., Global Endpoint, account-specific DynamoDB Endpoint, FIPS-compliant Endpoint, etc) are managed within Route53. The monitoring subsystem is responsible for correctly updating the Route53 entries.

The monitoring subsystem contains two subcomponents: DNS Planner and DNS Enactor.


> DNS Planner, monitors the health and capacity of the load balancers and periodically creates a new DNS plan for each of the service’s endpoints.


> DNS Enactor, enacts DNS plans by applying the required changes in the Amazon Route53 service. For resiliency, the DNS Enactor operates redundantly and fully independently in three different Availability Zones (AZs). Each of these independent instances of the DNS Enactor looks for new plans and attempts to update Route53 by replacing the current plan with a new plan using a Route53 transaction, assuring that each endpoint is updated with a consistent plan even when multiple DNS Enactors attempt to update it concurrently

<figure>
  <img src="/assets/blog/2025-10-30/DynamoDB-control-plane.jpeg" alt="DynamoDB control plane" title="DynamoDB control plane" />
  <figcaption>DynamoDB control plane</figcaption>
</figure>

Let's look at the pseudo-code for the DNS Enactor. Multiple instances of the DNS Enactor run independently and update Route53 using the Route53 transaction. This transaction makes the Route53 update part of the code a critical section that deals with the critical shared resource Route53 service, so synchronization is important. If not handled carefully, it could lead to edge cases, which I strongly believe happened here.

```
Picks up the latest available plan as current_plan.
if (The current_plan is newer than the previously_applied_plan) do:
    for (all the available end points) do:
        retry:
            update route53 entry for the EP
        until (route53 update is successfull)
    done 
    for (all the available end points) do:
        cleanup old_plan
    done
done
```

Let's assume there are two instances of the DNS Enactor (DE1 and DE2) and the DNS Planner (DPL) running at the same time. Below, I attempt to demonstrate a possible interleaved flow that ultimately left the shared resource, Route53, in an inconsistent state.

```
DPL:    Generates a new plan called PLAN_1

DE1:    Picks up the latest available plan as PLAN_1.
DE1:    if (The PLAN_1 is newer than the Previously_Applied_Plan) do:
DE1:        for (all the available end points) do:
DE1:            retry:
DE1:                update route53 entry for the EP
DE1:                Waiting for the updates to complete

DPL:    Generates a new plan called PLAN_2

DE1:                Waiting for the updates to complete #Unusual delay caused this waiting 

DE2:    Picks up the latest available plan as PLAN_2.
DE2:    if (The PLAN_2 is newer than the previously_applied_plan) do:
DE2:        for (all the available end points) do:
DE2:            retry:
DE2:                update route53 entry for the EP
DE2:            until (route53 update is successfull with PLAN_2)
DE2:        done 

DE1:                Waiting for the updates to complete
DE1:            until (route53 update is successfull with PLAN_1) #Override PLAN_2 with PLAN_1
DE1:        done 

DE2:        for (all the available end points) do:
DE2:            cleanup PLAN_0, PLAN_1
DE2:        done
DE2:    done

DE1:        for (all the available end points) do:
DE1:            cleanup PLAN_0 #Maybe it wont find PLAN_0 as it is deleted by DE2 already.
DE1:        done
DE1:    done
```

If you carefully review the interleaved code flow, you'll see that Route53 ends up with PLAN_1, which is not valid because it's outdated and was deleted by DE2 during its cleanup phase. As a result, the DynamoDB's Route53 entries are null, making DynamoDB unreachable in the us-east-1 region.

Remember, AWS is “regionally independent” but not fully isolated. In theory, each AWS region (e.g., us-west-2, eu-west-1, ap-south-1) operates independently. In practice, us-east-1 is special - it hosts a lot of global control-plane services and metadata stores. So the outage of DynamoDB in the us-east-1 region could potentially lead to a global outage. Unfortunately, that is what happened.

## Phase 2 : The Ripple Effect
20th October 2:25 AM to 10:36 AM (PST)

> … customers experienced increased EC2 API error rates, latencies, and instance launch failures in the N. Virginia (us-east-1) Region. Existing EC2 instances that had been launched prior to the start of the event remained healthy and did not experience any impact for the duration of the event.

<figure>
  <img src="/assets/blog/2025-10-30/ec2-control-plane.jpeg" alt="EC2 Control plane" title="EC2 Control plane" />
  <figcaption>EC2 Control plane</figcaption>
</figure>

To understand the events of Phase 2 and how they relate to the unavailability of DynamoDB in Phase 1, we need to know how AWS manages EC2 instances. The DropletWorkflow Manager (DWFM) is responsible for managing all the physical servers that host EC2 instances, which they refer to as "droplets." Although I'm not entirely sure what a droplet is, for this discussion, let's assume a droplet is the server that can host multiple EC2 instances.

Each DWFM manages a set of droplets within each Availability Zone and maintains a lease for each droplet currently under management. This lease allows DWFM to track the droplet state, ensuring that all actions from the EC2 API or within the EC2 instance itself, such as shutdown or reboot operations originating from the EC2 instance operating system, result in the correct state changes within the broader EC2 systems.*So, the lease holds the metadata for each droplet (and possibly for each EC2 instance as well) and is managed by the control plane.

It is clear that all these control plane subsystems rely on DynamoDB to store their states. During Phase 1 of the incident, DWFM state checks began to fail because they depend on DynamoDB, which was in an inconsistent state due to its unavailability.

This essentially means that any activity that could update the state of the EC2 instances (or droplets) could not occur. Since the EC2 instances couldn't refresh existing leases or obtain new ones, API calls to create new EC2 instances resulted in "insufficient capacity errors."

Once DynamoDB was restored, the DWFM began creating new leases and refreshing old ones. However, due to a long queue of pending requests, DWFM became congested and couldn't progress in recovering droplet leases. To resolve this, AWS introduced request throttling, which sometimes results in "request limit exceeded" errors to maintain a consistent and manageable load.

Another subsystem is the Network Manager, which manages and updates the network state for all EC2 instances. This subsystem must also maintain a data structure in the control plane to keep track of the network interfaces' state. As soon as the DWFM started creating new leases this subsystem began propagating updated network configurations to newly launched instances. But again due to a long queue of pending requests Network Manager started experiencing delays. While new EC2 instances could be launched successfully, they would not have the necessary network connectivity due to the delays in network state propagation.

## Phase 3 : The Final Wave
20th October 5:30 AM to 2:09 PM (PST)

> … some customers experienced increased connection errors on their NLBs in the N. Virginia (us-east-1) Region. NLB is built on top of a highly scalable, multi-tenant architecture that provides load balancing endpoints and routes traffic to backend targets, which are typically EC2 instances.


<figure>
  <img src="/assets/blog/2025-10-30/NLB-Health-Check-Subsystem.jpeg" alt="NLB Health Check Subsystem" title="NLB Health Check Subsystem" />
  <figcaption>NLB Health Check Subsystem</figcaption>
</figure>

The highly scalable NLB architecture relies on EC2 instances. Due to delays in updating the network state for new EC2 instances, the NLB's health check system sometimes added new instances before their network state was fully updated, leading to health check failures. When a health check failed, the monitoring system removed the unhealthy targets from the NLB's DNS to prevent live traffic from reaching them. Once the network state was correctly applied, the health check passed on the next attempt, and the DNS entry was updated with the instance's IP. This created a thrashing situation, where the health check system was overloaded by repeatedly adding and removing IPs from the NLB DNS without achieving any real progress. That ultimately overwhelmed the health check subsystem, causing it to degrade.

## Conclusion
The AWS global outage on October 19th and 20th highlighted the intricate interdependencies within cloud services and the critical role of the us-east-1 region. The incident, triggered by a DNS glitch affecting DynamoDB, cascaded into widespread service disruptions, affecting EC2 APIs and NLBs. This event underscores the importance of robust system design, emphasizing the need for loosely coupled architectures and effective synchronization mechanisms for distributed system. It also illustrates the necessity of implementing circuit breakers to prevent cascading failures. As cloud services continue to evolve, these lessons are vital for enhancing resilience and ensuring reliable service delivery in the face of unforeseen challenges.

Thank you.