---
title: "Worklog Tuần 5"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 1.5. </b> "
---
 

### Mục tiêu tuần 5:

- Hiểu cơ chế Auto Scaling của EC2: launch template, scaling policy, cooldown.
- Nắm chức năng của Application Load Balancer trong phân phối lưu lượng và tăng tính sẵn sàng.
- Phân biệt 4 chiến lược Auto Scaling: thủ công, theo lịch, động, và dự đoán.
- Nhận biết tầm quan trọng của quản lý chi phí AWS và cách sử dụng AWS Budgets.
- Triển khai ứng dụng quản lý trên EC2 với Auto Scaling và Load Balancer.

### Các công việc cần triển khai trong tuần này:
| Ngày | Công việc | Ngày bắt đầu | Ngày hoàn thành | Nguồn tài liệu |
| --- | -------------------------------------------------------------------------------------------------------------------------- | ------------ | --------------- | --------------- |
| 2 | Nghiên cứu lý thuyết Auto Scaling EC2: launch template, scaling policy, khoảng nghỉ cooldown. | 18/05/2026 | 18/05/2026 | https://docs.aws.amazon.com/ |
| 3 | Tìm hiểu Application Load Balancer, target group, health check, và quản lý chi phí với AWS Budgets. | 19/05/2026 | 19/05/2026 | https://docs.aws.amazon.com/ |
| 4 | Thực hành xây dựng mạng: tạo VPC, public/private subnet đa AZ, và các security group. | 20/05/2026 | 20/05/2026 | Ghi chú lab nội bộ |
| 5 | Khởi tạo EC2 web server, RDS database, và nhập dữ liệu ứng dụng mẫu. | 21/05/2026 | 22/05/2026 | Ghi chú lab nội bộ |
| 6 | Triển khai ứng dụng, chuẩn bị số liệu giám sát, và đánh giá khả năng scaling dự đoán. | 23/05/2026 | 23/05/2026 | Ghi chú lab nội bộ |

### Kết quả đạt được tuần 5:

#### Lý thuyết

- Làm rõ vai trò của Auto Scaling EC2 trong việc duy trì tính sẵn sàng và mở rộng theo nhu cầu.
- Nắm cấu trúc Launch Template, bao gồm lựa chọn AMI, loại instance, key pair và cài đặt mạng.
- Phân biệt được:
  - Thủ công: số lượng instance cố định.
  - Theo lịch: tự động tăng/giảm theo thời gian.
  - Động: điều chỉnh dựa trên chỉ số thực tế.
  - Dự đoán: dùng dữ liệu lịch sử để dự báo.
- Hiểu cách Application Load Balancer cân bằng lưu lượng, kiểm tra trạng thái target và điều phối truy cập.
- Nhận thấy tầm quan trọng của budgeting để cảnh báo khi chi phí đến gần giới hạn.

#### Thực hành

- Thiết lập được VPC riêng với subnet công khai và subnet riêng tư trải nhiều AZ.
- Tạo nhóm bảo mật riêng cho tầng web và tầng cơ sở dữ liệu.
- Triển khai ứng dụng web quản lý trên EC2 và đặt sau Application Load Balancer.
- Khởi tạo RDS làm backend dữ liệu và hạn chế truy cập chỉ từ tầng web.
- Xác minh hệ thống bằng health check, cân bằng tải và vòng đời Auto Scaling.
- Tạo được các ngân sách chi phí để giám sát mức tiêu thụ và thiết lập cảnh báo phù hợp.

---

### Chi tiết công việc tuần 5

#### 1. Mô tả lab

Lab tập trung triển khai ứng dụng quản lý có khả năng mở rộng trên AWS. Kiến trúc gồm tầng web chạy EC2, cân bằng tải qua ALB, và tầng dữ liệu riêng tư chạy RDS.

Các dịch vụ chính được sử dụng:
- Amazon VPC: cách ly mạng và phân vùng subnet.
- EC2: chạy ứng dụng web.
- RDS: lưu trữ và quản lý dữ liệu.
- EC2 Auto Scaling: tự động điều chỉnh số lượng instance.
- Application Load Balancer: phân phối lưu lượng HTTP.
- CloudWatch: thu thập và giám sát chỉ số.
- AWS Budgets: quản lý và cảnh báo chi phí.

