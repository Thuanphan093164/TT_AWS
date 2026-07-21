---
title: "5.2. Thiết lập VPC & Hạ tầng mạng"
date: 2024-01-01
weight: 2
chapter: false
pre: " <b> 5.2. </b> "
---

# Bước 1: Khởi tạo Hạ tầng Mạng & Thiết lập Amazon VPC

Mạng ảo **Amazon VPC (Virtual Private Cloud)** đóng vai trò thiết lập biên giới bảo mật, phân chia vùng truy cập và điều phối luồng dữ liệu đi vào/đi ra hệ thống. Để đạt tính sẵn sàng cao, chúng ta cấu hình VPC trải rộng trên 2 Availability Zones (AZs) và phân chia rõ rệt giữa vùng công cộng (Public) và vùng riêng tư (Private).

---

### Hướng dẫn Thực hành Từng bước

#### 1. Tạo VPC & Subnets Phân Tầng
1. Truy cập vào **AWS Management Console** và tìm dịch vụ **VPC**.
2. Click **Create VPC** và chọn cấu hình **VPC and more** để tự động thiết lập nhanh.
3. Thiết lập thông số cơ bản:
   * **Name tag generation:** `J2Car-Production`
   * **IPv4 CIDR block:** `10.0.0.0/16`
   * **Number of Availability Zones (AZs):** `2` (Chọn `ap-southeast-1a` và `ap-southeast-1b`)
   * **Number of Public Subnets:** `2` (Chứa Load Balancer và NAT Gateway)
   * **Number of Private Subnets:** `6` (Chứa ECS Backend, Cơ sở dữ liệu DocumentDB, Redis và AWS Lambda)
4. Thiết lập dải CIDR cụ thể cho các Subnets để đảm bảo phân vùng bảo mật:
   * **Public Subnet 1 (AZ1):** `10.0.1.0/24` (Chứa ALB, NAT Gateway AZ1)
   * **Public Subnet 2 (AZ2):** `10.0.2.0/24` (Chứa ALB, NAT Gateway AZ2)
   * **Private Subnet 1 (Compute AZ1):** `10.0.3.0/24` (Chứa ECS Backend Task 1)
   * **Private Subnet 2 (Compute AZ2):** `10.0.4.0/24` (Chứa ECS Backend Task 2)
   * **Private Subnet 3 (Data AZ1):** `10.0.5.0/24` (Chứa DocumentDB Primary / Redis Primary)
   * **Private Subnet 4 (Data AZ2):** `10.0.6.0/24` (Chứa DocumentDB Replica / Redis Replica)
   * **Private Subnet 5 (Integration AZ1):** `10.0.7.0/24` (Chứa Lambda Webhook Handler AZ1)
   * **Private Subnet 6 (Integration AZ2):** `10.0.8.0/24` (Chứa Lambda Webhook Handler AZ2)

![Khởi tạo VPC và Subnets phân tầng](/images/5-Workshop/5.2-VPC-Networking/1-vpc.png)
![Phân dải Subnets trong VPC](/images/5-Workshop/5.2-VPC-Networking/2-subnets.png)

#### 2. Định cấu hình Load Balancer & Cổng NAT
* **Application Load Balancer (ALB):** 
  * Được khởi tạo trong **Public Subnets** để đón lưu lượng HTTP/HTTPS từ Internet.
  * Thiết lập **Path Rule** để chuyển hướng yêu cầu thông minh. Ví dụ: Định tuyến đường dẫn `/api/*` trỏ về Backend Target Group trong Private Subnets, còn các đường dẫn khác trỏ về static/CDN.
* **NAT Gateways & Elastic IPs (EIPs):**
  * Tạo **1 NAT Gateway mỗi AZ** (tổng cộng 2 NAT Gateways đi kèm 2 Elastic IPs tĩnh) đặt trong các Public Subnets.
  * Giúp các tài nguyên chạy trong Private Subnets (như Container ECS Backend và AWS Lambda) có khả năng kết nối outbound ra ngoài Internet (ví dụ: gọi API cổng thanh toán ngoài VNPay/MoMo, gửi email SMTP) một cách an toàn mà không cho phép Internet bên ngoài kết nối ngược lại lớp dữ liệu.
* Nhấp **Create VPC** và đợi AWS khởi tạo hạ tầng mạng.

![Cấu hình NAT Gateways hoạt động](/images/5-Workshop/5.2-VPC-Networking/3-nat.png)

---

### Kiểm tra kết quả & Xác thực Định tuyến

1. **Bảng định tuyến (Route Tables):**
   * Truy cập mục **Route Tables** trong VPC Console.
   * Xác nhận **Public Route Table** có bản ghi định tuyến: `0.0.0.0/0 -> igw-xxxx` (Internet Gateway).
   * Xác nhận **Private Route Tables** có bản ghi định tuyến: `0.0.0.0/0 -> nat-xxxx` (NAT Gateway tương ứng với từng AZ).
2. **DNS Resolution:**
   * Hãy đảm bảo thuộc tính **DNS Hostnames** và **DNS Resolution** được bật (Enabled) ở cấu hình VPC để các tài nguyên trong Private Subnet phân giải được các endpoint của AWS DocumentDB và ElastiCache Redis.

![Kiểm tra các Route Tables và Gateways kết nối](/images/5-Workshop/5.2-VPC-Networking/4-endpoints.png)

> [!IMPORTANT]
> Việc cô lập cơ sở dữ liệu và cụm máy chủ Backend trong Private Subnet giúp ngăn chặn hoàn toàn các truy cập trái phép trực tiếp từ Internet vào lớp dữ liệu, thiết lập một chốt chặn bảo mật kiên cố.
