---
title: "5.5. Docker Packaging & ECS Fargate"
date: 2024-01-01
weight: 5
chapter: false
pre: " <b> 5.5. </b> "
---

# Step 4: Docker Packaging & Deploying to Amazon ECS Fargate

The main backend API application of J2Car AutoParts is packaged into Docker containers and run on **Amazon ECS (Elastic Container Service) with AWS Fargate**. Fargate is a serverless compute engine that executes containers without the operational overhead of provisioning, patching, or scaling virtual servers (EC2).

---

### Step-by-Step Practical Lab

#### 1. Package Backend Source Code and Push to Amazon ECR
To package and store our Docker image:
1. Prepare a production-optimized **Dockerfile** in the NodeJS backend directory:
   ```dockerfile
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   EXPOSE 5000
   CMD ["node", "server.js"]
   ```
2. Open the **Amazon ECR** console and click **Create repository** named `j2car-backend`.
3. Use the CLI commands to build and push the container:
   ```bash
   # Log in to ECR Registry
   aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.ap-southeast-1.amazonaws.com

   # Build the container image
   docker build -t j2car-backend .

   # Tag and upload to ECR
   docker tag j2car-backend:latest <ACCOUNT_ID>.dkr.ecr.ap-southeast-1.amazonaws.com/j2car-backend:latest
   docker push <ACCOUNT_ID>.dkr.ecr.ap-southeast-1.amazonaws.com/j2car-backend:latest
   ```

![Backend Container Image Uploaded to ECR](/images/5-Workshop/5.5-ECS-Fargate/11-ecr.png)

#### 2. Provision Application Load Balancer (ALB) with Sticky Sessions
To route client HTTP/HTTPS requests from public networks to backend containers in the private network:
1. Navigate to the **EC2 console**, select **Load Balancers** under Load Balancing, and click **Create Load Balancer** (select Application Load Balancer).
2. Apply configurations:
   * **Name:** `j2car-backend-alb`
   * **Scheme:** Internet-facing.
   * **VPC:** Target `J2Car-Production-VPC`.
   * **Mappings:** Select the 2 Public Subnets in different Availability Zones (`10.0.1.0/24` and `10.0.2.0/24`).
3. Setup the **Target Group** for the load balancer:
   * **Target Type:** IP (required for Fargate tasks).
   * **Port:** `5000` (NodeJS application port).
   * **Health Check Path:** `/api/health` or `/` (checks container responsiveness).
   * **Attributes:** Enable **Sticky Sessions** (App-cookie or Load Balancer Generated Cookie) to ensure client Socket.io real-time WebSocket connections stay pinned to a single container during the connection lifetime.

![Application Load Balancer Sticky Sessions Attributes](/images/5-Workshop/5.5-ECS-Fargate/12-alb.png)

#### 3. Define ECS Task Definition & Deploy ECS Service
1. Open the **Amazon ECS** console, go to **Task Definitions** and click **Create new Task Definition**.
2. Apply Task specifications:
   * **Family name:** `j2car-backend-task`
   * **Launch Type:** AWS Fargate.
   * **Task Size:** CPU `0.5 vCPU`, Memory `1 GB` (cost-efficient configuration).
   * **Container Image URI:** The ECR image link from Step 1.
   * **Port mappings:** Container port `5000`.
   * **Secrets Reference:** Instead of hard-coding database credentials (`MONGO_URI`) or JWT secrets (`JWT_SECRET`) in environment variables, configure the task definition to fetch keys dynamically from **AWS Secrets Manager** upon initialization.
3. Create an **ECS Cluster** named `j2car-production-cluster`.
4. Deploy the **ECS Service** to manage the task instances:
   * **Service Name:** `j2car-backend-service`
   * **Desired tasks:** `2` (runs 2 tasks across 2 separate AZs to prevent physical zone outages).
   * **Subnets:** Select Private Subnet 1 and Private Subnet 2 (Compute zone).
   * **Load Balancing:** Link it to the ALB and Target Group created in the previous step.

![Active Backend ECS Tasks Running on Fargate](/images/5-Workshop/5.5-ECS-Fargate/13-ecs.png)

---

### Compute Tier Resiliency: Self-Healing & Rolling Updates
* **Self-Healing:** If a task container encounters an unrecoverable crash or fails load balancer health checks, the ECS service automatically terminates it and launches a fresh container instance to keep the desired task count at `2`.
* **Zero-Downtime Rolling Updates:** When releasing updates, the ECS service deploys new containers first. Once health checks verify they are healthy, ALB shifts traffic from old containers to the new ones before terminating the old tasks, ensuring zero downtime.

---

### Verification
* Access your ECS Cluster and confirm that 2 tasks are running with a **RUNNING** status.
* Fetch the DNS URL of your ALB and open it in a browser at `/api/health` to confirm the NodeJS API serves requests.
