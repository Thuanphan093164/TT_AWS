---
title: "Step 1: Introduction"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 5.1. </b> "
---

## Step 1: Introduction to VPC Endpoints & J2Car System Overview

**VPC Endpoints** are horizontally scaled, redundant, and highly available virtual devices. They allow private communication between your compute resources in the VPC and AWS services without needing an Internet Gateway or NAT Gateway, reducing public security exposure and bandwidth costs.

For the **J2Car AutoParts** platform, backend containers need constant communication with AWS services such as **Amazon S3** (for parts catalog media), **Amazon ECR** (for pull images), and **AWS Secrets Manager** (to retrieve connection strings). Provisioning VPC Endpoints is critical to ensure zero-trust compliance.

---

### Workshop Overview

In this deployment lab, we construct and test connectivity between:

1. **VPC Cloud (J2Car-Production-VPC):** The cloud perimeter hosting ECR, S3, ECS, and the S3 Gateway VPC Endpoint.
2. **VPC On-Prem (Simulated On-premises):** Simulates the J2Car local office/warehouse. An EC2 instance running strongSwan VPN software is configured to establish a Site-to-Site VPN tunnel with Transit Gateway, enabling us to test secure on-premises S3 upload pathways using a **PrivateLink Interface Endpoint**.

---

### J2Car Platform Production Architecture

All configurations executed in this guide strictly conform to the layout below:

![J2Car System Architecture](/images/kientruchethong.png)
