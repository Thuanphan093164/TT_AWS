---
title: "Create an S3 Interface Endpoint"
date: 2024-01-01
weight: 2
chapter: false
pre: " <b> 5.4.2. </b> "
---

## Create an Amazon S3 VPC Interface Endpoint (AWS PrivateLink)

I provisioned an S3 Interface Endpoint in our Cloud VPC to attach a static private IP resource inside each Availability Zone, enabling on-premises routing over the VPN tunnel.

---

### Step-by-Step Configuration

1. Open the **Amazon VPC Console** in the Singapore region (`ap-southeast-1`).
2. Select **Endpoints** from the left panel and click **Create Endpoint**.
3. In the Create endpoint configuration menu:
   - **Name tag:** Enter `s3-interface-endpoint`.
   - **Service category:** Select **AWS services**.
   - **Services:** Type `s3` in the search filter and select the service `com.amazonaws.ap-southeast-1.s3` with Type **Interface**.
   - **VPC:** Select **J2Car-workshop-VPC** (Ensure you select Cloud VPC and NOT On-premises VPC).
   - **Additional settings:** Ensure **Enable DNS name** is unchecked (we will handle custom DNS routing using Private Hosted Zones later).
   - **Subnets:** Check the AZ subnets in `ap-southeast-1a` and `ap-southeast-1b`.
   - **Security group:** Select the security group **SGforS3Endpoint** (allowing inbound HTTPS port 443 traffic originating from the on-premises subnet range).
   - **Policy:** Leave default as **Full Access**.
4. Click **Create endpoint** to proceed.

---

### AWS Console Verification Proofs

Once created, the VPC Dashboard displays the endpoint resource details:

#### Interface Endpoint Status Available:
![S3 VPC Endpoint](/images/5-Workshop/4-endpoints.png)
*(The Endpoint list now contains an Interface Type resource associated with private IP endpoints).*
