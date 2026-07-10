---
title: "Workshop"
date: 2024-01-01
weight: 5
chapter: false
pre: " <b> 5. </b> "
---

# Deploying J2Car AutoParts on AWS

---

### Overview

To demonstrate the feasibility and evaluate the performance of the proposed architecture for **J2Car AutoParts**, I successfully deployed the entire system on AWS. 

This workshop documents the step-by-step process of constructing and running the system from the initial architectural diagram into a fully operational application on the cloud.

---

### System Architecture Diagram

Every deployment stage was configured in strict compliance with the architecture diagram below:

![J2Car AutoParts System Architecture](/images/kientruchethong.png)

---

### Detailed Workshop Sections

1. [Step 1: Resource Setup & Docker Image Packaging](5.1-Pre/)
2. [Step 2: Provisioning Multi-AZ Networking (Network Layer)](5.2-Network/)
3. [Step 3: Configuring S3 VPC Gateway Endpoint](5.3-S3-Endpoint/)
4. [Step 4: Database & Cache Configuration (Data Layer)](5.4-Data/)
5. [Step 5: Load Balancer & Application Service Deployment (Compute Layer)](5.5-Compute/)
6. [Step 6: Deploying Integration & Security Layers (Integration & Security)](5.6-Security/)
7. [Step 7: End-to-End Verification](5.7-Verify/)
