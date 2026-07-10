---
title: "Worklog Tuần 9"
date: 2024-01-01
weight: 9
chapter: false
pre: " <b> 1.9. </b> "
---

## Mục Tiêu Tuần 9

- Triển khai ứng dụng container hóa lên **Amazon ECS Fargate** với cân bằng tải ALB và Service Discovery qua Cloud Map.
- Xây dựng pipeline CI/CD tự động bằng **GitLab CI/CD**, **GitHub Actions** và **AWS CodeBuild**.
- Giám sát container bằng **CloudWatch Container Insights** và định tuyến log bằng **AWS Firelens**.
- Đánh giá bảo mật toàn diện với **AWS Security Hub**.

---

## Kế Hoạch Công Việc

| Thứ | Công việc | Ngày bắt đầu | Ngày hoàn thành | Tài liệu tham khảo |
|---|---|---|---|---|
| 2 | Nghiên cứu Amazon ECS, Fargate, Task Definition và cách vận hành ECS Cluster. | 15/06/2026 | 15/06/2026 | [ECS Docs](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html) |
| 3 | Lab 16 (Phần 1): Cấu hình VPC, Subnet, NAT Gateway, Security Group và push Docker Image lên ECR. | 16/06/2026 | 16/06/2026 | [ECR Docs](https://docs.aws.amazon.com/AmazonECR/latest/userguide/what-is-ecr.html) |
| 4 | Lab 16 (Phần 2): Tạo ECS Cluster, Task Definition cho Frontend/Backend, cấu hình Target Group, ALB và triển khai ECS Service với chiến lược Blue/Green và Rolling Update. | 17/06/2026 | 17/06/2026 | [ECS Blue/Green](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/deployment-type-blue-green.html) |
| 5 | Lab 17 (Phần 1): Tích hợp CI/CD tự động với GitLab Runner trên EC2 và GitHub Actions. | 18/06/2026 | 18/06/2026 | [GitLab CI](https://docs.gitlab.com/ee/ci/) |
| 6 | Lab 17 (Phần 2): Thiết lập AWS CodeBuild, bật Container Insights và định tuyến log sang S3 qua Firelens. | 19/06/2026 | 19/06/2026 | [CodeBuild Docs](https://docs.aws.amazon.com/codebuild/latest/userguide/welcome.html) |
| 7 | Lab 18: Bật AWS Security Hub, kích hoạt Security Standard, phân tích Security Score và dọn dẹp. | 20/06/2026 | 21/06/2026 | [Security Hub](https://docs.aws.amazon.com/securityhub/latest/userguide/what-is-securityhub.html) |

---

## Kết Quả Đạt Được

### 1. Triển Khai Ứng Dụng Lên Amazon ECS Fargate (Lab 16)

#### 1.1. Giới Thiệu

Bài lab triển khai kiến trúc container hóa đa tầng gồm Frontend và Backend lên Amazon ECS Fargate. Hai service giao tiếp với nhau qua AWS Cloud Map (Service Discovery). Application Load Balancer điều phối toàn bộ traffic đến, sử dụng chiến lược **Blue/Green Deployment** cho Backend và **Rolling Update** cho Frontend.

#### 1.2. Chuẩn Bị Hạ Tầng

**Cấu hình VPC & Networking:**
- Tạo VPC `FCJ-Lab-vpc` với CIDR `10.0.0.0/16`.
- Chia Public Subnet và Private Subnet trải rộng trên 2 AZ cho tính sẵn sàng cao.
- Cấu hình **NAT Gateway** trong Public Subnet để container trong Private Subnet có thể pull base image từ internet.

**Tạo IAM Role cho CodeDeploy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "codedeploy.amazonaws.com" },
    "Action": "sts:AssumeRole"
  }]
}
```
```bash
aws iam create-role --role-name ECS-CodeDeploy-Role \
  --assume-role-policy-document file://trust-codedeploy.json

aws iam attach-role-policy --role-name ECS-CodeDeploy-Role \
  --policy-arn arn:aws:iam::aws:policy/AWSCodeDeployRoleForECS
```

**Cấu hình Security Groups:**
- `ALB-SG`: Inbound HTTP port 80 từ Internet.
- `ECS-Frontend-SG`: Chỉ nhận traffic từ `ALB-SG`.
- `ECS-Backend-SG`: Nhận traffic từ Frontend Service và ALB trên port API.

#### 1.3. Build & Push Docker Image

**Lên Amazon ECR:**
```bash
# Login ECR
aws ecr get-login-password --region ap-southeast-1 | \
  docker login --username AWS --password-stdin \
  ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com

