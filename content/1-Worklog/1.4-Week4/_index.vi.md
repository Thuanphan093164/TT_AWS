---
title: "Worklog Tuần 4"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 1.4. </b> "
---
 

### Mục tiêu tuần 4

- Tìm hiểu Amazon RDS và ưu thế của dịch vụ quản lý cơ sở dữ liệu so với giải pháp DB chạy trên EC2, DynamoDB và Redshift.
- Thực hành tạo cơ sở hạ tầng mạng an toàn cho RDS: VPC, Security Group và DB Subnet Group.
- Khởi tạo và cấu hình một RDS instance.
- Kết nối ứng dụng Node.js chạy trên EC2 với RDS thông qua endpoint.
- Nắm rõ backup, restore và các tính năng nâng cao như Multi-AZ và Read Replica.

### Các nhiệm vụ triển khai trong tuần này

| Ngày | Công việc | Ngày bắt đầu | Ngày kết thúc |
| --- | ---------------------------------------------------------------------------------------------------------------- | ------------ | ------------- |
| 2 | Tổng quan Amazon RDS và so sánh với EC2 DB, DynamoDB, Redshift | 11/05/2026 | 11/05/2026 |
| 3 | Cấu hình mạng cho RDS: tạo VPC, Security Groups EC2/RDS, DB Subnet Group | 12/05/2026 | 12/05/2026 |
| 4 | Khởi tạo và cấu hình RDS instance | 13/05/2026 | 13/05/2026 |
| 5 | Triển khai ứng dụng trên EC2 và kết nối RDS | 14/05/2026 | 14/05/2026 |
| 6 | Thực hành backup và restore bằng snapshot | 15/05/2026 | 15/05/2026 |
| 7 | Tìm hiểu Multi-AZ và Read Replica; dọn dẹp tài nguyên để tiết kiệm chi phí | 16/05/2026 | 17/05/2026 |

### Kết quả tuần 4

#### Lý thuyết

- Hiểu rõ nguyên lý hoạt động của Amazon RDS và lợi ích của dịch vụ quản lý DB.
- Biết phân biệt RDS với DynamoDB, Redshift và S3 cho từng loại workload.
- Nắm được Multi-AZ, Read Replica và cơ chế backup bằng snapshot.
- Hiểu cách bảo mật dữ liệu RDS bằng Security Group và mã hoá.

#### Thực hành

- Thiết lập được môi trường mạng an toàn cho cơ sở dữ liệu với DB Subnet Group và Security Group.
- Khởi tạo thành công RDS MySQL/MariaDB và giới hạn truy cập từ EC2.
- Kết nối ứng dụng Node.js trên EC2 với RDS thông qua endpoint.
- Thực hiện backup snapshot và restore dữ liệu.
- Dọn dẹp tài nguyên sau lab để tránh phát sinh chi phí không cần thiết.

---

### Triển khai chi tiết - Tuần 4

#### 1. Tổng quan lab

Lab này sử dụng Amazon RDS làm dịch vụ cơ sở dữ liệu quản lý. Quy trình gồm: thiết lập mạng riêng, tạo RDS MySQL/MariaDB, kết nối EC2 với RDS, và thực hành backup/restore.

RDS được đặt trong private subnet; chỉ EC2 được phép truy cập thông qua Security Group.

#### 2. Các bước chuẩn bị

##### 2.1 Tạo VPC

Tạo VPC riêng để chứa cả EC2 và RDS. Đảm bảo DB Subnet Group gồm ít nhất hai Availability Zone.

##### 2.2 Tạo Security Group cho EC2

Tạo nhóm bảo mật cho EC2, cho phép SSH (22) và HTTP/ứng dụng (5000) nếu ứng dụng Node.js có cổng này.

##### 2.3 Tạo Security Group cho RDS

Tạo nhóm bảo mật chỉ cho phép kết nối đến cổng 3306 từ Security Group của EC2.

##### 2.4 Tạo DB Subnet Group

Tạo DB Subnet Group gồm các subnet private ở nhiều AZ, dùng cho RDS để database không trực tiếp public.

#### 3. Tạo EC2 instance

Khởi tạo EC2 để chạy ứng dụng.

Các bước chính:

1. Launch EC2 trong VPC đã tạo.
2. Chọn Amazon Linux 2023 và loại `t2.micro` hoặc `t3.micro`.
3. Tạo/ chọn key pair cho SSH.
4. Gán EC2 Security Group và bật public IP trên subnet công cộng.
5. Kết nối SSH bằng public IP và file `.pem`.

#### 4. Tạo RDS database instance

Khởi tạo RDS bằng chế độ Standard create.

Các bước chính:

1. Chọn engine MySQL hoặc MariaDB.
2. Chọn Free Tier nếu cần tiết kiệm chi phí.
3. Đặt tên instance, username admin và mật khẩu an toàn.
4. Chọn VPC, private subnet group và RDS Security Group.
5. Tắt public access và tạo database.

#### 5. Triển khai ứng dụng và kết nối RDS

##### Cài Git và Node.js trên EC2

```bash
sudo dnf update -y
sudo dnf install git -y
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.nvm/nvm.sh
nvm install --lts
```

##### Triển khai ứng dụng

1. Clone repository của bạn.
2. Cài dependencies:

```bash
npm install express dotenv express-handlebars body-parser mysql
```

3. Tạo `.env`:

```bash
DB_HOST="RDS_ENDPOINT"
DB_NAME="first_cloud_users"
DB_USER="admin"
DB_PASS="YourPassword"
```

##### Khởi tạo dữ liệu RDS

Kết nối từ EC2 đến RDS và chạy SQL:

```sql
CREATE DATABASE IF NOT EXISTS first_cloud_users;
USE first_cloud_users;
CREATE TABLE `user` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `first_name` VARCHAR(45) NOT NULL,
  `last_name` VARCHAR(45) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `phone` VARCHAR(15) NOT NULL,
  `comments` TEXT NOT NULL,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active'
) ENGINE=InnoDB;
```

##### Khởi chạy ứng dụng

```bash
npm start
```

Truy cập ứng dụng tại `http://<EC2-Public-IP>:5000`.

#### 6. Backup và Restore

Sử dụng snapshot RDS để sao lưu và khôi phục.

1. Theo dõi hiệu năng bằng RDS console.
2. Chụp snapshot thủ công.
3. Restore snapshot ra instance mới.

#### 7. Dọn dẹp tài nguyên

Sau lab, xóa tài nguyên để tránh chi phí:

1. Xóa RDS instance.
2. Xóa snapshot.
3. Terminate EC2 instance.
4. Nếu có, release Elastic IP.
5. Xóa VPC và các resource liên quan.



