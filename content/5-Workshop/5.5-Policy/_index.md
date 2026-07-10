---
title: "Step 5: VPC Endpoint Policies"
date: 2024-01-01
weight: 5
chapter: false
pre: " <b> 5.5. </b> "
---

## Step 5: Securing Traffic with VPC Endpoint Policies

By default, newly provisioned VPC Gateway and Interface Endpoints attach a policy granting **Full Access** to target service endpoints. To harden the J2Car AutoParts platform, I configured custom **VPC Endpoint Policies** to restrict network traffic pathways, allowing access only to specified S3 buckets.

---

### 1. Apply Restrictive Endpoint Policy

I modified the policy of our Gateway Endpoint to block data transfer requests targeted for unapproved external buckets:

1. Open the **Amazon VPC Console -> Endpoints**.
2. Select the Gateway VPC Endpoint (`s3-gwe`) created earlier.
3. Click the **Policy** tab, and select **Edit policy**.
4. Replace the default policy statement with the following JSON configuration to isolate traffic strictly to the J2Car media bucket:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowAccessToJ2CarMediaBucket",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::j2car-media-bucket-571210199437",
        "arn:aws:s3:::j2car-media-bucket-571210199437/*"
      ]
    }
  ]
}
```
5. Click **Save** to apply.

---

### 2. Verify Policy Enforcement

I verified policy rules from the shell of our **Test-Gateway-Endpoint** EC2 instance:

- **Command 1: Access allowed S3 Media Bucket (Succeeds):**
```bash
aws s3 ls s3://j2car-media-bucket-571210199437
# Output: Lists contents successfully
```

- **Command 2: Access unapproved S3 Web Bucket (Blocked):**
```bash
aws s3 ls s3://j2car-web-bucket-571210199437
# Output: Returns Access Denied error (Successfully Blocked by Policy)
```

The VPC Endpoint Policy is active, securing the cloud perimeter and preventing unapproved data exfiltration attempts.
