---
title: "Week 7 Worklog"
date: 2024-01-01
weight: 7
chapter: false
pre: " <b> 1.7. </b> "
---

## Week 7 Objectives

- Practice managing AWS resources through **AWS CLI** (Command Line Interface).
- Study and configure **AWS Organizations** for multi-account management and Organizational Units (OUs).
- Deploy **IAM Identity Center** for centralized access control and time-based permissions.
- Practice automated data backup with **AWS Backup**.

---

## Weekly Task Plan

| Day | Task | Start Date | End Date | Reference |
|---|---|---|---|---|
| 2 | Install and configure AWS CLI v2. Practice viewing resources via CLI. | 01/06/2026 | 01/06/2026 | [AWS CLI Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) |
| 3 | Practice AWS CLI with Amazon S3 and Amazon SNS: create bucket, upload files, create topic and subscribe. | 02/06/2026 | 02/06/2026 | [CLI S3/SNS](https://docs.aws.amazon.com/cli/latest/userguide/cli-services-ec2.html) |
| 4 | Practice AWS CLI with IAM and VPC: create users, groups, VPC, subnets, Internet Gateway, and launch EC2. | 03/06/2026 | 03/06/2026 | [CLI IAM](https://docs.aws.amazon.com/cli/latest/userguide/cli-services-iam.html) |
| 5 | Study AWS Organizations: create member accounts, configure OUs, invite external AWS accounts. | 04/06/2026 | 04/06/2026 | [AWS Organizations](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_introduction.html) |
| 6 | Configure member account CLI access, time-based access control, and Customer Managed Policies in IAM Identity Center. | 05/06/2026 | 05/06/2026 | [IAM Identity Center](https://docs.aws.amazon.com/singlesignon/latest/userguide/what-is.html) |
| 7 | Practice AWS Backup: prepare environment, create S3 bucket, deploy infrastructure, and test restore operations. | 06/06/2026 | 06/06/2026 | [AWS Backup](https://docs.aws.amazon.com/aws-backup/latest/devguide/whatisbackup.html) |

---

## Weekly Achievements

### 1. AWS CLI Practice (Lab 11)

#### 1.1. Introduction
AWS CLI is an open-source tool enabling direct interaction with all AWS services via shell commands. It automates resource provisioning, system configuration, and CI/CD pipeline integration more efficiently than manual Console operations.

#### 1.2. Installation & Configuration
```bash
aws --version
# Output: aws-cli/2.34.46 Python/3.14.4 Windows/11 exe/AMD64

aws configure
# AWS Access Key ID, Secret Access Key, Region: ap-southeast-1, Output: json
```

#### 1.3. AWS CLI with Amazon S3
```bash
# Create S3 bucket
aws s3 mb s3://j2car-lab-cli-2026 --region ap-southeast-1

# Enable versioning
aws s3api put-bucket-versioning --bucket j2car-lab-cli-2026 \
  --versioning-configuration Status=Enabled

# Upload file
echo "Hello from AWS CLI Lab" > lab-test.txt
aws s3 cp lab-test.txt s3://j2car-lab-cli-2026/
```

#### 1.4. AWS CLI with Amazon SNS
```bash
aws sns create-topic --name "j2car-alert-topic"
aws sns subscribe \
  --topic-arn "arn:aws:sns:ap-southeast-1:ACCOUNT_ID:j2car-alert-topic" \
  --protocol email \
  --notification-endpoint "your-email@example.com"
```

#### 1.5. AWS CLI with IAM
```bash
aws iam create-group --group-name "dev-team"
aws iam create-user --user-name "dev-member-1"
aws iam add-user-to-group --user-name "dev-member-1" --group-name "dev-team"
aws iam create-access-key --user-name "dev-member-1"
```

#### 1.6. AWS CLI with VPC & EC2
```bash
# Create VPC and subnets
aws ec2 create-vpc --cidr-block 10.0.0.0/16
aws ec2 create-subnet --vpc-id vpc-XXXXXXXX --cidr-block 10.0.1.0/24

# Create and attach Internet Gateway
aws ec2 create-internet-gateway
aws ec2 attach-internet-gateway --vpc-id vpc-XXXXXXXX --internet-gateway-id igw-XXXXXXXX

# Launch EC2 instance
aws ec2 run-instances \
  --image-id ami-047126e50991d067b \
  --count 1 --instance-type t3.micro \
  --key-name "LabKeyPair" \
  --security-group-ids sg-XXXXXXXX \
  --subnet-id subnet-XXXXXXXX \
  --associate-public-ip-address
```

> **Note:** In AWS Academy Learner Sandbox, `t2.micro` is restricted. Use `t3.micro` instead.

---

### 2. AWS Organizations & IAM Identity Center (Lab 12)

#### 2.1. AWS Organizations Setup
- Created member account `production-account` from the Management Account.
- Created OUs: `Security`, `Shared Services`, `Logging`, `Application`.
- Moved member accounts into appropriate OUs for permission isolation.
- Switched roles to member account using `OrganizationAccountAccessRole`.

#### 2.2. AWS CLI with IAM Identity Center
```bash
aws configure sso
# Browser-based OIDC device authorization flow generates temporary credentials
```

#### 2.3. Time-Based Access Control
Implemented IAM policy using `aws:CurrentTime` to deny sensitive actions outside working hours:
```json
{
  "Effect": "Deny",
  "Action": "ec2:TerminateInstances",
  "Resource": "*",
  "Condition": {
    "DateGreaterThan": { "aws:CurrentTime": "2026-06-01T18:00:00Z" },
    "DateLessThan":    { "aws:CurrentTime": "2026-06-02T08:00:00Z" }
  }
}
```

#### 2.4. Customer Managed Policies
Permission Sets in IAM Identity Center can reference Customer Managed Policies in member accounts. The policy name must match **exactly** as referenced in the Permission Set.

---

### 3. AWS Backup (Lab 13)

#### 3.1. Introduction
AWS Backup is a fully managed service that centralizes and automates data protection across AWS services: EBS Volumes, RDS Databases, DynamoDB Tables, EFS File Systems, and S3 Buckets — all through a single interface.

#### 3.2. Environment Setup
```bash
aws s3 mb s3://j2car-backup-lab-artifacts --region ap-southeast-1
aws s3 cp lambda_function.zip s3://j2car-backup-lab-artifacts/lambda_function.zip

aws cloudformation create-stack \
  --stack-name "Backup-plan-lab" \
  --template-body "file://backup-lab.yaml" \
  --parameters \
    ParameterKey=AvailabilityZone,ParameterValue="ap-southeast-1a" \
    ParameterKey=NotificationEmail,ParameterValue="your-email@example.com" \
    ParameterKey=S3BucketName,ParameterValue="j2car-backup-lab-artifacts" \
    ParameterKey=S3KeyLambdaZip,ParameterValue="lambda_function.zip" \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM
```

#### 3.3. Create Backup Vault & Plan
```bash
aws backup create-backup-vault --backup-vault-name "J2CAR-BACKUP-VAULT"
# Assign resources using Tag: workload=j2car-production
```

#### 3.4. Configure Event Notifications
```bash
aws backup put-backup-vault-notifications \
  --backup-vault-name "J2CAR-BACKUP-VAULT" \
  --backup-vault-events BACKUP_JOB_COMPLETED RESTORE_JOB_COMPLETED \
  --sns-topic-arn "arn:aws:sns:ap-southeast-1:ACCOUNT_ID:BackupNotificationTopic"
```

#### 3.5. Test Restore
```bash
aws backup start-backup-job \
  --backup-vault-name "J2CAR-BACKUP-VAULT" \
  --resource-arn "arn:aws:ec2:ap-southeast-1:ACCOUNT_ID:instance/i-XXXXXXXX" \
  --iam-role-arn "arn:aws:iam::ACCOUNT_ID:role/AWSServiceRoleForBackup"
```

---

## Week 7 Summary

Week 7 reinforced AWS operational skills through automation and security: **AWS CLI** fully replaces manual Console operations, **AWS Organizations + IAM Identity Center** provides centralized multi-account governance, and **AWS Backup** ensures data integrity through automated backup and restore workflows.
