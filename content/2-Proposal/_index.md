---
title: "Proposal"
date: 2024-01-01
weight: 2
chapter: false
pre: " <b> 2. </b> "
---

# NodeJ2Car Auto Parts E-Commerce Platform  
## Optimized AWS Cloud Solution for Performance, Security, and Scalable Growth  

### 1. Executive Summary  
The **NodeJ2Car** project builds a specialized e-commerce platform offering premium auto parts. The platform stands out with three breakthrough features: an interactive 2D schematic diagram explorer, real-time WebSocket chat support, and an AI-powered image scanner to detect damaged parts. To handle high traffic volumes, ensure strict security of user financial data, and process asynchronous payments reliably (Momo, VNPay, Stripe), the entire system is deployed on AWS using a hybrid container-serverless model. This solution enables high availability, automatic scaling, and minimal operational overhead for NodeJ2Car.

### 2. Problem Statement  
*Current State Challenges:*  
1. **Complex Auto Parts Searching:** With millions of unique auto part SKU numbers, average customers face significant friction and confusion trying to identify compatible parts using traditional keyword search.
2. **Real-time Server Overhead:** WebSocket connections via Socket.io combined with high-frequency payment Webhook (IPN) callbacks can easily saturate the primary backend servers, leading to database deadlocks, performance degradation, or lost transactions.
3. **Security Vulnerabilities:** E-commerce sites containing user financial and personal profiles are constant targets for DDoS, SQL injection, and automated bot vulnerability scans.

*The Solution:*  
The platform resolves these challenges by combining modern application features with AWS cloud services:
*   **Interactive 2D Schematics & AI Image Scanner:** Simplifies parts discovery, removing the need for customers to memorize complex SKU numbers.
*   **Asynchronous Webhook Processing:** Isolates payment Webhooks utilizing serverless **AWS Lambda** and **Amazon SQS** queues, keeping billing events queued and processed safely even during server downtime.
*   **Socket.io State Sharing:** Uses **Amazon ElastiCache Redis** (via Redis Adapter) to sync chat events across all running backend container instances.
*   **Edge Security and Shielding:** Houses all compute layers in Private Subnets behind an **Application Load Balancer (ALB)**, protected externally by **AWS WAF** and **Amazon CloudFront CDN**.

*ROI and Benefits:*  
*   **Conversion Rate Increase:** Saves 70% of customer searching time via schematics and AI image scanner tools, translating to higher sales volumes.
*   **99.99% Service Uptime:** Multi-AZ container configurations on ECS Fargate secure continuous availability.
*   **Optimized Operational Costs:** Serverless compute tiers and Auto Scaling rules ensure infrastructure costs follow actual usage closely (pay-as-you-go). Break-even ROI is expected within the first 6 months.

---

### 3. Solution Architecture  
The architecture centers on an **Amazon VPC** network layout, segregating Public and Private subnets across 2 independent Availability Zones. CloudFront CDN and AWS WAF inspect and cache requests at the edge before sending them into the internal subnets.

![AWS Architecture Overview](/images/5-Workshop/architecture.png)

*AWS Services Used:*  
*   **Amazon VPC:** Establishes secure network layers (Public/Private Subnets, NAT Gateways).
*   **Amazon ECS & AWS Fargate:** Orchestrates containerized NodeJS backend tasks with automated scaling.
*   **Application Load Balancer (ALB):** Balances backend requests and maintains Sticky Sessions for WebSockets.
*   **Amazon DocumentDB:** Serves as the primary MongoDB-compatible document database (Primary and Read replicas).
*   **Amazon ElastiCache Redis:** Memory store for Socket.io state sharing and cart caching.
*   **AWS Lambda & Amazon SQS:** Handles payment Webhooks and transactional message queues.
*   **Amazon S3 & S3 Gateway Endpoint:** Stores React SPA client builds and media assets, routing internally at no cost.
*   **Amazon CloudFront & AWS WAF:** Caches static files globally and filters web application attacks.
*   **Amazon ECR:** Manages production Docker images.

*Component Design:*  
*   **Frontend:** React SPA stored in S3 and accelerated via CloudFront CDN.
*   **Backend:** Express API tasks hosted on ECS Fargate in Private Subnets, routed by ALB.
*   **Integration Tier:** Payment IPN webhooks trigger Lambda functions, publishing to SQS. The backend worker polls the queue to fulfill orders.
*   **Database Tier:** DocumentDB splits reads (Replica AZ2) and writes (Primary AZ1).

---