# Build và Push Backend
docker build -t ecs-backend ./backend
docker tag ecs-backend:latest \
  ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/ecs-backend:latest
docker push ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/ecs-backend:latest

# Build và Push Frontend
docker build -t ecs-frontend ./frontend
docker tag ecs-frontend:latest \
  ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/ecs-frontend:latest
docker push ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/ecs-frontend:latest
```

#### 1.4. Đăng Ký Namespace Trên Cloud Map

```bash
aws servicediscovery create-private-dns-namespace \
  --name "j2car.internal" \
  --vpc vpc-XXXXXXXX
```

ECS Task có thể tìm thấy nhau qua private DNS name (`backend.j2car.internal`) thay vì hardcode IP — giải quyết vấn đề địa chỉ IP thay đổi mỗi khi container restart.

#### 1.5. Tạo ECS Cluster

```bash
aws ecs create-cluster \
  --cluster-name J2Car-ECS-Cluster \
  --capacity-providers FARGATE FARGATE_SPOT
```

#### 1.6. Cấu Hình Task Definition

**Backend Task Definition:**
- Launch Type: Fargate
- CPU: 0.25 vCPU | Memory: 0.5 GB
- Container Image: ECR Backend URI
- Port Mapping: 5000
- Log Driver: `awslogs` → CloudWatch Logs

**Frontend Task Definition:**
- Launch Type: Fargate
- CPU: 0.25 vCPU | Memory: 0.5 GB
- Container Image: ECR/DockerHub Frontend URI
- Port Mapping: 80
- Environment Variable: `API_URL=http://backend.j2car.internal:5000`

#### 1.7. Cấu Hình Application Load Balancer

**Tạo Target Groups:**
- `TG-Backend-Blue`: Port 5000, Target Type IP
- `TG-Backend-Green`: Port 5000, Target Type IP (dùng cho Blue/Green)
- `TG-Frontend`: Port 80, Target Type IP

**Cấu hình Listener:**
- Port 80 → `TG-Frontend`
- Port 8080 → `TG-Backend-Blue` (test: port 8081 → `TG-Backend-Green`)

#### 1.8. Tạo ECS Service

**Backend — Blue/Green Deployment:**
```bash
aws ecs create-service \
  --cluster J2Car-ECS-Cluster \
  --service-name backend-service \
  --task-definition backend-task:1 \
  --desired-count 2 \
  --deployment-controller type=CODE_DEPLOY \
  --load-balancers targetGroupArn=arn:...:TG-Backend-Blue,...
```

**Frontend — Rolling Update:**
```bash
aws ecs create-service \
  --cluster J2Car-ECS-Cluster \
  --service-name frontend-service \
  --task-definition frontend-task:1 \
  --desired-count 2 \
  --deployment-configuration \
    minimumHealthyPercent=100,maximumPercent=200
```

#### 1.9. Kiểm Tra Kết Quả

- Mở ALB DNS name trong trình duyệt → Frontend hiển thị đúng giao diện.
- Frontend kết nối được Backend qua DNS nội bộ Cloud Map.
- Thực hiện dummy code update → Xác nhận Blue/Green Deployment chuyển traffic mượt mà, không có downtime.

---

### 2. Tự Động Hóa CI/CD & Giám Sát (Lab 17)

#### 2.1. CI/CD Với GitLab Runner Trên EC2

**Cài đặt và đăng ký GitLab Runner:**
```bash
# Cài GitLab Runner
curl -L "https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh" | sudo bash
sudo apt install gitlab-runner -y

# Đăng ký Runner với GitLab project
sudo gitlab-runner register \
  --url https://gitlab.com \
  --token <REGISTRATION_TOKEN>

# Chạy nền
nohup gitlab-runner run > runner.log 2>&1 &
```

**Cấu hình IAM Role cho Runner EC2:**
- Tạo IAM Role `ECS-GitLabRunner-Role` với quyền: ECR push/pull, ECS update service, CodeDeploy create deployment.
- Gắn Role vào EC2 Instance Profile của máy chạy GitLab Runner.

**File `.gitlab-ci.yml` (cấu trúc pipeline):**
```yaml
stages:
  - build
  - push
  - deploy

build:
  stage: build
  script:
    - docker build -t $IMAGE_NAME ./backend

push:
  stage: push
  script:
    - aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_URI
    - docker tag $IMAGE_NAME:latest $ECR_URI/$IMAGE_NAME:$CI_COMMIT_TAG
    - docker push $ECR_URI/$IMAGE_NAME:$CI_COMMIT_TAG

deploy:
  stage: deploy
  script:
    - aws ecs update-service --cluster $CLUSTER --service $SERVICE --force-new-deployment
```

