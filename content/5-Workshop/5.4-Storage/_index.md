---
title: "5.4. S3 Storage & VPC Endpoints"
date: 2024-01-01
weight: 4
chapter: false
pre: " <b> 5.4. </b> "
---

# Step 3: Configure Amazon S3 Storage & VPC Gateway Endpoints

The storage layer manages static files and multimedia assets for the J2Car AutoParts project. We deploy **Amazon S3** buckets and optimize traffic routing internally using a **VPC Gateway Endpoint** to bypass NAT Gateway data processing charges.

---

### Step-by-Step Practical Lab

#### 1. Provision Segregated S3 Buckets
We partition our storage into two S3 buckets based on access control requirements:
1. **S3 Web Hosting Bucket (Static Frontend):**
   * Go to **Amazon S3** console and click **Create Bucket**.
   * **Bucket Name:** `j2car-frontend-web-bucket`
   * **Object Ownership:** ACLs Disabled.
   * **Block Public Access:** Temporarily uncheck this option to allow static website hosting for lab purposes. (In production, this is blocked and secured using CloudFront OAC).
   * Click **Create bucket**.
2. **S3 Media Bucket (Spare Parts Images):**
   * Click **Create Bucket**.
   * **Bucket Name:** `j2car-media-storage-bucket`
   * **Block Public Access:** Keep this **Enabled**. All spare parts images uploaded from the Admin dashboard are stored privately.
   * Click **Create bucket**.

![Provisioned S3 Buckets](/images/5-Workshop/5.4-Storage/14-s3.png)

#### 2. Secure Image Delivery via Presigned URLs
To display images from the private S3 Media bucket without exposing files publicly:
* The Backend application integrates the AWS SDK for S3 to generate temporary **Presigned URLs** with short lifespans (e.g., 15 minutes).
* When a user visits the catalog, the Backend returns these dynamic presigned links to the client browser, securing media assets.

#### 3. Provision VPC Gateway Endpoint for S3
* By default, ECS compute tasks running in Private subnets communicate with public S3 endpoints via the NAT Gateway, accruing processing fees. The VPC Endpoint routes S3 traffic through AWS's internal fiber backplane for free.
1. Open the **VPC Console** and select **Endpoints**.
2. Click **Create Endpoint**.
3. Apply details:
   * **Name:** `j2car-s3-gateway-endpoint`
   * **Service Category:** Choose **AWS services**.
   * **Service Name:** Search and select `com.amazonaws.ap-southeast-1.s3` with Type **Gateway**.
   * **VPC:** Target `J2Car-Production-VPC`.
   * **Route Tables:** Select the route tables mapping to Private Subnets 1 and 2 (Compute zone where Backend tasks run).
4. Click **Create Endpoint**.

---

### Verification
1. Open the route tables of your Private Subnets in the VPC dashboard.
2. In the **Routes** tab, confirm the following entry was automatically injected:
   `pl-xxxxxxxx (AWS Prefix List for S3) -> vpce-xxxxxxxx`
3. Any photo upload or download request between the ECS containers and S3 is now routed internally, bypassing public internet routes.

> [!TIP]
> Setting up a VPC Gateway Endpoint for S3 cuts down NAT Gateway data processing fees by over 90% when handling large catalogs of vehicle spare parts images.
