---
title: "Week 9 Worklog"
date: 2024-01-01
weight: 9
chapter: false
pre: " <b> 1.9. </b> "
---

## Week 9 Objectives

- Deploy containerized applications on **Amazon ECS Fargate** with ALB load balancing and Service Discovery via Cloud Map.
- Build automated CI/CD pipelines using **GitLab CI/CD**, **GitHub Actions**, and **AWS CodeBuild**.
- Monitor containers with **CloudWatch Container Insights** and route logs with **AWS Firelens**.
- Evaluate overall security posture with **AWS Security Hub**.

---

## Weekly Task Plan

| Day | Task | Start Date | End Date | Reference |
|---|---|---|---|---|
| 2 | Study Amazon ECS, Fargate, Task Definitions, and ECS Cluster operations. | 15/06/2026 | 15/06/2026 | [ECS Docs](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html) |
| 3 | Lab 16 (Part 1): Configure VPC, Subnets, NAT Gateway, Security Groups, and push Docker Images to ECR. | 16/06/2026 | 16/06/2026 | [ECR Docs](https://docs.aws.amazon.com/AmazonECR/latest/userguide/what-is-ecr.html) |
| 4 | Lab 16 (Part 2): Create ECS Cluster, Task Definitions for Frontend/Backend, configure Target Groups, ALB, and deploy ECS Services with Blue/Green and Rolling Update strategies. | 17/06/2026 | 17/06/2026 | [ECS Blue/Green](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/deployment-type-blue-green.html) |
| 5 | Lab 17 (Part 1): Integrate automated CI/CD with GitLab Runner on EC2 and GitHub Actions. | 18/06/2026 | 18/06/2026 | [GitLab CI](https://docs.gitlab.com/ee/ci/) |
| 6 | Lab 17 (Part 2): Set up AWS CodeBuild, enable Container Insights, and route logs to S3 via Firelens. | 19/06/2026 | 19/06/2026 | [CodeBuild Docs](https://docs.aws.amazon.com/codebuild/latest/userguide/welcome.html) |
| 7 | Lab 18: Enable AWS Security Hub, activate security standards, analyze Security Score, and clean up. | 20/06/2026 | 21/06/2026 | [Security Hub](https://docs.aws.amazon.com/securityhub/latest/userguide/what-is-securityhub.html) |

---

## Weekly Achievements

### 1. Deploy Application to Amazon ECS Fargate (Lab 16)

#### 1.1. Introduction
This lab deployed a multi-tier containerized architecture with independent Frontend and Backend services on Amazon ECS Fargate. Services communicate via AWS Cloud Map (Service Discovery). An Application Load Balancer routes all incoming traffic using **Blue/Green Deployment** for Backend and **Rolling Update** for Frontend.

#### 1.2. Infrastructure Preparation

**VPC & Networking:**
- Created `FCJ-Lab-vpc` (CIDR `10.0.0.0/16`) with Public and Private Subnets across 2 AZs.
- Configured **NAT Gateway** in Public Subnet so Private Subnet containers can pull base images from the internet.

**CodeDeploy IAM Role:**
```bash
aws iam create-role --role-name ECS-CodeDeploy-Role \
  --assume-role-policy-document file://trust-codedeploy.json
aws iam attach-role-policy --role-name ECS-CodeDeploy-Role \
  --policy-arn arn:aws:iam::aws:policy/AWSCodeDeployRoleForECS
```

**Security Groups:**
- `ALB-SG`: Inbound HTTP port 80 from Internet
- `ECS-Frontend-SG`: Traffic from `ALB-SG` only
- `ECS-Backend-SG`: Traffic from Frontend Service and ALB on API port

#### 1.3. Build & Push Docker Images
```bash
# Login to ECR
aws ecr get-login-password --region ap-southeast-1 | \
  docker login --username AWS --password-stdin \
  ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com

# Build and push Backend
docker build -t ecs-backend ./backend
docker tag ecs-backend:latest \
  ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/ecs-backend:latest
docker push ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/ecs-backend:latest
```

#### 1.4. Register Cloud Map Namespace
```bash
aws servicediscovery create-private-dns-namespace \
  --name "j2car.internal" --vpc vpc-XXXXXXXX
```
ECS Tasks locate each other via private DNS (`backend.j2car.internal`) instead of hardcoded IPs.

#### 1.5. Create ECS Cluster
```bash
aws ecs create-cluster \
  --cluster-name J2Car-ECS-Cluster \
  --capacity-providers FARGATE FARGATE_SPOT
```

#### 1.6. Task Definitions

**Backend Task:** 0.25 vCPU / 0.5 GB RAM, ECR Image, Port 5000, `awslogs` → CloudWatch.

**Frontend Task:** 0.25 vCPU / 0.5 GB RAM, ECR/DockerHub Image, Port 80, `API_URL=http://backend.j2car.internal:5000`.

#### 1.7. ALB & Target Groups
- `TG-Backend-Blue` & `TG-Backend-Green`: Port 5000, Target Type IP
- `TG-Frontend`: Port 80, Target Type IP
- Listener Port 80 → Frontend; Port 8080 → Backend-Blue (Port 8081 → Green for testing)

#### 1.8. ECS Services
- **Backend** — Blue/Green via CodeDeploy with Auto Scaling on CPU Utilization
- **Frontend** — Rolling Update (min healthy: 100%, max: 200%)

#### 1.9. Results
- ALB DNS loaded Frontend interface successfully.
- Frontend connected to Backend via Cloud Map internal DNS.
- Triggered dummy code update → Blue/Green transition completed with zero downtime.

---

### 2. CI/CD Automation & Monitoring (Lab 17)

#### 2.1. GitLab CI/CD with Runner on EC2
```bash
# Install and register GitLab Runner
curl -L "https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh" | sudo bash
sudo apt install gitlab-runner -y
sudo gitlab-runner register --url https://gitlab.com --token <TOKEN>
nohup gitlab-runner run > runner.log 2>&1 &
```

**Pipeline `.gitlab-ci.yml`:**
```yaml
stages: [build, push, deploy]

build:
  script: docker build -t $IMAGE_NAME ./backend

push:
  script:
    - aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_URI
    - docker push $ECR_URI/$IMAGE_NAME:$CI_COMMIT_TAG

deploy:
  script:
    - aws ecs update-service --cluster $CLUSTER --service $SERVICE --force-new-deployment
```

#### 2.2. GitHub Actions
- Added Repository Secrets: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`.
- Workflow: push code → build image → push ECR → trigger ECS deployment.

#### 2.3. AWS CodeBuild
- Created `Frontend-Build` and `Backend-Build` projects connected to GitHub.
- Webhook filter: Git tags matching `v*.*.*`.
- Verified build logs and ECR image pushes.

#### 2.4. CloudWatch Container Insights
```bash
aws ecs update-cluster-settings \
  --cluster J2Car-ECS-Cluster \
  --settings name=containerInsights,value=enabled
```
Monitored: CPU, Memory, Network I/O, Running Task Count. Built custom CloudWatch Dashboard.

#### 2.5. Log Routing with AWS Firelens
```bash
aws s3 mb s3://j2car-firelens-logs --region ap-southeast-1
```

Task Definition with Firelens sidecar (Fluent Bit):
```json
{
  "name": "log-router",
  "image": "amazon/aws-for-fluent-bit:stable",
  "firelensConfiguration": { "type": "fluentbit" }
}
```
Main container `logDriver: awsfirelens` targeting S3 bucket. Confirmed logs delivered automatically to S3 by date/hour directory structure.

---

### 3. AWS Security Hub (Lab 18)

#### 3.1. Security Standards
- AWS Foundational Security Best Practices (FSBP)
- CIS AWS Foundations Benchmark v1.2.0 and v1.4.0
- PCI DSS v3.2.1

#### 3.2. Enable Security Hub
```bash
aws securityhub enable-security-hub --enable-default-standards
```

#### 3.3. Security Score Analysis
- Dashboard showed compliance % per enabled standard.
- Findings grouped by severity: **Critical**, **High**, **Medium**, **Low**.
- Example critical findings: S3 Bucket without encryption, EC2 without IMDSv2, Security Group open on port 22 to `0.0.0.0/0`.

---

## Week 9 Summary

Week 9 completed the full cloud-native application development lifecycle: **ECS Fargate containerized deployment**, **multi-platform CI/CD automation** (GitLab/GitHub/CodeBuild), **centralized monitoring and logging** (Container Insights + Firelens), and **comprehensive security auditing** (Security Hub). All skills directly apply to the J2Car AutoParts production architecture.
