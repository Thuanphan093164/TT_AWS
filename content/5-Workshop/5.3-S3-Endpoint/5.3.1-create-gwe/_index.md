---
title: "Create a Gateway Endpoint"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 5.3.1. </b> "
---

## Create an Amazon S3 VPC Gateway Endpoint

I initiated and attached a Gateway Endpoint for Amazon S3 to the private route tables to manage local routing.

---

### Step-by-Step Configuration

1. Open the **Amazon VPC Console** in the Singapore region (`ap-southeast-1`).
2. In the left navigation pane, select **Endpoints**, then click **Create Endpoint**.
3. In the Create endpoint menu:
   - **Name tag:** Enter `s3-gwe`.
   - **Service category:** Choose **AWS services**.
   - **Services:** Type `s3` in the search filter and select the service containing Type **Gateway** (`com.amazonaws.ap-southeast-1.s3`).
   - **VPC:** Select the main VPC `J2Car-workshop-VPC` from the dropdown list.
   - **Configure route tables:** Check the Route Table linked to the Private Subnets (the table managing routes for Private Subnets AZ1 and AZ2 containing ECS Backend).
   - **Policy:** Leave the default selection as **Full Access**.
4. Click **Create endpoint** to execute.

---

### AWS Console Verification Proofs

I verified the active route endpoint in the VPC Dashboard:

#### S3 VPC Gateway Endpoint Active (`4-endpoints.png`):
![S3 VPC Endpoint](/images/5-Workshop/4-endpoints.png)
