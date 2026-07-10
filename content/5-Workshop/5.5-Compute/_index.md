---
title: "Step 5: Compute Layer"
date: 2024-01-01
weight: 5
chapter: false
pre: " <b> 5.5. </b> "
---

## Step 5: Load Balancer & Application Service Deployment (Compute Layer)

To host the backend API of the J2Car AutoParts platform in a serverless, highly scalable manner, I deployed the Node.js application containers inside **Amazon ECS Fargate** behind an **Application Load Balancer (ALB)**.

---

### 1. Provision Application Load Balancer

The ALB acts as the ingress controller, accepting external HTTP requests and proxying them to ECS tasks:

```bash
# Create Security Group for ALB (Allows port 80 globally)
ALB_SG_ID=$(aws ec2 create-security-group --group-name J2Car-ALB-SG --description "ALB SG" --vpc-id $VPC_ID --region ap-southeast-1 --query "GroupId" --output text)
aws ec2 authorize-security-group-ingress --group-id $ALB_SG_ID --protocol tcp --port 80 --cidr 0.0.0.0/0 --region ap-southeast-1

# Launch ALB on Public Subnets
ALB_ARN=$(aws elbv2 create-load-balancer \
  --name j2car-alb \
  --subnets $PUB_SUB1 $PUB_SUB2 \
  --security-groups $ALB_SG_ID --region ap-southeast-1 --query "LoadBalancers[0].LoadBalancerArn" --output text)

# Create Target Group (Target Type must be IP for Fargate)
TG_ARN=$(aws elbv2 create-target-group \
  --name j2car-tg \
  --protocol HTTP --port 5000 --vpc-id $VPC_ID \
  --target-type ip --region ap-southeast-1 --query "TargetGroups[0].TargetGroupArn" --output text)

# Map port 80 listener to target group routing
aws elbv2 create-listener \
  --load-balancer-arn $ALB_ARN \
  --protocol HTTP --port 80 \
  --default-actions Type=forward,TargetGroupArn=$TG_ARN --region ap-southeast-1
```

---

### 2. Register Task Definitions & Run ECS Service

I registered the container template definitions containing environment pointers, and started the Fargate service:

```bash
# Register Task Definition from file
aws ecs register-task-definition --cli-input-json file://j2car-task-def.json --region ap-southeast-1

# Deploy Multi-AZ ECS Service
aws ecs create-service \
  --cluster J2Car-ECS-Cluster \
  --service-name j2car-backend-service \
  --task-definition j2car-backend-task:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$PRIV_SUB1,$PRIV_SUB2],securityGroups=[$ECS_SG_ID],assignPublicIp=DISABLED}" \
  --load-balancers "targetGroupArn=$TG_ARN,containerName=backend,containerPort=5000" --region ap-southeast-1
```
