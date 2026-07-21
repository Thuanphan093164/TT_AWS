---
title: "5.1. Overview & AWS Architecture"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 5.1. </b> "
---

# Overview & AWS Architecture Analysis - J2Car AutoParts

### 1. Introduction to J2Car AutoParts
**J2Car AutoParts** is a professional e-commerce platform specializing in premium auto parts. The project leverages an **N-tier architecture** combining containerized services (**Amazon ECS Fargate**) and serverless pipelines (**SQS + Lambda**) to optimize performance, security, and autoscaling capabilities.

The system integrates modern business features:
* **Rich Shop/Catalog:** Search and advanced filters by manufacturer, price range, and nested categories.
* **Interactive Schematics:** Customers interact directly with car part diagrams to click and search for replacements.
* **AI Image Scanner:** Upload a photo of a broken part, and the system automatically suggests matching items from the inventory.
* **Real-time Chat Support:** Connects customers with consulting admins instantly using WebSockets (Socket.io).
* **Payment Integration:** Generates checkouts and handles asynchronous payment responses via VNPay, MoMo, and Stripe.

---

### 2. System Architecture Diagram
The infrastructure is built on Amazon Web Services (AWS) adhering to the AWS Well-Architected Framework:

![AWS Architecture Overview](/images/5-Workshop/architecture.png)

---

### 3. Detailed Breakdown of the 6 Architectural Layers

#### 3.1. Network & Routing Layer
* **Amazon VPC (Virtual Private Cloud):** Segmented private virtual network IP range `10.0.0.0/16`. VPC is divided into **Public Subnets** (hosting Application Load Balancers, NAT Gateways) and **Private Subnets** (hosting ECS Backend, Databases, Redis, Lambda) to fully isolate database and application tiers from direct internet access.
* **Application Load Balancer (ALB):** Receives HTTP/HTTPS traffic from public internet at Public Subnets and balances requests to Backend containers running inside Private Subnets based on **Path Rules** (e.g., routing `/api/*` to the Backend Target Group).
* **NAT Gateway & Elastic IP (EIP):** Allows resources in Private Subnets (such as ECS Backend, Lambda) to establish secure outbound connections (e.g., calling payment gateway APIs VNPay/MoMo, SMTP email relays) while blocking unsolicited inbound connections from the internet.

#### 3.2. Compute Layer
* **Amazon ECS (Elastic Container Service) with AWS Fargate:** Runs containerized NodeJS Backend Docker images using serverless compute. Fargate scales backend capacity dynamically without managing virtual servers (EC2). ECS handles **self-healing** (re-creating failed containers) and orchestrates zero-downtime **rolling updates** with ALB.

#### 3.3. Data & Cache Layer
* **Amazon DocumentDB (MongoDB Compatible):** Main NoSQL database cluster for catalog, user, cart, and order stores. Replacing external MongoDB Atlas, DocumentDB is deployed in Data Private Subnets using a **Multi-AZ** configuration (1 Primary + 2 Replicas) for automated failover, secure SSL connection (using `global-bundle.pem`), and SCRAM-SHA-1 authentication.
* **Amazon ElastiCache Redis:** In-memory high-speed cache and messaging broker. Integrated with `socket.io-redis` to synchronize real-time socket connections across ECS containers, enabling instant payment notifications (Realtime Push Notification) on the client browser immediately after the bank webhook callback is processed.

#### 3.4. Integration & Serverless Layer
* **Amazon SQS (Simple Queue Service):** Standard messaging queue serving as a buffer to catch payment webhook/IPN payloads from VNPay/MoMo. Upon receiving callback events, the Backend quickly publishes them to SQS and responds success to the gateway, eliminating data loss and bottleneck issues during traffic spikes.
* **AWS Lambda:** Serverless function (FaaS) pulling transaction records from SQS to update order states and log invoices into DocumentDB. Deployed in Private Subnets, Lambda runs in a serverless pay-as-you-go manner, optimizing operational costs.

#### 3.5. Storage Layer
* **Amazon S3 (Simple Storage Service):** Secure object storage for static web assets and media files.
  * **S3 Web Hosting:** Hosts ReactJS frontend code, serving client single-page applications directly.
  * **S3 Media Bucket:** Stores spare parts images uploaded from the Admin dashboard. The Backend generates secure temporary access links (**Presigned URLs**) via AWS SDK for safe client-side image rendering.

#### 3.6. Security & Governance Layer
* **AWS Secrets Manager:** Centrally manages, encrypts, and rotates sensitive connection strings (such as `MONGO_URI` containing DocumentDB credentials, `JWT_SECRET`). ECS Task Definitions automatically reference these secrets at runtime, preventing hard-coded keys in the source repository.
* **AWS WAFv2 (Web Application Firewall):** Shields ALB/CloudFront endpoints from malicious traffic. It applies AWS-managed rulesets (`AWSManagedRulesCommonRuleSet` and `AWSManagedRulesSQLiRuleSet`) to block SQL Injection, Cross-Site Scripting (XSS), and automated crawlers/scanners.
* **Amazon CloudWatch Logs:** Collects and indexes execution logs from ECS task containers and Lambda functions for performance troubleshooting, real-time alerting, and audit trials.

---

### 4. Key Architectural Pillars for the Workshop Report
* **Cost Optimization:** Relying on AWS Fargate and Lambda pay-as-you-go services reduces idle capacity overhead by running compute only when requests are actively handled.
* **High Availability (HA):** Multi-AZ implementations on ALB, ECS, DocumentDB, and Redis guarantee operational continuity in case of physical datacenter failures.
* **Security:** Adheres to "Security at all layers" principles by isolating storage/data tiers in Private Subnets, managing secrets via Secrets Manager, and using WAFv2 firewalls.
