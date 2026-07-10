---
title: "Bài 2: Chuẩn bị môi trường"
date: 2024-01-01
weight: 2
chapter: false
pre: " <b> 5.2. </b> "
---

## Bài 2: Chuẩn bị hạ tầng & Quyền hạn IAM

Để bắt đầu triển khai hệ thống J2Car AutoParts theo đúng thiết kế, tôi tiến hành cấu hình quyền hạn và khởi tạo hạ tầng mạng Multi-AZ.

---

### 1. Phân quyền IAM Policy cho tài khoản Admin

Trước hết, tài khoản IAM cần được phân quyền đầy đủ để khởi chạy các dịch vụ EC2, VPC Endpoints, Route 53, và S3. Tôi áp dụng policy phân quyền Administrator Access để bảo đảm quá trình triển khai diễn ra suôn suốt không bị lỗi phân quyền (Permission Denied).

```bash
aws sts get-caller-identity
# Xác thực tài khoản Admin: 571210199437
```

---

### 2. Triển khai hạ tầng mạng Multi-AZ bằng CloudFormation

Hạ tầng mạng cốt lõi của J2Car (`J2Car-workshop-VPC`) được cấu hình tự động thông qua mã nguồn hạ tầng CloudFormation. Tôi chạy lệnh triển khai stack hạ tầng:

```bash
# Khởi chạy Stack hạ tầng mạng
aws cloudformation create-stack \
  --stack-name J2Car-Workshop-Network \
  --template-body file://j2car-network.yaml \
  --region ap-southeast-1

# Chờ đợi stack hoàn thành
aws cloudformation wait stack-create-complete \
  --stack-name J2Car-Workshop-Network --region ap-southeast-1
```

Sau khoảng 5 phút, CloudFormation Stack báo trạng thái `CREATE_COMPLETE`. Toàn bộ 2 phân vùng Public Subnets và Private Subnets ở hai Availability Zones đã sẵn sàng hoạt động.

---

### 3. Minh Chứng Thực Tế Trên AWS Console

#### 3.1. Danh sách S3 Buckets chứa Frontend & Media (`14-s3.png`):
![S3 Buckets thực tế](/images/5-Workshop/14-s3.png)

#### 3.2. Kho lưu trữ Container Images trên ECR (`11-ecr.png`):
![ECR Repositories thực tế](/images/5-Workshop/11-ecr.png)
