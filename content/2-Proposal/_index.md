---
title: "Proposal"
date: 2024-01-01
weight: 2
chapter: false
pre: " <b> 2. </b> "
---

# PROJECT PROPOSAL: J2CAR AUTOPARTS

---

## 1. Executive Summary

**J2Car AutoParts** is a specialized e-commerce platform for automotive parts, built entirely on **Amazon Web Services (AWS)**. The platform integrates modern features including VIN number decoding, online shopping cart and ordering, real-time customer support chat, and multi-gateway payment integration (VNPay, MoMo, Stripe).

The architecture follows a **3-Tier Architecture (Presentation – Logic – Data)** model, deployed across **2 Availability Zones (Multi-AZ)** in the **`ap-southeast-1` (Singapore)** region to ensure:
- **High Availability:** Continuous 24/7 operation with no disruption even if one AZ fails.
- **Scalability:** Automatic resource scaling based on actual traffic, handling Flash Sale peaks without manual intervention.
- **Security:** Strict compliance with **AWS Well-Architected Framework** standards, applying Zero Trust and Least Privilege principles.
- **Cost Optimization:** Serverless architecture (Fargate, Lambda) ensures payment only for resources actually consumed.

## 2. Problem Statement

### 2.1. Current Challenges
- Traditional automotive parts sales require staff to manually look up parts, causing delays and errors.
- Customers cannot self-identify compatible parts for their vehicles (no VIN decoding tool).
- No real-time communication channel between customers and technical support teams.
- Manual payment processing with risk of invoice data loss during system failures.

### 2.2. Proposed Solution
J2Car AutoParts resolves all of the above through a modern web platform with distributed backend, asynchronous processing, and deep integration with the AWS ecosystem.

### 2.3. Benefits & ROI
- 100% automation of parts lookup, ordering, and payment workflows.
- Minimized operational errors through automated order processing via SQS + Lambda.
- Enhanced customer experience through real-time chat and instant order status notifications.
- Pay-as-you-go architecture optimizes long-term operational costs.

---

## 3. Solution Architecture

The architecture diagram below illustrates the overall J2Car system on the AWS platform:

![J2Car AutoParts System Architecture](images/kientruchethong.png)

### 3.1. Network Design

All infrastructure is deployed within **Amazon VPC** named `J2Car-Production-VPC` with CIDR `10.0.0.0/16`, segmented into distinct network layers spanning 2 Availability Zones:

| Subnet | CIDR | Type | AZ | Services |
|---|---|---|---|---|
| Public Subnet 1 | 10.0.1.0/24 | Public | AZ1 | NAT Gateway 1, ALB |
| Public Subnet 2 | 10.0.2.0/24 | Public | AZ2 | NAT Gateway 2, ALB |
| Private Subnet 1 | 10.0.3.0/24 | Private | AZ1 | ECS Backend Task 1 |
| Private Subnet 2 | 10.0.4.0/24 | Private | AZ2 | ECS Backend Task 2 |
| Private Subnet 3 | 10.0.5.0/24 | Private | AZ1 | DocumentDB Primary, ElastiCache Primary |
| Private Subnet 4 | 10.0.6.0/24 | Private | AZ2 | DocumentDB Replica, ElastiCache Replica |
| Private Subnet 5 | 10.0.7.0/24 | Private | Integration | AWS Lambda, Amazon SQS |

### 3.2. AWS Services Used

| Category | Service | Purpose |
|---|---|---|
| Networking | Amazon VPC, ALB, NAT Gateway | Network infrastructure, traffic routing |
| CDN & Security | Amazon CloudFront, AWS WAF | Content delivery, web firewall |
| Compute | Amazon ECS (Fargate), AWS Lambda | Backend execution, Webhook processing |
| Container Registry | Amazon ECR | Docker Image storage for Backend |
| Storage | Amazon S3 (Web Bucket, Media Bucket) | Frontend hosting, media storage |
| Database | Amazon DocumentDB | Primary NoSQL database (MongoDB compatible) |
| Cache | Amazon ElastiCache (Redis) | Session, caching, Socket.io Pub/Sub |
| Messaging | Amazon SQS | Asynchronous payment queue |
| VPC Endpoint | S3 Gateway Endpoint | Private S3 connection, free data transfer |
| Security | AWS WAF, KMS, Secrets Manager, IAM | Multi-layer security |
| Monitoring | Amazon CloudWatch, Amazon SNS | Monitoring, incident alerting |
| Backup | AWS Backup | Automated DocumentDB snapshots |

