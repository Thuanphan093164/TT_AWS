---
title: "Bài 4: Lớp dữ liệu"
date: 2024-01-01
weight: 4
chapter: false
pre: " <b> 5.4. </b> "
---

## Bài 4: Khởi Tạo Cơ Sở Dữ Liệu & Caching (Data Layer)

Để quản lý giỏ hàng, thông tin sản phẩm và lưu trữ phiên truy cập thời gian thực cho J2Car AutoParts, tôi triển khai **Amazon DocumentDB** (MongoDB tương thích) và **Amazon ElastiCache Redis** trong phân vùng Private bảo mật.

---

### 1. Tạo Security Groups Cho Lớp Dữ Liệu

Tôi cấu hình nhóm bảo mật theo kiểu chaining (chỉ nhận traffic từ ECS Security Group để ngăn ngừa truy cập trực tiếp trái phép từ internet):

```bash
# Lấy VPC ID từ stack mạng
VPC_ID=$(aws cloudformation describe-stacks \
  --stack-name J2Car-Workshop-Network --region ap-southeast-1 \
  --query "Stacks[0].Outputs[?OutputKey==`VpcId`].OutputValue" --output text)

# Tạo Security Group cho DocumentDB và Redis
DOCDB_SG_ID=$(aws ec2 create-security-group --group-name J2Car-DocDB-SG --description "DocumentDB SG" --vpc-id $VPC_ID --region ap-southeast-1 --query "GroupId" --output text)
REDIS_SG_ID=$(aws ec2 create-security-group --group-name J2Car-Redis-SG --description "Redis SG" --vpc-id $VPC_ID --region ap-southeast-1 --query "GroupId" --output text)

# Gán quyền Ingress từ Security Group của ứng dụng ECS (ECS_SG_ID)
aws ec2 authorize-security-group-ingress --group-id $DOCDB_SG_ID --protocol tcp --port 27017 --source-group $ECS_SG_ID --region ap-southeast-1
aws ec2 authorize-security-group-ingress --group-id $REDIS_SG_ID --protocol tcp --port 6379 --source-group $ECS_SG_ID --region ap-southeast-1
```

---

### 2. Triển Khai Cluster Dữ Liệu Multi-AZ

Tôi định nghĩa DB Subnet Groups liên kết các Private Subnets ở 2 vùng khả dụng (ap-southeast-1a và ap-southeast-1b) để cấu hình dự phòng Multi-AZ Failover tự động:

```bash
# Tạo Subnet Group cho DocumentDB và Redis
aws docdb create-db-subnet-group --db-subnet-group-name j2car-docdb-subnet-group --db-subnet-group-description "DocDB Subnets" --subnet-ids $SUB1 $SUB2 --region ap-southeast-1
aws elasticache create-cache-subnet-group --cache-subnet-group-name j2car-redis-subnet-group --cache-subnet-group-description "Redis Subnets" --subnet-ids $SUB1 $SUB2 --region ap-southeast-1

# Khởi chạy DocumentDB Cluster (1 Primary + 1 Replica)
aws docdb create-db-cluster --db-cluster-identifier j2car-docdb-cluster --engine docdb --master-username dbadmin --master-user-password "SecurePassWord123" --vpc-security-group-ids $DOCDB_SG_ID --db-subnet-group-name j2car-docdb-subnet-group --region ap-southeast-1
aws docdb create-db-instance --db-cluster-identifier j2car-docdb-cluster --db-instance-class db.t3.medium --db-instance-identifier j2car-docdb-instance-1 --engine docdb --region ap-southeast-1

# Khởi chạy Redis Replication Group Multi-AZ
aws elasticache create-replication-group --replication-group-id j2car-redis-group --replication-group-description "Redis Cluster" --num-cache-clusters 2 --cache-node-type cache.t3.micro --engine redis --cache-subnet-group-name j2car-redis-subnet-group --security-group-ids $REDIS_SG_ID --multi-az-enabled --region ap-southeast-1
```

---

### 3. Minh Chứng Triển Khai Trên AWS Console

Sau khi clusters chuyển sang trạng thái sẵn sàng (`available`), tôi lưu lại giao diện quản trị thực tế:

#### 3.1. AWS DocumentDB Clusters Hoạt Động (`5-docdb.png`)
![DocumentDB thực tế](/images/5-Workshop/5-docdb.png)

#### 3.2. Clusters Amazon ElastiCache Redis Sẵn Sàng (`6-redis.png`)
![Redis thực tế](/images/5-Workshop/6-redis.png)
