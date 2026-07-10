---
title: "Bài 5: Lớp tính toán"
date: 2024-01-01
weight: 5
chapter: false
pre: " <b> 5.5. </b> "
---

## Bài 5: Triển Khai Ứng Dụng & Load Balancer (Compute Layer)

Tôi tiến hành phân phối Backend Node.js của J2Car AutoParts chạy không máy chủ trên **Amazon ECS Fargate** kết hợp với **Application Load Balancer (ALB)** để cân bằng tải và tự động mở rộng (auto scaling).

---

### 1. Khởi Tạo Cấu Hình Application Load Balancer

ALB đóng vai trò tiếp nhận traffic HTTP bên ngoài internet và chuyển tiếp an toàn vào các ECS container chạy ngầm trong phân vùng Private:

```bash
# Tạo Security Group cho ALB (Cho phép nhận cổng 80/443 từ mọi nơi)
ALB_SG_ID=$(aws ec2 create-security-group --group-name J2Car-ALB-SG --description "ALB SG" --vpc-id $VPC_ID --region ap-southeast-1 --query "GroupId" --output text)
aws ec2 authorize-security-group-ingress --group-id $ALB_SG_ID --protocol tcp --port 80 --cidr 0.0.0.0/0 --region ap-southeast-1

# Tạo ALB trên 2 Public Subnets
ALB_ARN=$(aws elbv2 create-load-balancer \
  --name j2car-alb \
  --subnets $PUB_SUB1 $PUB_SUB2 \
  --security-groups $ALB_SG_ID --region ap-southeast-1 --query "LoadBalancers[0].LoadBalancerArn" --output text)

# Tạo Target Group cho ECS (Target type = IP)
TG_ARN=$(aws elbv2 create-target-group \
  --name j2car-tg \
  --protocol HTTP --port 5000 --vpc-id $VPC_ID \
  --target-type ip --region ap-southeast-1 --query "TargetGroups[0].TargetGroupArn" --output text)

# Tạo Listener liên kết cổng 80 của ALB với Target Group
aws elbv2 create-listener \
  --load-balancer-arn $ALB_ARN \
  --protocol HTTP --port 80 \
  --default-actions Type=forward,TargetGroupArn=$TG_ARN --region ap-southeast-1
```

---

### 2. Định Nghĩa ECS Task Definition & Khởi Chạy Service

Tôi đăng ký cấu hình CPU, RAM và đường dẫn Docker Image cho Container Task, sau đó khởi chạy Service trên ECS Fargate:

```bash
# Đăng ký Task Definition từ file JSON
aws ecs register-task-definition --cli-input-json file://j2car-task-def.json --region ap-southeast-1

# Tạo ECS Service chạy Fargate Multi-AZ
aws ecs create-service \
  --cluster J2Car-ECS-Cluster \
  --service-name j2car-backend-service \
  --task-definition j2car-backend-task:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$PRIV_SUB1,$PRIV_SUB2],securityGroups=[$ECS_SG_ID],assignPublicIp=DISABLED}" \
  --load-balancers "targetGroupArn=$TG_ARN,containerName=backend,containerPort=5000" --region ap-southeast-1
```

Hạ tầng tính toán của lớp ứng dụng Backend J2Car AutoParts đã sẵn sàng tiếp nhận yêu cầu từ Load Balancer.
