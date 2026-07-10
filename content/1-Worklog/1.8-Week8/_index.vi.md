---
title: "Worklog Tuần 8"
date: 2024-01-01
weight: 8
chapter: false
pre: " <b> 1.8. </b> "
---

## Mục Tiêu Tuần 8

- Tìm hiểu và thực hành migrate server từ on-premises lên AWS bằng **VM Import/Export**.
- Containerize ứng dụng bằng **Docker** và quản lý bằng **Docker Compose** trên Amazon EC2.
- Kết nối ứng dụng container với **Amazon RDS** và lưu trữ Docker Image trên **Amazon ECR** và Docker Hub.

---

## Kế Hoạch Công Việc

| Thứ | Công việc | Ngày bắt đầu | Ngày hoàn thành | Tài liệu tham khảo |
|---|---|---|---|---|
| 2 | Tìm hiểu VM Import/Export và chuẩn bị môi trường VM cục bộ. | 08/06/2026 | 08/06/2026 | [VM Import Prereqs](https://docs.aws.amazon.com/vm-import/latest/userguide/vmie_prereqs.html) |
| 3 | Upload file VM disk lên S3 và import vào AWS dưới dạng AMI. | 09/06/2026 | 09/06/2026 | [VM Import Image](https://docs.aws.amazon.com/vm-import/latest/userguide/vmimport-image.html) |
| 4 | Cấu hình S3 ACL, export EC2 instance hoặc AMI ngược về S3, dọn dẹp tài nguyên. | 10/06/2026 | 10/06/2026 | [VM Export](https://docs.aws.amazon.com/vm-import/latest/userguide/vmexport.html) |
| 5 | Deploy và test ứng dụng cục bộ; chuẩn bị VPC, Security Group, IAM Role cho ECR và đăng nhập Docker Hub. | 11/06/2026 | 11/06/2026 | [Docker Docs](https://docs.docker.com/) |
| 6 | Tạo DB Subnet Group, khởi chạy RDS instance và cấu hình EC2 làm Docker Host. | 12/06/2026 | 12/06/2026 | [Amazon RDS](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_CreateDBInstance.html) |
| 7 | Build Docker Image, chạy container, cấu hình Docker Compose, push image lên ECR và Docker Hub, dọn dẹp. | 13/06/2026 | 14/06/2026 | [Docker Compose](https://docs.docker.com/compose/) |

---

## Kết Quả Đạt Được

### 1. VM Import/Export (Lab 14)

#### 1.1. Chuẩn Bị VM On-Premises

- Cài đặt VMware Workstation Pro trên máy tính cục bộ.
- Tạo máy ảo Ubuntu Desktop với ổ đĩa ảo 20GB (single-file VMDK).
- Cài đặt và kích hoạt SSH server trên VM để phục vụ quản trị từ xa:

```bash
sudo apt update
sudo apt install openssh-server -y
sudo systemctl enable ssh --now
sudo systemctl status ssh
```

#### 1.2. Import VM Lên AWS

**Bước 1: Export VM từ VMware**
- Tắt (Power Off) máy ảo trong VMware Workstation.
- Dùng **File → Export to OVF…** để xuất VM ra file `.vmdk`.

**Bước 2: Upload file .vmdk lên S3**
- Tạo S3 Bucket tên `vm-import-bucket-lab` với ACL bật và Public Access bị chặn.
- Upload file `ubuntu-disk1.vmdk` lên bucket.

**Bước 3: Tạo IAM Role cho VM Import**

Trust Policy (`trust-policy.json`):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "vmie.amazonaws.com" },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": { "sts:ExternalId": "vmimport" }
      }
    }
  ]
}
```

```bash
aws iam create-role --role-name vmimport \
  --assume-role-policy-document "file://trust-policy.json"

aws iam put-role-policy --role-name vmimport \
  --policy-name vmimport-policy \
  --policy-document "file://role-policy.json"
```

**Bước 4: Khởi chạy Import Task**
```bash
aws ec2 import-image \
  --description "Ubuntu Server Import" \
  --disk-containers "file://containers.json"