- Tạo và push Git Tag → Pipeline tự động kích hoạt → ECS Service được cập nhật phiên bản mới.

#### 2.2. CI/CD Với GitHub Actions

- Tạo GitHub repository và push source code.
- Thêm Repository Secrets: `AWS_ACCESS_KEY_ID` và `AWS_SECRET_ACCESS_KEY`.
- Workflow tự động: push code → build image → push ECR → trigger ECS deployment.
- Theo dõi kết quả trong tab **Actions** của GitHub.

#### 2.3. CI/CD Với AWS CodeBuild

- Kết nối CodeBuild trực tiếp với GitHub Repository.
- Tạo 2 Build Project: `Frontend-Build` và `Backend-Build`.
- Cấu hình Webhook filter trigger khi có Git Tag khớp pattern `v*.*.*`.
- Xem Build Logs và xác nhận Docker Image được push thành công lên ECR.

#### 2.4. Giám Sát Với CloudWatch Container Insights

- Bật **Container Insights** cho ECS Cluster:
```bash
aws ecs update-cluster-settings \
  --cluster J2Car-ECS-Cluster \
  --settings name=containerInsights,value=enabled
```
- Theo dõi real-time: CPU utilization, Memory usage, Network I/O, Running Task Count.
- Tạo CloudWatch Dashboard tùy chỉnh tổng hợp tất cả metrics ECS vào một màn hình.

#### 2.5. Định Tuyến Log Với AWS Firelens

**Tạo S3 Bucket lưu log:**
```bash
aws s3 mb s3://j2car-firelens-logs --region ap-southeast-1
```

**Cấu hình Task Definition với Firelens sidecar:**
```json
{
  "name": "log-router",
  "image": "amazon/aws-for-fluent-bit:stable",
  "essential": true,
  "firelensConfiguration": {
    "type": "fluentbit"
  }
}
```

Container chính dùng `logConfiguration`:
```json
{
  "logDriver": "awsfirelens",
  "options": {
    "Name": "s3",
    "region": "ap-southeast-1",
    "bucket": "j2car-firelens-logs",
    "total_file_size": "1M"
  }
}
```

- Xác nhận log được ghi tự động vào S3 bucket theo cấu trúc thư mục theo ngày/giờ.

---

### 3. Đánh Giá Bảo Mật Với AWS Security Hub (Lab 18)

#### 3.1. Các Tiêu Chuẩn Bảo Mật

AWS Security Hub kiểm tra tài nguyên theo các tiêu chuẩn quốc tế:
- **AWS Foundational Security Best Practices (FSBP)**
- **CIS AWS Foundations Benchmark v1.2.0 và v1.4.0**
- **PCI DSS v3.2.1**

#### 3.2. Bật AWS Config & Security Hub

```bash
# Bật AWS Config Recorder
aws configservice put-configuration-recorder \
  --configuration-recorder name=default,roleARN=arn:aws:iam::ACCOUNT_ID:role/config-role

# Bật Security Hub
aws securityhub enable-security-hub \
  --enable-default-standards
```

#### 3.3. Phân Tích Security Score

- Dashboard hiển thị phần trăm tuân thủ theo từng tiêu chuẩn đã bật.
- Findings được phân loại theo mức độ: **Critical**, **High**, **Medium**, **Low**.
- Các control không phù hợp với mô hình rủi ro của dự án có thể tắt riêng lẻ.

**Ví dụ một số findings quan trọng:**
- EC2 instance không có IMDSv2 bắt buộc → **High**
- S3 Bucket không bật encryption → **Critical**
- Security Group mở port 22 từ `0.0.0.0/0` → **High**
- CloudTrail chưa bật multi-region → **Medium**

#### 3.4. Dọn Dẹp

```bash
aws securityhub disable-security-hub
aws configservice stop-configuration-recorder --configuration-recorder-name default
aws s3 rb s3://config-delivery-bucket/ --force
```

---

## Tổng Kết Tuần 9

Tuần 9 hoàn thiện vòng đời phát triển ứng dụng cloud-native hiện đại: từ **container hóa và triển khai ECS Fargate**, đến **tự động hóa CI/CD đa nền tảng** (GitLab/GitHub/CodeBuild), tiếp đến **giám sát và log tập trung** (Container Insights + Firelens), và cuối cùng là **đánh giá bảo mật toàn diện** (Security Hub). Tuần này trực tiếp áp dụng cho kiến trúc J2Car AutoParts đang được xây dựng.