### 4. Technical Implementation  
*Implementation Phases:*  
1. **Phase 1: Networking & Schema Architecture Design (Weeks 1 - 2):** Create VPC, set subnet IPs, configure Route Tables and Security Groups. Define DocumentDB schema rules.
2. **Phase 2: Core API & Real-time Messaging Development (Weeks 3 - 5):** Build authentication APIs, parts CRUD routes, schematic pages, and integrate Redis Adapter with Socket.io.
3. **Phase 3: Serverless Payment & Containerization (Weeks 6 - 8):** Build Lambda handler code, SQS queues, and backend consumer worker modules. Write Dockerfiles to package the API.
4. **Phase 4: Cloud Deployment & Load Testing (Weeks 9 - 11):** Launch ECS Fargate tasks, ALB, S3, CloudFront, and WAF rules. Run load tests simulating 1,000+ users, optimize query index keys, and finalize handovers.

*Technical Requirements:*  
*   **Runtime:** Docker Engine for image building, AWS CLI/CDK for infrastructure provisioning.
*   **Frontend:** ReactJS + Vite + Tailwind CSS, and `socket.io-client`.
*   **Backend:** NodeJS + ExpressJS, Mongoose for DocumentDB connection, `vnpay` and `axios` libraries.

---

### 5. Timeline & Milestones  
* **Milestone 1 (Weeks 1 - 2):** Complete VPC infrastructure and DocumentDB cluster deployment. Set up functional Auth APIs.
* **Milestone 2 (Weeks 3 - 5):** Complete home layout, interactive schematics, and client-admin socket chat rooms.
* **Milestone 3 (Weeks 6 - 8):** Integrate AI Scan image search. Finalize webhook processing via Lambda and SQS.
* **Milestone 4 (Weeks 9 - 10):** Deploy container services to ECS Fargate and distribute frontend via CloudFront CDN protected by AWS WAF.
* **Milestone 5 (Week 11):** Complete load testing, tune indexing paths, and hand over the platform.

---

### 6. Budget Estimation  
Estimated monthly AWS costs (Production Environment - Mid Scale):

| AWS Service | Configuration | Monthly Cost |
| :--- | :--- | :--- |
| **Amazon ECS & Fargate** | 2 Tasks (0.5 vCPU, 1 GB RAM) running 24/7 | ~ $15.00 |
| **Application Load Balancer** | 1 ALB, 1 LCU | ~ $22.00 |
| **Amazon DocumentDB** | db.t3.medium cluster (1 Primary + 1 Replica) | ~ $110.00 |
| **Amazon ElastiCache Redis** | cache.t3.micro cluster (1 Primary + 1 Replica) | ~ $30.00 |
| **Amazon S3** | Web & Media storage (~ 50 GB + requests) | ~ $3.00 |
| **Amazon CloudFront** | Data Transfer Out ~ 150 GB | ~ $12.00 |
| **AWS WAF** | 1 Web ACL + 3 Basic Managed Rules | ~ $10.00 |
| **NAT Gateways** | 2 NAT Gateways + data processing fees | ~ $65.00 |
| **AWS Lambda & SQS** | 50,000 requests (under Free Tier limits) | ~ $0.00 |
| **Total Cost** | **Active Production Infrastructure** | **~ $267.00 / Month** |

---

### 7. Risk Assessment  
*Risk Matrix & Mitigation:*  
1. **DocumentDB Database Bottlenecks:**
   * *Risk:* Heavy catalog lookups during marketing campaigns hit 100% CPU on DocumentDB.
   * *Mitigation:* Split read queries to Read Replica instances and store hot catalog objects in Redis cache.
2. **WebSocket Chat Disconnections:**
   * *Risk:* Client network handovers or ECS autoscaling breaks active WS channels.
   * *Mitigation:* Configure ALB Sticky Sessions to bind clients to tasks, using Redis pub/sub replication.
3. **Uncontrolled Cloud Costs:**
   * *Risk:* Egress traffic spikes or misconfigured CPU sizing balloons billing.
   * *Mitigation:* Apply AWS Budget alarms alerts at $300/month limit, and write S3 lifecycle policies to auto-archive old images.

---

### 8. Expected Outcomes  
* **Technical Performance:** Page load speeds under 2 seconds worldwide via CDN caching. Automatic backend failovers scaling from 2 to 10 tasks on request surges.
* **Business Value:** Zero transaction drop rates secured by SQS queues. High customer satisfaction and product discovery rates through interactive schematics and AI image scanner.
