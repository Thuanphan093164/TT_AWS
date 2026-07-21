---
title: "5.5. Đóng gói Docker & ECS Fargate"
date: 2024-01-01
weight: 5
chapter: false
pre: " <b> 5.5. </b> "
---

# Bước 4: Đóng gói Docker & Vận hành Backend trên Amazon ECS Fargate

Lớp ứng dụng chính (Backend API) của J2Car AutoParts được triển khai dưới dạng các Docker Container chạy trên nền tảng **Amazon ECS (Elastic Container Service) với AWS Fargate** - giải pháp Serverless Compute giúp vận hành container mà không cần bận tâm về việc quản lý, cập nhật hệ điều hành cho các máy chủ ảo EC2.

---

### Hướng dẫn Thực hành Từng bước

#### 1. Đóng gói Ứng dụng Backend NodeJS & Đẩy lên Amazon ECR
Để chuẩn bị image Docker chạy trên ECS:
1. Chuẩn bị **Dockerfile** tối ưu hóa kích thước trong thư mục mã nguồn Backend NodeJS:
   ```dockerfile
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   EXPOSE 5000
   CMD ["node", "server.js"]
   ```
2. Mở console **Amazon ECR** (Elastic Container Registry), tạo repository tên là `j2car-backend`.
3. Chạy các lệnh build và push docker image bằng công cụ CLI:
   ```bash
   # Đăng nhập vào Amazon ECR
   aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.ap-southeast-1.amazonaws.com

   # Build image Docker
   docker build -t j2car-backend .

   # Tag và push lên kho lưu trữ ECR
   docker tag j2car-backend:latest <ACCOUNT_ID>.dkr.ecr.ap-southeast-1.amazonaws.com/j2car-backend:latest
   docker push <ACCOUNT_ID>.dkr.ecr.ap-southeast-1.amazonaws.com/j2car-backend:latest
   ```

![Docker Backend Image được đẩy lên ECR thành công](/images/5-Workshop/5.5-ECS-Fargate/11-ecr.png)

#### 2. Thiết lập Application Load Balancer (ALB) Với Sticky Sessions
Để điều phối lượng truy cập HTTP/HTTPS từ người dùng đến các container Backend trong mạng riêng:
1. Truy cập console **EC2**, tại mục **Load Balancing**, chọn **Load Balancers** và click **Create Application Load Balancer**.
2. Thiết lập thông số:
   * **Name:** `j2car-backend-alb`
   * **Scheme:** Internet-facing (đón traffic từ internet).
   * **VPC:** `J2Car-Production-VPC`
   * **Mappings:** Chọn 2 Public Subnet thuộc 2 AZ khác nhau (`10.0.1.0/24` và `10.0.2.0/24`).
3. Khởi tạo **Target Group** cho ALB:
   * **Target Type:** IP (bắt buộc khi liên kết với ECS Fargate).
   * **Port:** `5000` (cổng lắng nghe của NodeJS container).
   * **Health Check Path:** `/api/health` hoặc `/` (để kiểm tra trạng thái hoạt động của container).
   * **Attributes (Thuộc tính duy trì phiên):** Bật thuộc tính **Sticky Sessions** (App-cookie hoặc Load Balancer Generated Cookie) để đảm bảo các kết nối nâng cấp giao thức WebSocket của Socket.io luôn giữ bắt tay ổn định với đúng 1 task container nhất định.

![Cấu hình Application Load Balancer (ALB) Sticky Sessions](/images/5-Workshop/5.5-ECS-Fargate/12-alb.png)

#### 3. Tạo ECS Task Definition & Triển khai ECS Service
1. Truy cập console **Amazon ECS**, click **Task Definitions** -> **Create new Task Definition**.
2. Cấu hình các thông số Task:
   * **Family name:** `j2car-backend-task`
   * **Launch Type:** AWS Fargate.
   * **Task Size:** CPU `0.5 vCPU`, Memory `1 GB` (tối ưu hóa tài nguyên lab).
   * **Container Image URI:** Đường dẫn image ECR vừa đẩy ở Bước 1.
   * **Port mappings:** Container port `5000`.
   * **Secrets Integration:** Thay vì nhập trực tiếp (hard-code) các tham số nhạy cảm như `MONGO_URI` hay `JWT_SECRET` trong biến môi trường, chúng ta cấu hình Task Definition tham chiếu động (Reference) đến các secret key lưu trong **AWS Secrets Manager** lúc khởi chạy.
3. Tạo một **ECS Cluster** tên là `j2car-production-cluster`.
4. Tạo **ECS Service** để quản lý các task:
   * **Service Name:** `j2car-backend-service`
   * **Desired tasks:** `2` (chạy song song 2 task trên 2 Availability Zones khác nhau để chịu lỗi vật lý cao).
   * **Subnets:** Chọn Private Subnet 1 và Private Subnet 2 (vùng Compute).
   * **Load Balancing:** Chọn ALB và Target Group đã tạo ở trên.

![Các container Backend chạy ở trạng thái RUNNING trên ECS Fargate](/images/5-Workshop/5.5-ECS-Fargate/13-ecs.png)

---

### Khả năng Tự phục hồi (Self-Healing) & Rolling Update
* **Self-Healing (Tự sửa lỗi):** Khi một container backend bị crash hoặc phản hồi không lành mạnh (failed Health Check), ECS Service sẽ tự động chấm dứt container đó và khởi chạy một container mới thay thế để duy trì mong muốn `desired tasks = 2`.
* **Rolling Update:** Khi triển khai phiên bản code mới, ECS Service phối hợp với ALB để khởi động các container mới trước, kiểm tra sức khỏe đạt yêu cầu, rồi mới ngắt kết nối với các container cũ. Quá trình này giúp nâng cấp code mượt mà mà không gây gián đoạn hệ thống.

---

### Kiểm tra kết quả
* Truy cập ECS Cluster, xác nhận có 2 Task đang ở trạng thái **RUNNING**.
* Lấy địa chỉ DNS của ALB, truy cập trên trình duyệt web tại đường dẫn `/api/health` và xác nhận API phản hồi thành công.