---

### 3.3. Main Data Flows

**A. User Traffic Flow**
```
End User (HTTPS)
  → Amazon CloudFront (CDN Cache)
      ├─► S3 Web Bucket         [React SPA Interface]
      ├─► S3 Media Bucket       [Product & Parts Images]
      └─► AWS WAF
            → Application Load Balancer (ALB)
                ├─► ECS Backend Task 1 (AZ1) [Node.js + Express]
                └─► ECS Backend Task 2 (AZ2) [Node.js + Express]
                        ├─► ElastiCache Redis  [Session / Cache / Socket]
                        └─► Amazon DocumentDB  [Primary Database]
```

**B. Image Upload Flow (FinOps Optimized)**
```
Admin uploads image
  → ECS Backend         [Generates Pre-signed URL]
  → Returns URL to Browser  [No NAT Gateway involved]
  → Browser uploads file directly to S3 Media Bucket via S3 VPC Gateway Endpoint
```

**C. Asynchronous Payment Flow**
```
[1] Customer places order
  → ECS Backend calls Payment Gateway API (via NAT Gateway)
  ← Receives payment URL → Returns to Customer

[2] Customer completes payment
  → Payment Gateway sends IPN Webhook back to system
  → AWS WAF → ALB → AWS Lambda (Webhook Handler)
  → Lambda validates invoice checksum
  → Pushes "Clean Invoice" to Amazon SQS (Payment Queue)

[3] ECS Backend Worker pulls from SQS Queue
  → Updates order status in DocumentDB
  → Broadcasts Real-time notification via Socket.io (Redis Pub/Sub)
  → Customer receives "Payment Successful" popup instantly on browser
```

---

### 3.4. Layer-by-Layer Architecture Details

#### 3.4.1. Edge & Content Delivery Layer

- **Amazon S3 — Web Bucket:** Hosts the React SPA static source code. All web interface requests are served from S3 via CloudFront, consuming zero Backend resources.
- **Amazon S3 — Media Bucket:** Stores parts and product images. Connected via **S3 Gateway VPC Endpoint** for free and secure internal uploads from the Backend.
- **Amazon CloudFront:** Global CDN distributing static content from S3 with minimal latency for Southeast Asian users. Acts as the **Single Entry Point** for the entire system.
- **AWS WAF (Web Application Firewall):** Attached to CloudFront and ALB, providing active protection against OWASP Top 10, Layer 7 DDoS, and Bot Traffic.

#### 3.4.2. Network & Compute Layer

- **Application Load Balancer (ALB):** Located in Public Subnets spanning AZ1 and AZ2. Performs API load balancing and WebSocket routing. Configured with **Sticky Sessions (Cookie-based)** to maintain Socket.io WebSocket connections.
- **Amazon ECS Fargate (Backend Task 1 & 2):** Runs J2Car Backend source code in **Node.js + Express**. Fargate is a Serverless Container platform — AWS manages all underlying infrastructure. **Auto Scaling Group** automatically spawns additional Tasks when load increases.
- **Amazon ECR (Elastic Container Registry):** Private and secure Docker Image registry for J2Car Backend.
- **NAT Gateway 1 & 2:** Placed in Public Subnets for each AZ. Allows ECS Backend to reach the Internet (VIN Decoder APIs, payment gateway link generation) while blocking all inbound connections from the Internet.

#### 3.4.3. Integration Tier (Serverless)

*Isolated in Private Subnet 5, completely separate from the main Compute layer.*

