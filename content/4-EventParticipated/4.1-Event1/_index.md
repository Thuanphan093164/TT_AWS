---
title: "Mini Meetup – First Cloud AI Journey"
date: 2026-06-13
weight: 1
chapter: false
pre: " <b> 4.1. </b> "
---

# Harvest Report: Mini Meetup – First Cloud AI Journey

### Event Information
* **Event Name:** Mini Meetup – First Cloud AI Journey
* **Date & Time:** June 13, 2026 (09:00 - 12:00)
* **Location:** AWS Office – Grand Terra, 36 Cat Linh, Hanoi, Vietnam
* **Role:** Attendee

---

### Event Objectives
The **Mini Meetup – First Cloud AI Journey** was an in-depth technical knowledge-sharing event organized by the First Cloud AI Journey (FCAJ) community. The meetup created an interactive environment for cloud engineers, infrastructure specialists, and students passionate about **Cloud Computing** and **Artificial Intelligence (AI)**.

The core objectives of the event included:
* **Delivering Practical Technical Insights:** Sharing real-world solutions for secure cloud infrastructure management, server connection methodologies, and modern data architectures.
* **Exploring Emerging Industry Trends:** Helping attendees understand the digital transformation process by combining Amazon Web Services (AWS) cloud services with modern analytics platforms like Snowflake.
* **Fostering Community Spirit:** Promoting the core philosophy of **Learn • Build • Share • Grow**, encouraging direct Q&A with industry experts, and guiding career growth in Cloud, DevOps, and Data Engineering.

---

### Key Presentation Highlights

#### 1. How to Connect to a Virtual Machine
* **Speaker:** Mr. Hải Hiếu
* **Detailed Breakdown:**

##### A. Fundamentals of Virtual Machines (VMs) & Connectivity Overview
- Overview of Virtual Machines (Amazon EC2) in cloud environments as compute hosts for web servers, backend APIs, databases, and worker processes.
- Analysis of primary connectivity protocols for Linux and Windows instances:
  - **SSH (Secure Shell - Port 22):** The industry standard for Linux server management.
  - **RDP (Remote Desktop Protocol - Port 3389):** Used for GUI-based Windows server management.
  - **AWS EC2 Instance Connect:** Browser-based SSH connectivity via the AWS Management Console.
  - **AWS Systems Manager (SSM) Session Manager:** Modern secure connectivity eliminating the need for public Port 22 exposure and SSH key management.

##### B. Deep Dive into SSH Key Pair Authentication
- **Asymmetric Cryptography:** Utilizing key pairs consisting of a **Private Key** (kept securely on the client machine) and a **Public Key** (stored on the Linux server under `~/.ssh/authorized_keys`).
- **Authentication Handshake:** The server encrypts a challenge using the Public Key; the client decrypts it using its Private Key to prove identity without ever transmitting the Private Key across the network.

##### C. Security Hardening Best Practices
- **Disable Password Authentication:** Setting `PasswordAuthentication no` in `sshd_config` to eliminate brute-force attack vectors.
- **Restrict Direct Root Access:** Setting `PermitRootLogin no`, requiring engineers to log in with unprivileged accounts and escalate via `sudo`.
- **Enforce Least Privilege in Security Groups:** Restricting SSH (Port 22) access to trusted static IP ranges (e.g., Office/VPN IPs) and strictly prohibiting open CIDRs (`0.0.0.0/0`).
- **Adopt Bastion Hosts & AWS SSM Session Manager:** Deploying Bastion Hosts in Public Subnets or adopting AWS SSM Session Manager to isolate EC2 instances completely inside Private Subnets, removing public Internet attack surfaces.

---

#### 2. Migrate to Modern Data Stack Using Snowflake and AWS
* **Speaker:** Mr. Vũ Thế Huy
* **Detailed Breakdown:**

##### A. The Modern Data Stack (MDS) & Paradigm Shift
- **Legacy ETL (Extract - Transform - Load):** Data is extracted and transformed on intermediate servers before loading into traditional Data Warehouses. Drawbacks: Complex maintenance, scalability bottlenecks as data grows.
- **Modern ELT (Extract - Load - Transform):** Raw data is loaded directly into a Cloud Data Warehouse leveraging massive cloud compute power, followed by transformation using SQL.
- **Modern Data Stack Ecosystem:** A flexible cloud data stack combining modular cloud tools (Amazon S3 Data Lake + Snowflake Data Warehouse + dbt Transformation + BI Tools).

