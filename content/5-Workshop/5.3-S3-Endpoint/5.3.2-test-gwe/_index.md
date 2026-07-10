---
title: "Test the Gateway Endpoint"
date: 2024-01-01
weight: 2
chapter: false
pre: " <b> 5.3.2. </b> "
---

## Test the Amazon S3 VPC Gateway Endpoint

I verified the Gateway Endpoint connection by accessing a private EC2 instance inside the VPC Cloud and copying test payloads to S3.

---

### 1. Connect to EC2 via Systems Manager (SSM) Session Manager

To maintain security, private EC2 instances do not expose inbound SSH ports (port 22) or have public IPs. I accessed the private shell using **AWS Session Manager**:

1. Open the **AWS Systems Manager Console**.
2. Select **Session Manager** under the *Node Management* section in the left panel.
3. Click **Start Session**, select the EC2 instance named **Test-Gateway-Endpoint** (deployed inside the Private Subnet of the VPC Cloud).
4. Click **Start Session** to launch the interactive terminal tab.

---

### 2. Upload Payload to S3

Within the active session shell, I executed command lines to build a 1GB dummy file and push it to S3:

```bash
# Change to the ssm-user home directory
cd ~

# Allocate a 1GB file named testfile.xyz
fallocate -l 1G testfile.xyz

# Copy the file to the J2Car media bucket
aws s3 cp testfile.xyz s3://j2car-media-bucket-571210199437
```

---

### 3. AWS Console Verification Proofs

#### 3.1. S3 Media Bucket containing the uploaded payload (`14-s3.png`):
![S3 Media Bucket Content](/images/5-Workshop/14-s3.png)

#### 3.2. Route Table Ingestion
Inside the private Route Table settings, I confirmed that a local route entry directing S3 Prefix List traffic (`pl-6fa54006`) to the target Endpoint Gateway `vpce-XXXXXXXX` has been appended. 

This establishes a secure, private communication path to S3 without using an Internet Gateway.
