---
title: "Week 6 Worklog"
date: 2024-01-01
weight: 6
chapter: false
pre: " <b> 1.6. </b> "
---

## Week 6 Objectives

- Practice AWS system monitoring with **Amazon CloudWatch**: Metrics, Logs, Alarms, and Dashboards.
- Study AWS Support plans and practice creating and managing Support Cases.
- Deploy a **Hybrid DNS** architecture integrating on-premises systems with AWS using Route 53 Resolver and AWS Managed Microsoft AD.

---

## Weekly Task Plan

| Day | Task | Start Date | End Date | Reference |
|---|---|---|---|---|
| 2 | Study Amazon CloudWatch and prepare the lab environment. Explore Metrics, Math Expressions, and Dynamic Labels. | 25/05/2026 | 25/05/2026 | [CloudWatch Docs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html) |
| 3 | Practice CloudWatch Logs and Logs Insights, create Metric Filters, Alarms, Dashboards, and clean up resources. | 26/05/2026 | 26/05/2026 | [CloudWatch Logs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/WhatIsCloudWatchLogs.html) |
| 4 | Study AWS Support plans, access the AWS Support Console, and review Support Request types. | 27/05/2026 | 27/05/2026 | [AWS Support Plans](https://aws.amazon.com/premiumsupport/plans/) |
| 5 | Create Support Cases, select severity levels, and track case processing status. | 28/05/2026 | 28/05/2026 | [Case Management](https://docs.aws.amazon.com/awssupport/latest/user/case-management.html) |
| 6 | Prepare the Hybrid DNS lab: create Key Pair, initialize CloudFormation stack, configure Security Groups, connect to RDGW. | 29/05/2026 | 29/05/2026 | [AWS Directory Service](https://docs.aws.amazon.com/directoryservice/latest/admin-guide/what_is.html) |
| 7 | Configure DNS with Route 53 Resolver: create Outbound Endpoint, Resolver Rules, Inbound Endpoint, verify results, and clean up. | 30/05/2026 | 31/05/2026 | [Route 53 Resolver](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resolver-forwarding-outbound-queries.html) |

---

## Weekly Achievements

### 1. Amazon CloudWatch Lab Practice

#### 1.1. Environment Initialization (CloudFormation)

- Successfully deployed the CloudFormation template to create the VPC structure, EC2 instances, and required IAM policies.
- Configured and launched the background log generator script on EC2 Instance A via **Systems Manager Run Command** — no direct SSH required.
- Confirmed stack creation succeeded with status `CREATE_COMPLETE` in the AWS Console.

#### 1.2. CloudWatch Metrics Operations

- Reviewed resource utilization (CPU, Network, Disk) across running EC2 instances.
- Configured **dual Y-axes** to compare two metrics with different units on the same graph.
- Added a **Horizontal Annotation** at the 5% CPU threshold and a **Vertical Annotation** marking the job start event at 02:40 for event tracing.

#### 1.3. CloudWatch Logs & Logs Insights

- Updated log retention for `/ec2/linux/var/log/messages` from **Never expire** to **1 week (7 days)** to control storage costs.
- Ran queries in **Logs Insights** to analyze real-time events and filter lines containing the keyword `ERROR`.
- Created a **Metric Filter** named `PythonAppErrors` to automatically convert Python application error logs into a numeric metric for Alarm triggering.

#### 1.4. CloudWatch Alarm & SNS Notification Setup

- Created an **SNS Topic** named `Error_logs_reach_10` and subscribed an email address for automated alert delivery.
- Created a **CloudWatch Alarm** named `PythonApplicationErrorAlarm` configured to trigger when total errors exceed 10 within a 1-minute period. When the Alarm enters `ALARM` state, SNS immediately sends an email alert.

#### 1.5. CloudWatch Dashboard

- Built a custom Dashboard named `CloudWatch-Workshop` consolidating the Metric Filter error chart and Alarm status widget on a single screen for a holistic system health overview.

---

### 2. AWS Support Overview

#### 2.1. AWS Support Plans

| Plan | Key Features | Cost |
|---|---|---|
| **Basic** | Account and billing support only | Free |
| **Developer** | Technical email support during business hours | From $29/month |
| **Business** | 24/7 phone, chat, email; 1-hour SLA for critical issues | From $100/month |
| **Enterprise On-Ramp** | Shared Technical Account Manager (TAM) access | From $5,500/month |
| **Enterprise** | Dedicated TAM; 15-minute SLA for critical outages | From $15,000/month |

#### 2.2. Creating Support Cases

Practiced creating Support Cases for both **Account & Billing** and **Technical** categories with the following severity levels:
- `General guidance` — General consultation.
- `System impaired` — System performing abnormally slowly.
- `Production system impaired` — Production system affected.
- `Production system down` — Entire production system down.
- `Business/Mission critical system down` — Critical outage directly impacting revenue.

---

### 3. Hybrid DNS Lab – Route 53 Resolver

#### 3.1. Key Pair Creation
- Created a Key Pair named `hybrid-DNS` (RSA, .pem format) to decrypt the Administrator password for RDGW instance access.

#### 3.2. CloudFormation Stack Initialization
- Deployed the `HybridDNS` stack with: AZs `ap-southeast-1a` & `ap-southeast-1c`, Key Pair `hybrid-DNS`, instance type `t3.micro`.
- Stack completed `CREATE_COMPLETE`, provisioning: Multi-AZ VPC, 2 Public Subnets, 2 Private Subnets, Internet Gateway, Route Tables, Security Groups, and a Windows Server 2022 RDGW EC2 instance.

#### 3.3. Security Group Configuration
- Removed unnecessary inbound rules (Port 3391, Port 443).
- Restricted **RDP (3389)** and **ICMP** to allow access only from the lab machine's IP instead of the entire Internet (`0.0.0.0/0`).

#### 3.4. RDGW Connection
- Downloaded the RDP file from the EC2 Console, decrypted the Administrator password using `hybrid-DNS.pem`, and successfully connected via Remote Desktop Protocol.

#### 3.5. AWS Managed Microsoft AD Deployment
- Directory DNS name: `onprem.example.com` | NetBIOS: `onprem` | Edition: Standard
- After ~20 minutes, directory status changed to **Active** with two DNS IPs: `10.0.25.100` and `10.0.44.109`.

#### 3.6. Route 53 Resolver Configuration

**Outbound Endpoint:** Created `outbound-endpoint` (IPv4, Do53) — allows Route 53 Resolver to forward DNS queries from AWS to on-premises DNS (Microsoft AD). Status: `Operational`.

**Resolver Rule:** Created `onprem-rule` (type: FORWARD) for domain `onprem.example.com`, targeting `10.0.25.100:53` and `10.0.44.109:53`. Associated with the HybridDNS VPC.

**Inbound Endpoint:** Created `inbound-endpoint` (IPv4, Do53) — allows on-premises DNS to send queries back into Route 53 Resolver to resolve AWS Private Hosted Zones.

#### 3.7. Result Verification
```powershell
nslookup onprem.example.com
Resolve-DnsName onprem.example.com
```
Both commands returned correct IP addresses — confirming the Hybrid DNS flow is working as configured.

#### 3.8. Resource Cleanup
Deleted in order: `Inbound Endpoint` → `Disassociate & Delete Resolver Rule` → `Outbound Endpoint` → `AWS Managed Microsoft AD` → `CloudFormation Stack` → `Key Pair`.

---

## Week 6 Summary

Week 6 covered three critical operational skill areas: **system observability** with CloudWatch, **technical support management** with AWS Support, and **hybrid infrastructure integration** with Route 53 Resolver + Microsoft AD. These skills form a solid foundation for operating production systems on AWS.