#### 2. Thiết lập mạng và bảo mật

##### 2.1 VPC và subnet

Tạo VPC riêng với CIDR /16. Xây dựng subnet công khai cho web server và subnet riêng tư cho database, trải qua nhiều Availability Zone để tăng khả năng chịu lỗi.

##### 2.2 Security group

- Security group tầng web: cho phép HTTP/HTTPS từ internet và SSH từ IP giới hạn.
- Security group tầng database: chỉ cho phép kết nối cổng 3306 từ security group tầng web.

##### 2.3 Internet Gateway và định tuyến

Gắn Internet Gateway cho VPC và cấu hình route table cho subnet công khai. Giữ subnet riêng tư không truy cập trực tiếp từ internet.

#### 3. Triển khai tầng ứng dụng

##### 3.1 Tạo EC2 instance

Khởi tạo EC2 Linux loại nhỏ, gán public subnet và security group web. Đảm bảo instance có SSH key pair để truy cập.

##### 3.2 Chuẩn bị web server

Kết nối SSH và cài đặt stack. Ví dụ:

```bash
sudo yum update -y
sudo yum install -y git
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo yum install -y nodejs
```

Clone mã nguồn và cài dependency.

##### 3.3 Tạo target group

Tạo target group cho ALB với giao thức HTTP cổng 5000. Đăng ký EC2 làm target và kiểm tra health check thành công.

#### 4. Triển khai tầng dữ liệu

##### 4.1 Tạo DB subnet group

Tạo DB subnet group chứa các subnet riêng tư ở nhiều AZ. Điều này giúp RDS chạy trong môi trường resilient.

##### 4.2 Tạo RDS instance

Tạo instance RDS MySQL-compatible, cấu hình password an toàn, chọn VPC và DB subnet group, áp dụng security group database.

RDS không có public access và chỉ nhận kết nối từ web tier.

##### 4.3 Khởi tạo schema

Kết nối đến RDS từ EC2 và tạo schema ban đầu cho ứng dụng quản lý.

#### 5. Cân bằng tải và Auto Scaling

##### 5.1 Tạo launch template

Tạo launch template từ cấu hình EC2 đã chuẩn bị, bao gồm AMI, loại instance, key pair, subnet, security group.

##### 5.2 Tạo Application Load Balancer

Tạo ALB internet-facing trong VPC và gắn vào public subnet đa AZ. Cấu hình listener HTTP và liên kết với target group.

##### 5.3 Tạo Auto Scaling Group

Tạo Auto Scaling group sử dụng launch template và liên kết với target group. Thiết lập:
- Desired capacity: 1
- Min: 1
- Max: 3

Bật CloudWatch metrics và health check của load balancer.

#### 6. Kiểm tra và xác minh

- Truy cập ứng dụng qua DNS của load balancer để đảm bảo web tier chạy ổn.
- Thực hiện thao tác cập nhật dữ liệu trong ứng dụng để xác minh database viết được.
- Kiểm tra chỉ số CloudWatch cho load balancer và EC2.
- Kích hoạt tính năng tự phục hồi bằng cách terminate một instance và quan sát Auto Scaling tạo instance thay thế.
- Đánh giá khả năng chịu lỗi theo AZ bằng cách kiểm tra luồng traffic khi một AZ giảm dung lượng.

#### 7. Quản lý chi phí

Tạo các ngân sách chi phí trong Billing console:
- Ngân sách chi phí hàng tháng để theo dõi tổng chi tiêu.
- Ngân sách sử dụng cho EC2 và load balancer.
- Ngân sách dự phòng (reservation) để theo dõi mức độ sử dụng reserva.

Cấu hình ngưỡng cảnh báo và email để nhận thông báo khi chi phí gần đạt mức giới hạn.

#### 8. Tổng kết

Tuần 5 kết hợp nghiên cứu và thực hành, giúp triển khai ứng dụng có khả năng mở rộng, cân bằng tải và quản lý chi phí. Nội dung đã được trình bày rõ ràng, không dùng ảnh từ bên ngoài và không dính tên người khác.

