---
title: "5.2. VPC & Networking Setup"
date: 2024-01-01
weight: 2
chapter: false
pre: " <b> 5.2. </b> "
---

# Step 1: Provision Amazon VPC Networks & Infrastructure

The virtual private network **Amazon VPC** acts as the primary security boundary, segmenting access control and orchestrating traffic flow in and out of the system. To prevent single points of failure, we partition the VPC across 2 Availability Zones (AZs), clearly separating Public subnets from Private subnets.

---

### Step-by-Step Practical Lab

#### 1. Create a Tiered VPC
1. Sign in to the **AWS Management Console** and navigate to the **VPC** service dashboard.
2. Click **Create VPC** and select **VPC and more** to automatically configure dependent assets.
3. Configure the following parameters:
   * **Name tag generation:** `J2Car-Production`
   * **IPv4 CIDR block:** `10.0.0.0/16`
   * **Number of Availability Zones (AZs):** `2` (Select `ap-southeast-1a` and `ap-southeast-1b`)
   * **Number of Public Subnets:** `2` (Hosts ALB, NAT Gateways)
   * **Number of Private Subnets:** `6` (Hosts ECS Backend, Databases, Redis, and AWS Lambda)
4. Assign CIDR blocks to subnets to maintain isolated zones:
   * **Public Subnet 1 (AZ1):** `10.0.1.0/24` (Hosts ALB front, NAT Gateway AZ1)
   * **Public Subnet 2 (AZ2):** `10.0.2.0/24` (Hosts ALB front, NAT Gateway AZ2)
   * **Private Subnet 1 (Compute AZ1):** `10.0.3.0/24` (Hosts ECS Backend Task 1)
   * **Private Subnet 2 (Compute AZ2):** `10.0.4.0/24` (Hosts ECS Backend Task 2)
   * **Private Subnet 3 (Data AZ1):** `10.0.5.0/24` (Hosts DocumentDB Primary / Redis Primary)
   * **Private Subnet 4 (Data AZ2):** `10.0.6.0/24` (Hosts DocumentDB Replica / Redis Replica)
   * **Private Subnet 5 (Integration AZ1):** `10.0.7.0/24` (Hosts Lambda Webhook AZ1)
   * **Private Subnet 6 (Integration AZ2):** `10.0.8.0/24` (Hosts Lambda Webhook AZ2)

![VPC and Subnets Partitioning](/images/5-Workshop/5.2-VPC-Networking/1-vpc.png)
![Subnets Range Definition](/images/5-Workshop/5.2-VPC-Networking/2-subnets.png)

#### 2. Configure Routing and NAT Gateways
* **Application Load Balancer (ALB):** 
  * Provisioned in **Public Subnets** to receive client HTTP/HTTPS requests.
  * Configured with **Path Rules** to route traffic dynamically (e.g., routing `/api/*` to the Backend Target Group in Private subnets).
* **NAT Gateways & Elastic IPs (EIPs):**
  * Launch **1 NAT Gateway per AZ** (total 2 NAT Gateways with 2 Elastic IPs) residing inside the Public Subnets.
  * Allows isolated resources (such as ECS Backend and AWS Lambda in Private Subnets) to establish secure outbound connections to the internet (e.g., SMTP email servers, payment gateway webhook replies VNPay/MoMo) while blocking unauthorized inbound ingress.
* Click **Create VPC** and monitor status changes until completion.

![NAT Gateways Running](/images/5-Workshop/5.2-VPC-Networking/3-nat.png)

---

### Routing Verification

1. **Route Tables:**
   * Go to **Route Tables** in the VPC Console.
   * Verify that the **Public Route Table** has a default route: `0.0.0.0/0 -> igw-xxxx` (Internet Gateway).
   * Verify that the **Private Route Tables** have default routes pointing to their respective gateways: `0.0.0.0/0 -> nat-xxxx` (NAT Gateway).
2. **DNS settings:**
   * Make sure **DNS Hostnames** and **DNS Resolution** are **Enabled** on your VPC. This ensures private domain endpoints (such as DocumentDB cluster URLs) can be resolved.

![Route Tables and Endpoint Verification](/images/5-Workshop/5.2-VPC-Networking/4-endpoints.png)

> [!IMPORTANT]
> Network segregation completely blocks public internet endpoints from accessing backend compute and database tiers directly, reducing the attack surface.
