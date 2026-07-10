---
title: "Step 4: Access S3 from On-premise"
date: 2024-01-01
weight: 4
chapter: false
pre: " <b> 5.4. </b> "
---

## Step 4: Access S3 from On-premises using Interface Endpoint

In this section, I configured an **Amazon S3 PrivateLink Interface Endpoint** to enable physical local servers located at the J2Car AutoParts on-premises office/warehouse to communicate securely with the cloud S3 Media Bucket over a VPN tunnel.

---

### Gateway Endpoint vs. Interface Endpoint

- **Gateway Endpoint:** Only supports resources running natively inside the VPC where the gateway is deployed.
- **Interface Endpoint (AWS PrivateLink):** Supports resources inside the VPC as well as external systems located on-premises connecting via Site-to-Site VPN or AWS Direct Connect.

---

### Step-by-Step Sections

1. [Prepare Environment & Configure VPN Routing](5.4.1-prepare/)
2. [Create S3 Interface Endpoint](5.4.2-create-interface-enpoint/)
3. [Test Interface Endpoint DNS](5.4.3-test-endpoint/)
4. [DNS Resolver Simulation](5.4.4-dns-simulation/)