##### B. Snowflake's Decoupled Compute & Storage Architecture on AWS
- **3-Tier Architecture (Multi-cluster Shared Data):**
  1. **Database Storage:** Compressed, columnar data storage residing directly on **Amazon S3**.
  2. **Query Processing (Compute Layer):** Independent compute clusters called **Virtual Warehouses** that can auto-scale or spin down automatically without impacting other workloads.
  3. **Cloud Services:** Management layer handling indexing, access control, query optimization, and metadata.
- **Cost Efficiency:** Complete decoupling of storage and compute costs ensures organizations only pay for active processing time (Pay-per-second compute).

##### C. AWS & Snowflake Integration Pipeline
- **Amazon S3 External Stage Setup:** Creating an S3 bucket as a landing zone for raw incoming datasets.
- **Secure Authentication via AWS IAM Roles:** Utilizing Snowflake **Storage Integration** to grant access to S3 via IAM Roles and External IDs, avoiding hardcoded AWS access credentials.
- **Ingestion & Analytics Flow:**
  - Bulk loading via `COPY INTO` or automated near real-time ingestion via **Snowpipe** triggered by `S3 Event Notifications` (SQS).
  - Serving clean data to Business Intelligence tools (Tableau, PowerBI, Amazon QuickSight) and feeding downstream AI/ML pipelines.

---

### Key Takeaways & Lessons Learned

#### 1. Cloud Infrastructure Management & Hardening
* **Defense-in-Depth Mindset:** Cloud security requires multi-layered defense: IAM Policies $\rightarrow$ Security Groups $\rightarrow$ Network ACLs $\rightarrow$ SSH Key / SSM Authentication.
* **Eliminating Port 22 Dependency:** Leveraging **AWS SSM Session Manager** simplifies EC2 administration, removes key loss risks, and records full command audit trails in AWS CloudTrail.

#### 2. Modern Data Platform Architecture
* **Embracing Cloud-Native Data Stacks:** Understanding the strategic shift from legacy relational databases to elastic Cloud Data Warehouses.
* **Cost Optimization via Serverless Architecture:** Combining low-cost Amazon S3 storage with Snowflake's elastic compute capabilities delivers scalable Big Data analytics at optimized costs.

---

### Practical Application to NodeJ2Car Project

Applying the takeaways from the meetup, I formulated concrete technical enhancements for the cloud infrastructure and data pipeline of the **NodeJ2Car** project (An auto-parts e-commerce platform):

```
                                  +---------------------------------------------------+
                                  |            NodeJ2Car Cloud Architecture           |
                                  +---------------------------------------------------+
                                                            |
                 +------------------------------------------+------------------------------------------+
                 |                                                                                     |
                 v                                                                                     v
  [1. EC2/ECS Infrastructure & Security]                                                [2. Modern Data Stack Pipeline]
  - Place EC2/ECS Fargate tasks in Private Subnets.                                    - Stream transaction & AI Scan logs to Amazon S3.
  - Utilize AWS SSM Session Manager (No Port 22 open).                                 - Configure S3 External Stage for Snowflake via IAM.
  - Restrict Security Group inbound rules to ALB only.                                 - Execute ELT pipelines for sales & inventory analytics.
```

1. **Secure Node.js Backend Administration:**
   - **SSM Session Manager & SSH Hardening:** Deploy Node.js backend containers on ECS Fargate / EC2 strictly within **Private Subnets**. Access container shells via **AWS Systems Manager (SSM)** for debugging without exposing Port 22 to the public Internet.
   - **Security Group Isolation:** Restrict inbound rules so that backend instances only accept traffic originating directly from the **Application Load Balancer (ALB)**.

2. **NodeJ2Car Business Intelligence Data Pipeline:**
   - **Amazon S3 Data Lake Ingestion:** Configure the Node.js backend to stream transaction logs, 2D schematic search events, and AI Scan recognition logs directly to **Amazon S3**.
   - **Snowflake Analytics Integration:**
     - Establish an S3 External Stage securely authenticated via AWS IAM Roles.
     - Build Data Warehouse tables to analyze user purchasing behaviors, track high-demand auto part models, and forecast inventory replenishment needs.

---

### Personal Reflections

Attending the **First Cloud AI Journey Mini Meetup** was an immensely valuable experience. Beyond theoretical slides, the presentations by Mr. Hải Hiếu and Mr. Vũ Thế Huy provided actionable, real-world solutions to common cloud infrastructure and data engineering challenges.

The open networking session at the AWS Hanoi office allowed me to engage directly with industry speakers and gain guidance on career development in Cloud and DevOps. The technical insights gained from this meetup have significantly boosted my confidence in refining the architecture and security posture of the NodeJ2Car project.
