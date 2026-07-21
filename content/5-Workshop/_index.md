---
title: "Workshop"
date: 2024-01-01
weight: 5
chapter: false
pre: " <b> 5. </b> "
---

# Deploying NodeJ2Car Auto Parts eCommerce System on AWS

Welcome to the step-by-step hands-on Workshop guide for deploying the **NodeJ2Car** auto parts e-commerce system onto Amazon Web Services (AWS) cloud infrastructure. 

The system leverages a modern containerized and serverless architecture designed for high availability (Multi-AZ), security, and cost efficiency.

![AWS Architecture Overview](/images/5-Workshop/architecture.png)

---

### Workshop Sections:

1. **[Overview & AWS Architecture](5.1-overview/)**
   * Introduction to NodeJ2Car system features and detail breakdown of AWS architectural tiers.
2. **[VPC & Networking Setup](5.2-vpc-networking/)**
   * Provision VPC networks, configure Public/Private subnets across 2 AZs, Route Tables, and NAT Gateways.
3. **[Provision DocumentDB & Redis](5.3-databases/)**
   * Launch MongoDB-compatible DocumentDB clusters and ElastiCache Redis in isolated subnets.
4. **[S3 Storage & VPC Endpoints](5.4-storage/)**
   * Deploy S3 buckets and bind VPC Gateway Endpoints to route storage traffic inside AWS networks.
5. **[Docker Packaging & ECS Fargate](5.5-ecs-fargate/)**
   * Package Backend applications, register to ECR, and orchestrate serverless containers using ECS Fargate behind an ALB with Sticky Sessions.
6. **[Serverless Payment & SQS Pipeline](5.6-serverless-payment/)**
   * Build serverless asynchronous callback integration using AWS Lambda, SQS message queues, and consumer workers.
7. **[CloudFront Distribution & AWS WAF](5.7-cloudfront-waf/)**
   * Build and deploy React SPA to S3, accelerate globally via CloudFront CDN, and filter attacks using AWS WAF.
8. **[Testing, Cleanup & Summary](5.8-testing-cleanup/)**
   * End-to-end functionality testing, architecture cost/security review, and resource cleanup guide.
9. **[Demo](5.9-demo/)**
   * Demo video/file for the workshop.

