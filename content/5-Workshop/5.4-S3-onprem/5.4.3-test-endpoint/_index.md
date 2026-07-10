---
title: "Test the Interface Endpoint"
date: 2024-01-01
weight: 3
chapter: false
pre: " <b> 5.4.3. </b> "
---

## Test the Amazon S3 VPC Interface Endpoint

I verified the Interface Endpoint connection by copy-testing payloads from our simulated on-premises EC2 instance over the VPN.

---

### 1. Retrieve the Regional DNS Name of the Interface Endpoint

1. In the **Amazon VPC Console -> Endpoints**, select `s3-interface-endpoint`.
2. Under the **Details** tab, copy the first DNS name listed (the Regional DNS Name, e.g., `vpce-0c03478d1f2a-ap-southeast-1.s3.ap-southeast-1.vpce.amazonaws.com`) and save it to your scratchpad.

---

### 2. Establish Session to On-premises Instance

1. Navigate to the **AWS Systems Manager Console -> Session Manager**.
2. Click **Start Session** and select the EC2 instance named **Test-Interface-Endpoint** (deployed inside the `VPC On-prem`).
3. Generate a 1GB test file and upload it to the S3 bucket using the custom endpoint URL prefix:

```bash
# Move to home directory
cd ~

# Allocate a 1GB file named testfile2.xyz
fallocate -l 1G testfile2.xyz

# Copy file using the custom --endpoint-url parameter
aws s3 cp --endpoint-url https://bucket.vpce-0c03478d1f2a-ap-southeast-1.s3.ap-southeast-1.vpce.amazonaws.com testfile2.xyz s3://j2car-media-bucket-571210199437
```
*(Make sure to prepend the regional DNS name with "bucket." as shown in the example).*

---

### 3. Check Object in S3

I verified that `testfile2.xyz` is now listed inside the S3 Media Bucket console. The payload traversed through the Site-to-Site VPN tunnel securely using the private interface endpoint IPs, bypassing public networks.
