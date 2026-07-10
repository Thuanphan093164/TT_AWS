---
title: "On-premises DNS Simulation"
date: 2024-01-01
weight: 4
chapter: false
pre: " <b> 5.4.4. </b> "
---

## Simulated DNS Resolution from On-Premises to Cloud

To allow legacy local applications to target S3 using the standard endpoint URL (`s3.ap-southeast-1.amazonaws.com`) while routing transparently to the PrivateLink Interface Endpoint IPs, I configured Route 53 Resolvers.

---

### 1. Create DNS Alias Records in Private Hosted Zone

1. Open the **Route 53 Console -> Hosted Zones**.
2. Select the Private Hosted Zone named `s3.ap-southeast-1.amazonaws.com`.
3. Click **Create record**:
   - **Record name:** Leave blank.
   - **Alias:** Toggle to Enable.
   - **Route traffic to:** Select **Alias to VPC Endpoint**.
   - **Region:** Select `ap-southeast-1` (Singapore).
   - **Choose endpoint:** Paste the Regional VPC Endpoint DNS name copied previously.
4. Click **Add another record** to register wildcard subdomains:
   - **Record name:** Enter `*`.
   - **Alias:** Enable.
   - **Route traffic to:** Route to S3 VPC Endpoint Regional DNS.
5. Click **Create records**.

---

### 2. Configure Route 53 Resolver Forwarding Rule

I created a forwarding rule to intercept S3 DNS requests originating from the On-prem VPC and proxy them to the Cloud VPC Inbound Resolver Endpoint:

1. Under the Route 53 panel, click **Inbound endpoints** on the left menu and copy the two private IP addresses allocated.
2. Select **Rules** from the Resolver submenu, and click **Create rule**:
   - **Name:** `myS3Rule`.
   - **Rule type:** Select **Forward**.
   - **Domain name:** Enter `s3.ap-southeast-1.amazonaws.com`.
   - **VPC:** Select `VPC On-prem`.
   - **Outbound endpoint:** Select `VPCOnpremOutboundEndpoint`.
   - **Target IP Addresses:** Add both private IP addresses copied from the Inbound Resolver Endpoint.
3. Click **Submit**.

---

### 3. Test Local DNS Resolution

Log back in to the **Test-Interface-Endpoint** EC2 shell and run dig commands:

```bash
dig +short s3.ap-southeast-1.amazonaws.com
```

The output yields the private IP addresses of the Interface Endpoint. I verified that the AWS CLI can now communicate natively without manually supplying endpoint URLs:

```bash
aws s3 ls s3://j2car-media-bucket-571210199437
```
The local DNS simulation is fully operational.
