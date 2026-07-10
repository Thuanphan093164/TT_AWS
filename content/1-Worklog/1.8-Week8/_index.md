---
title: "Week 8 Worklog"
date: 2024-01-01
weight: 8
chapter: false
pre: " <b> 1.8. </b> "
---

## Week 8 Objectives

- Study and practice migrating servers from on-premises to AWS using **VM Import/Export**.
- Containerize applications with **Docker** and orchestrate with **Docker Compose** on Amazon EC2.
- Connect containerized applications to **Amazon RDS** and store Docker Images on **Amazon ECR** and Docker Hub.

---

## Weekly Task Plan

| Day | Task | Start Date | End Date | Reference |
|---|---|---|---|---|
| 2 | Study VM Import/Export concepts and prepare the local VM environment. | 08/06/2026 | 08/06/2026 | [VM Import Prereqs](https://docs.aws.amazon.com/vm-import/latest/userguide/vmie_prereqs.html) |
| 3 | Upload VM disk file to S3 and import as an AWS AMI. | 09/06/2026 | 09/06/2026 | [VM Import Image](https://docs.aws.amazon.com/vm-import/latest/userguide/vmimport-image.html) |
| 4 | Configure S3 ACLs, export EC2 instance or AMI back to S3, clean up resources. | 10/06/2026 | 10/06/2026 | [VM Export](https://docs.aws.amazon.com/vm-import/latest/userguide/vmexport.html) |
| 5 | Deploy and test application locally; prepare VPC, Security Groups, IAM Role for ECR, and Docker Hub login. | 11/06/2026 | 11/06/2026 | [Docker Docs](https://docs.docker.com/) |
| 6 | Create DB Subnet Group, launch RDS instance, and configure EC2 as Docker Host. | 12/06/2026 | 12/06/2026 | [Amazon RDS](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_CreateDBInstance.html) |
| 7 | Build Docker Images, run containers, configure Docker Compose, push images to ECR and Docker Hub, clean up. | 13/06/2026 | 14/06/2026 | [Docker Compose](https://docs.docker.com/compose/) |

---

## Weekly Achievements

### 1. VM Import/Export (Lab 14)

#### 1.1. Prepare On-Premises VM
- Installed VMware Workstation Pro on the local machine.
- Created an Ubuntu Desktop VM with a 20GB single-file VMDK disk.
- Installed and enabled SSH server:
```bash
sudo apt update && sudo apt install openssh-server -y
sudo systemctl enable ssh --now
```

#### 1.2. Import VM to AWS

**Step 1 — Export VM from VMware:** Power Off the VM → **File → Export to OVF…** → generates `.vmdk` file.

**Step 2 — Upload to S3:**
- Created S3 bucket `vm-import-bucket-lab` (ACL enabled, Public Access blocked).
- Uploaded `ubuntu-disk1.vmdk` to the bucket.

**Step 3 — Create IAM Role for VM Import:**
```json
{
  "Effect": "Allow",
  "Principal": { "Service": "vmie.amazonaws.com" },
  "Action": "sts:AssumeRole",
  "Condition": { "StringEquals": { "sts:ExternalId": "vmimport" } }
}
```
```bash
aws iam create-role --role-name vmimport \
  --assume-role-policy-document "file://trust-policy.json"
aws iam put-role-policy --role-name vmimport \
  --policy-name vmimport-policy --policy-document "file://role-policy.json"
```

**Step 4 — Start Import Task:**
```bash
aws ec2 import-image \
  --description "Ubuntu Server Import" \
  --disk-containers "file://containers.json"

# Monitor progress
aws ec2 describe-import-image-tasks --import-task-ids import-ami-XXXXXXXX
```

**Step 5 — Launch EC2 from Imported AMI:**
```bash
ssh ubuntu@<Public_IP>  # Verify system is operational
```

#### 1.3. Export EC2 Back to On-Premises
```bash
# Set S3 bucket ACL for VM Import/Export service
aws s3api put-bucket-acl \
  --bucket vm-import-bucket-lab \
  --grant-write "id=c4d8eabf8db69dbe46bfe0e517100c554f01200b104d59cd408e777ba442a322" \
  --grant-read-acp "id=c4d8eabf8db69dbe46bfe0e517100c554f01200b104d59cd408e777ba442a322"

# Export instance to S3 as OVA
aws ec2 create-instance-export-task \
  --instance-id i-XXXXXXXX \
  --target-environment vmware \
  --export-to-s3-task DiskImageFormat=vmdk,ContainerFormat=ova,\
S3Bucket=vm-import-bucket-lab,S3Prefix=exports/
```

---

### 2. Deploy Application with Docker, RDS & ECR (Lab 15)

#### 2.1. Introduction
This lab containerizes a fullstack application — **React Frontend**, **Express Backend**, **MySQL Database** — using Docker on EC2, Docker Compose for orchestration, Amazon RDS MySQL as the managed database, and Amazon ECR / Docker Hub as image registries.

#### 2.2. Local Deployment
```bash
git clone https://github.com/AWS-First-Cloud-Journey/aws-fcj-container-app.git
cd aws-fcj-container-app
cd backend && npm install && npm run dev
cd ../frontend && npm install && npm start
# Verify at http://localhost:3000
```

#### 2.3. AWS Infrastructure Setup

**VPC Configuration:**
- VPC `FCJ-Lab-vpc` with CIDR `10.0.0.0/16`
- 1 Public Subnet (EC2 web server) + 2 Private Subnets in separate AZs (Amazon RDS Multi-AZ)
- Internet Gateway and Route Table for Public Subnet internet access

**Security Groups:**
- `FCJ-Lab-sg-public`: Inbound SSH (22), HTTP (80), port 3000, port 5000 from `0.0.0.0/0`
- `FCJ-Lab-sg-private`: MySQL (3306) from Public Security Group only

#### 2.4. Launch Amazon RDS MySQL
```bash
aws rds create-db-subnet-group \
  --db-subnet-group-name "fcj-lab-db-subnet-group" \
  --db-subnet-group-description "Subnet group for J2Car RDS" \
  --subnet-ids subnet-XXXXXXXX subnet-YYYYYYYY

aws rds create-db-instance \
  --db-instance-identifier "fcj-lab-rds-mysql" \
  --db-instance-class db.t3.micro \
  --engine mysql \
  --master-username admin \
  --master-user-password "YourSecurePass!" \
  --db-subnet-group-name "fcj-lab-db-subnet-group" \
  --no-publicly-accessible
```

#### 2.5. Configure EC2 as Docker Host
```bash
sudo apt update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io \
  docker-buildx-plugin docker-compose-plugin mysql-client unzip

# Import schema into RDS
mysql -h <RDS_ENDPOINT> -u admin -p
source aws-fcj-container-app/database/init.sql;
```

#### 2.6. Deploy with Docker
```bash
sudo docker network create app-network

# Backend
cd backend && sudo docker build . -t backend-image
sudo docker run -d -p 5000:5000 --network app-network --name backend backend-image

# Frontend
cd ../frontend && sudo docker build . -t frontend-image
sudo docker run -d -p 3000:80 --network app-network --name frontend frontend-image
```

#### 2.7. Deploy with Docker Compose
```bash
sudo docker stop backend frontend && sudo docker rm backend frontend
sudo docker compose -f docker-compose.app.yml up -d
sudo docker compose -f docker-compose.app.yml ps
```

#### 2.8. Push Images to Registry

**Amazon ECR:**
```bash
aws ecr create-repository --repository-name j2car-backend --region ap-southeast-1
aws ecr get-login-password --region ap-southeast-1 | \
  sudo docker login --username AWS --password-stdin \
  ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com

sudo docker tag backend-image:latest \
  ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/j2car-backend:latest
sudo docker push ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/j2car-backend:latest
```

**Docker Hub:**
```bash
sudo docker login
sudo docker tag backend-image:latest YOUR_DOCKERHUB/j2car-backend:latest
sudo docker push YOUR_DOCKERHUB/j2car-backend:latest
```

---

## Week 8 Summary

Week 8 combined two key cloud engineering topics: **VM Import/Export** enables migrating on-premises workloads to AWS without rebuilding from scratch; **Docker + Docker Compose + RDS + ECR** provides a modern containerization foundation with clear separation between the application and data layers — directly laying the groundwork for deploying to Amazon ECS Fargate in subsequent weeks.