# Theo dõi tiến trình
aws ec2 describe-import-image-tasks --import-task-ids import-ami-XXXXXXXX
```

**Bước 5: Khởi chạy EC2 từ AMI vừa import**
- Launch EC2 instance tên `Imported-Server` từ AMI mới với type `t3.micro`.
- Kết nối SSH xác nhận hệ thống hoạt động bình thường:
```bash
ssh ubuntu@<Public_IP>
```

#### 1.3. Export EC2 Về On-Premises

**Cấu hình ACL cho S3 Bucket:**
```bash
aws s3api put-bucket-acl \
  --bucket vm-import-bucket-lab \
  --grant-write "id=c4d8eabf8db69dbe46bfe0e517100c554f01200b104d59cd408e777ba442a322" \
  --grant-read-acp "id=c4d8eabf8db69dbe46bfe0e517100c554f01200b104d59cd408e777ba442a322"
```

**Export EC2 Instance về S3:**
```bash
aws ec2 create-instance-export-task \
  --instance-id i-XXXXXXXX \
  --target-environment vmware \
  --export-to-s3-task \
    DiskImageFormat=vmdk,ContainerFormat=ova,\
    S3Bucket=vm-import-bucket-lab,S3Prefix=exports/
```

**Export AMI về S3:**
```bash
aws ec2 export-image \
  --image-id ami-XXXXXXXX \
  --disk-image-format VMDK \
  --s3-export-location S3Bucket=vm-import-bucket-lab,S3Prefix=exports/
```

#### 1.4. Dọn Dẹp

```bash
aws ec2 terminate-instances --instance-ids i-XXXXXXXX
aws ec2 deregister-image --image-id ami-XXXXXXXX
aws s3 rb s3://vm-import-bucket-lab/ --force
aws iam delete-role-policy --role-name vmimport --policy-name vmimport-policy
aws iam delete-role --role-name vmimport
```

---

### 2. Deploy Ứng Dụng Với Docker, RDS & ECR (Lab 15)

#### 2.1. Giới Thiệu

Bài lab tập trung containerize một ứng dụng fullstack gồm: **React Frontend**, **Express Backend** và **MySQL Database**. Giải pháp sử dụng Docker trên EC2, Docker Compose để điều phối container, Amazon RDS MySQL làm cơ sở dữ liệu managed, và Amazon ECR / Docker Hub làm kho lưu trữ Image.

#### 2.2. Deploy Cục Bộ (Local)

**Kiểm tra công cụ cần thiết:**
```bash
git --version && node -v && npm -v && mysql --version
```

**Clone source code và cài đặt:**
```bash
git clone https://github.com/AWS-First-Cloud-Journey/aws-fcj-container-app.git
cd aws-fcj-container-app
```

- Import database schema từ file `init.sql` vào MySQL cục bộ.
- Tạo file `.env` cho Backend chứa thông tin kết nối DB.
- Khởi chạy Backend và Frontend:
```bash
cd backend && npm install && npm run dev
cd ../frontend && npm install && npm start
```
- Mở trình duyệt tại `http://localhost:3000` để xác nhận ứng dụng hoạt động.

#### 2.3. Chuẩn Bị Hạ Tầng AWS

**Cấu hình VPC:**
- Tạo VPC tên `FCJ-Lab-vpc` với CIDR `10.0.0.0/16`.
- Tạo 1 Public Subnet (cho EC2 web server) và 2 Private Subnets ở 2 AZ khác nhau (cho Amazon RDS Multi-AZ).
- Cấu hình Internet Gateway và Route Table để Public Subnet kết nối được Internet.

**Cấu hình Security Groups:**
- `FCJ-Lab-sg-public`: Cho phép inbound SSH (22), HTTP (80), port 3000, port 5000 từ `0.0.0.0/0`.
- `FCJ-Lab-sg-private`: Chỉ cho phép MySQL (3306) từ Security Group của Public.

**Tạo IAM Role cho ECR:**
- Tạo Role tên `CustomRWECRRole` trusted bởi EC2 service.
- Đính kèm inline policy cho phép read/write lên ECR.

