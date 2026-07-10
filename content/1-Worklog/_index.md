---
title: "Worklog"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 1. </b> "
---

## Overview

This worklog documents the complete learning, research, and hands-on practice journey across **12 weeks of internship** in the **First Cloud Journey (FCJ) — AWS Internship** program.

Throughout the internship, the primary focus was on designing and deploying **J2Car AutoParts** — a specialized automotive parts e-commerce system built on a **3-Tier Architecture on AWS**, deployed across multiple Availability Zones (Multi-AZ) in the `ap-southeast-1 (Singapore)` region.

In parallel with the main project, each week included dedicated lab sessions to master AWS services ranging from foundational to advanced, all directly applied to real-world architecture scenarios.

---

## 12-Week Internship Summary

| Week | Main Topic | Technologies / Services |
|---|---|---|
| Week 1 | Introduction to AWS, Cloud architecture, and core service groups | EC2, S3, IAM, VPC, AWS CLI |
| Week 2 | Advanced security and identity management | IAM Advanced, AWS Config, GuardDuty |
| Week 3 | Advanced VPC networking and content delivery | VPC, ALB, CloudFront, Route 53 |
| Week 4 | Cloud storage and databases | S3 Advanced, RDS, DynamoDB, Aurora |
| Week 5 | Serverless computing | Lambda, API Gateway, SQS, SNS, EventBridge |
| Week 6 | System monitoring, technical support, and hybrid DNS | CloudWatch, AWS Support, Route 53 Resolver, Hybrid DNS |
| Week 7 | CLI automation, multi-account management, and data backup | AWS CLI, Organizations, IAM Identity Center, AWS Backup |
| Week 8 | Server migration and application containerization | VM Import/Export, Docker, Docker Compose, RDS, ECR |
| Week 9 | ECS Fargate deployment, CI/CD, and security evaluation | ECS Fargate, GitLab CI/CD, CodeBuild, Container Insights, Security Hub |
| Week 10 | Advanced networking and serverless operational automation | VPC Peering, Network ACL, Transit Gateway, Lambda, EventBridge |
| Week 11 | Cost management, Well-Architected review, and IaC | Cost Explorer, AWS Budgets, S3 VPC Endpoint, CloudFormation |
| Week 12 | Load testing, HTTPS, finalization, and project wrap-up | JMeter, Route 53, ACM, CloudFormation Master Stack |

---

## Week-by-Week Details

**Week 1:** [Introduction to AWS — EC2, S3, IAM, and VPC fundamentals](1.1-week1/)

**Week 2:** [Advanced security: IAM Policy, AWS Config, and GuardDuty](1.2-week2/)

**Week 3:** [Advanced VPC networking, ALB, CloudFront, and Route 53](1.3-week3/)

**Week 4:** [Databases and storage: S3, RDS, DynamoDB, Aurora](1.4-week4/)

**Week 5:** [Serverless: Lambda, API Gateway, SQS, SNS, and EventBridge](1.5-week5/)

**Week 6:** [CloudWatch monitoring, AWS Support, and Hybrid DNS with Route 53 Resolver](1.6-week6/)

**Week 7:** [AWS CLI, Organizations, IAM Identity Center, and AWS Backup](1.7-week7/)

**Week 8:** [VM Import/Export, Docker, Docker Compose, Amazon RDS, and ECR](1.8-week8/)

**Week 9:** [Amazon ECS Fargate, automated CI/CD, Container Insights, Firelens, and Security Hub](1.9-week9/)

**Week 10:** [VPC Peering, Network ACL, Transit Gateway, and Lambda Auto Start/Stop EC2](1.10-week10/)

**Week 11:** [Cost Management, Well-Architected Review, S3 VPC Endpoint, and CloudFormation IaC](1.11-week11/)

**Week 12:** [Load Testing, Route 53 + HTTPS/ACM, E2E testing, and J2Car project wrap-up](1.12-week12/)

---

## Overall Results

After 12 weeks of internship, the **J2Car AutoParts** system has been fully deployed on AWS with the following key achievements:

- ✅ Standard Multi-AZ 3-Tier architecture — ready for real-world production operation
- ✅ Reliable payment processing with Lambda + SQS — zero invoice data loss
- ✅ Real-time interaction via Socket.io + Redis Pub/Sub
- ✅ Fully automated CI/CD deployment pipeline
- ✅ All infrastructure managed by CloudFormation (Infrastructure as Code)
- ✅ Verified performance: P95 < 210ms at 500 concurrent users
