---
title: "Step 3: Access S3 from VPC"
date: 2024-01-01
weight: 3
chapter: false
pre: " <b> 5.3. </b> "
---

## Step 3: Access S3 from VPC using Gateway Endpoint

In this section, I configured a **VPC Gateway Endpoint** for Amazon S3, enabling backend tasks hosted in private subnets to write and fetch media objects securely without traversing the public internet or utilizing NAT Gateway data processing paths.

---

### Connectivity Principles

By leveraging a Gateway Endpoint:
1. All traffic addressed to Amazon S3 is routed locally through the private AWS network backbone.
2. Route Tables for private subnets are updated with prefix list target entries pointing directly to the Gateway Endpoint ID.
3. This eliminates NAT Gateway data processing charges, significantly optimizing infrastructure costs for J2Car AutoParts.

---

### Step-by-Step Sections

1. [Create S3 Gateway Endpoint](5.3.1-create-gwe/)
2. [Test Gateway Endpoint Connectivity](5.3.2-test-gwe/)