#### 2.4. Khởi Chạy Amazon RDS MySQL

```bash
# Tạo DB Subnet Group
aws rds create-db-subnet-group \
  --db-subnet-group-name "fcj-lab-db-subnet-group" \
  --db-subnet-group-description "Subnet group for J2Car RDS" \
  --subnet-ids subnet-XXXXXXXX subnet-YYYYYYYY

# Khởi chạy RDS instance
aws rds create-db-instance \
  --db-instance-identifier "fcj-lab-rds-mysql" \
  --db-instance-class db.t3.micro \
  --engine mysql \
  --master-username admin \
  --master-user-password "YourSecurePass!" \
  --db-subnet-group-name "fcj-lab-db-subnet-group" \
  --no-publicly-accessible
```

#### 2.5. Cấu Hình EC2 Làm Docker Host

**Cài đặt các công cụ cần thiết:**
```bash
sudo apt update
sudo apt-get install -y \
  docker-ce docker-ce-cli containerd.io \
  docker-buildx-plugin docker-compose-plugin \
  mysql-client unzip
```

**Import schema vào RDS:**
```bash
mysql -h <RDS_ENDPOINT> -u admin -p
source aws-fcj-container-app/database/init.sql;
```

#### 2.6. Deploy Với Docker Image

```bash
# Tạo network riêng cho các container
sudo docker network create app-network

# Build và chạy Backend container
cd backend
sudo docker build . -t backend-image
sudo docker run -d -p 5000:5000 \
  --network app-network \
  --name backend backend-image

# Build và chạy Frontend container
cd ../frontend
sudo docker build . -t frontend-image
sudo docker run -d -p 3000:80 \
  --network app-network \
  --name frontend frontend-image
```

Mở `http://<EC2_PUBLIC_IP>:3000` để xác nhận ứng dụng kết nối được RDS qua Backend API.

#### 2.7. Deploy Với Docker Compose

```bash
# Dừng các container đang chạy độc lập
sudo docker stop backend frontend
sudo docker rm backend frontend

# Khởi chạy toàn bộ stack bằng Docker Compose
sudo docker compose -f docker-compose.app.yml up -d

# Kiểm tra trạng thái các service
sudo docker compose -f docker-compose.app.yml ps
```

#### 2.8. Push Image Lên Registry

**Amazon ECR:**
```bash
# Tạo repositories
aws ecr create-repository --repository-name j2car-backend --region ap-southeast-1
aws ecr create-repository --repository-name j2car-frontend --region ap-southeast-1

# Login ECR
aws ecr get-login-password --region ap-southeast-1 | \
  sudo docker login --username AWS --password-stdin \
  ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com

# Tag và Push
sudo docker tag backend-image:latest \
  ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/j2car-backend:latest
sudo docker push \
  ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/j2car-backend:latest
```

**Docker Hub:**
```bash
sudo docker login
sudo docker tag backend-image:latest YOUR_DOCKERHUB/j2car-backend:latest
sudo docker push YOUR_DOCKERHUB/j2car-backend:latest
```

#### 2.9. Dọn Dẹp Tài Nguyên

```bash
aws rds delete-db-instance \
  --db-instance-identifier "fcj-lab-rds-mysql" \
  --skip-final-snapshot

aws rds delete-db-subnet-group \
  --db-subnet-group-name "fcj-lab-db-subnet-group"

aws ec2 terminate-instances --instance-ids i-XXXXXXXX
```

---

## Tổng Kết Tuần 8

Tuần 8 kết hợp hai chủ đề kỹ thuật quan trọng: **VM Import/Export** cho phép di chuyển workload on-premises lên AWS mà không cần rebuild từ đầu; **Docker + Docker Compose + RDS + ECR** cung cấp nền tảng container hóa ứng dụng hiện đại, phân tách rõ ràng giữa tầng ứng dụng và dữ liệu, sẵn sàng cho môi trường production. Đây là tiền đề trực tiếp để triển khai lên Amazon ECS Fargate ở các tuần tiếp theo.