- **AWS Lambda — Webhook Handler:** Serverless function triggered only by IPN Callbacks from payment gateways. Validates HMAC/Checksum signatures, filters fraudulent callbacks, and pushes clean invoice data to SQS — without consuming any ECS Backend resources.
- **Amazon SQS — Payment Queue:** Buffer between Lambda and Backend Worker. **Guarantees zero invoice data loss** — even if all ECS Backend fails, SQS retains all payment messages until Backend restarts and processes them sequentially.

#### 3.4.4. Data Tier

*The deepest and most secured layer — only accepts connections from ECS Backend Security Group.*

- **Amazon ElastiCache (Redis) — Primary Node (AZ1) & Replica Node (AZ2):**
  - **Session Store:** User login sessions.
  - **Cache-Aside:** Parts catalog, product listings, VIN lookup results.
  - **Shopping Cart:** Temporary pre-checkout cart storage.
  - **Redis Pub/Sub Adapter:** Key component for Real-time Chat — bridges messages between Backend Tasks across different AZs.
- **Amazon DocumentDB (Primary Cluster — AZ1 & Replica — AZ2):** Primary NoSQL database, fully MongoDB-compatible. Primary handles all WRITE operations; Replica offloads all READ queries. **Automatic Failover** to AZ2 Replica within seconds if AZ1 experiences failure.
- **AWS Backup:** Daily automated snapshots of DocumentDB with Point-in-Time Recovery up to 35 days.

#### 3.4.5. Security & Management Layer

*Implements Defense-in-Depth — multiple independent, mutually reinforcing security layers.*

- **Security Groups Chaining:** `SG-CloudFront` → ALB only; `SG-ALB` → ECS only; `SG-ECS` → Database only. No Internet port is directly exposed to the Data layer.
- **AWS Secrets Manager:** All sensitive credentials (DB Connection String, JWT Secret, Payment API Keys) are encrypted and centralized. ECS Tasks fetch credentials at runtime via API — never hardcoded in source or `.env` files.
- **AWS KMS:** Encryption keys for Encryption at Rest on S3, DocumentDB, ElastiCache, and SQS.
- **AWS IAM:** Each ECS Task has a dedicated IAM Role with minimum necessary permissions (Least Privilege) — no Access Keys stored in containers.
- **AWS Systems Manager (SSM) / ECS Exec:** Allows DevOps team to access container shell via browser without opening SSH Port 22.

#### 3.4.6. FinOps — Cost Optimization

- **S3 Gateway VPC Endpoint:** ECS-to-S3 connections route through AWS internal network instead of NAT Gateway. NAT Gateway costs $0.045/GB — significant savings with large volumes of product image uploads.
- **Pre-signed URL for Uploads:** Backend only generates a temporary URL (15 min). The browser uploads directly to S3 Media Bucket — Backend consumes zero bandwidth or CPU during the upload process.
- **ECS Fargate Auto Scaling:** Tasks scale automatically based on CPU Utilization. Off-peak hours (2AM–6AM) run only 2 Tasks; Flash Sale peaks can auto-scale to 10–20 Tasks.

#### 3.4.7. Monitoring & Alerting Layer

- **Amazon CloudWatch Metrics:** ECS CPU/Memory, ALB Request Count/Latency/5xx Rate, DocumentDB Read/Write Latency, ElastiCache Cache Hit Rate, SQS Queue Depth.
- **CloudWatch Alarms + Amazon SNS:** Instantly sends Email/SMS to the operations team when any metric exceeds its alert threshold.

---

## 4. Implementation Roadmap

