---
title: "Step 2: Prerequisite"
date: 2024-01-01
weight: 2
chapter: false
pre: " <b> 5.2. </b> "
---

## Step 2: Provisioning Infrastructure & IAM Policy

To begin the deployment of J2Car AutoParts platform, I configured the prerequisite permissions and established the Multi-AZ network foundation.

---

### 1. IAM Permissions Verification

The IAM account was configured with full permissions to provision EC2, VPC Endpoints, S3, and Route 53 resources. I verified the account session using the AWS CLI:

```bash
aws sts get-caller-identity
# Verified Admin Account ID: 571210199437
```

---

### 2. Deploy Network Stack via CloudFormation

The core Multi-AZ network for J2Car (`J2Car-workshop-VPC`) was provisioned programmatically using a CloudFormation template. I initiated the deployment stack:

```bash
# Provision network infrastructure
aws cloudformation create-stack \
  --stack-name J2Car-Workshop-Network \
  --template-body file://j2car-network.yaml \
  --region ap-southeast-1

# Wait for stack completion
aws cloudformation wait stack-create-complete \
  --stack-name J2Car-Workshop-Network --region ap-southeast-1
```

Once the stack transitioned to `CREATE_COMPLETE`, the public and private subnet pathways were fully active.

---

### 3. AWS Console Verification Proofs

#### 3.1. Provisioned S3 Buckets for static hosting and products (`14-s3.png`):
![Active S3 Buckets](/images/5-Workshop/14-s3.png)

#### 3.2. Private ECR Container Registries (`11-ecr.png`):
![ECR Registries](/images/5-Workshop/11-ecr.png)