| Phase | Deliverables | Timeline |
|---|---|---|
| **Phase 1** | Architecture design, VPC, Subnets, Security Groups, IAM Roles | Week 1–2 |
| **Phase 2** | Data Tier: DocumentDB Multi-AZ, ElastiCache Redis, Backup configuration | Week 3–4 |
| **Phase 3** | Compute Tier: ECR, ECS Fargate, ALB, NAT Gateways, Auto Scaling | Week 5–6 |
| **Phase 4** | Frontend: S3 Buckets, CloudFront, WAF, S3 VPC Endpoint | Week 7 |
| **Phase 5** | Payment Integration: Lambda Webhook Handler, SQS, VNPay/MoMo/Stripe | Week 8 |
| **Phase 6** | Security: KMS, Secrets Manager, CloudWatch Alarms, SNS | Week 9 |
| **Phase 7** | Load testing, UAT, Auto Scaling tuning, production go-live | Week 10–12 |

---

## 5. Budget Estimation

*Estimated Production environment monthly costs (Region: ap-southeast-1)*

| Service | Configuration | Est. Monthly Cost |
|---|---|---|
| ECS Fargate | 2 Tasks × 0.5 vCPU × 1GB RAM (baseline) | ~$15 |
| ALB | 1 ALB, ~50GB data processed | ~$20 |
| NAT Gateway | 2 NAT GW (Multi-AZ), ~10GB traffic | ~$35 |
| DocumentDB | db.t3.medium × 1 Primary + 1 Replica | ~$120 |
| ElastiCache Redis | cache.t3.micro × 1 Primary + 1 Replica | ~$50 |
| S3 (Web + Media) | ~50GB Storage + CloudFront requests | ~$10 |
| CloudFront | ~100GB data transfer | ~$9 |
| Lambda + SQS | ~500K invocations/month | ~$1 |
| CloudWatch, SNS, ECR | Monitoring & Registry | ~$5 |
| AWS WAF | ~1M requests/month | ~$10 |
| **Total Estimate** | | **~$275/month** |

> **Note:** This is baseline cost for moderate traffic. Actual costs may be significantly lower in early stages due to Auto Scaling architecture. See [AWS Pricing Calculator](https://calculator.aws/) for detailed estimates.

---

## 6. Risk Assessment & Contingency Planning

### 6.1. Risk Matrix

| Risk | Impact | Probability | Priority |
|---|---|---|---|
| Single Availability Zone failure | High | Low | 🟡 Medium |
| Traffic spike (Flash Sale) | Medium | High | 🟡 Medium |
| External payment gateway disruption | High | Low | 🟡 Medium |
| Credentials / Secret Key leak | Very High | Very Low | 🔴 High |
| DDoS / SQL Injection attack | High | Medium | 🔴 High |
| DocumentDB data loss | Very High | Very Low | 🔴 High |

### 6.2. Mitigation Strategies & Contingency Plans

- **AZ Failure:** Multi-AZ design ensures ALB/ECS/DocumentDB/Redis automatically failover to the remaining AZ within seconds — users experience virtually no disruption.
- **Traffic Spikes:** ECS Auto Scaling + CloudFront Cache handles static load entirely. Even before Backend scales up, the web interface remains fully functional via CloudFront CDN.
- **Payment Gateway Disruption:** SQS retains all Webhook messages. No invoice data is lost. When the payment gateway recovers, pending transactions are processed sequentially and automatically.
- **Credential Leak:** AWS Secrets Manager automatically rotates credentials periodically. No secrets exist in source code or CI/CD logs — impossible to leak through code review.
- **Security Attacks:** AWS WAF blocks threats at the edge layer immediately. Security Groups Chaining ensures no Internet-facing entry point to the Data layer. CloudWatch + SNS alerts in real-time upon detecting abnormal traffic.
- **Data Loss:** AWS Backup captures daily snapshots with Point-in-Time Recovery up to 35 days. DocumentDB Sync Replication ensures Primary and Replica are always synchronized.

---

## 7. Expected Outcomes

- **Technical:** System achieves 99.9%+ SLA uptime, handles thousands of concurrent users with API latency < 200ms.
- **Business:** 100% automation of the complete order lifecycle from placement through payment confirmation.
- **User Experience:** Real-time support chat, instant order status notifications, automatic VIN-based parts lookup.
- **Financial:** Pay-as-you-go architecture optimizes costs with zero charges for idle resources.