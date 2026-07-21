---
title: "5.1. Giới thiệu & Kiến trúc AWS"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 5.1. </b> "
---

# Giới thiệu & Phân tích Kiến trúc AWS - Dự án J2Car AutoParts

### 1. Giới thiệu Ứng dụng J2Car AutoParts
**J2Car AutoParts** là một nền tảng thương mại điện tử chuyên nghiệp cung cấp phụ tùng ô tô cao cấp. Hệ thống sử dụng **kiến trúc phân tầng (N-tier architecture)** kết hợp dịch vụ **Container hóa (ECS Fargate)** và **Serverless (SQS + Lambda)** nhằm tối ưu hiệu năng, độ bảo mật và khả năng mở rộng tự động.

Hệ thống tích hợp các tính năng nghiệp vụ hiện đại bao gồm:
* **Trang mua sắm đa năng (Shop/Catalog):** Tìm kiếm và bộ lọc nâng cao theo hãng xe, khoảng giá, danh mục phụ tùng.
* **Sơ đồ xe tương tác (Interactive Schematics):** Cho phép tương tác trực quan trên bản vẽ linh kiện để tìm sản phẩm nhanh.
* **Tìm kiếm thông minh bằng hình ảnh (AI Scan Image):** Đăng ảnh phụ tùng bị hỏng để hệ thống tự động nhận diện và gợi ý sản phẩm thay thế.
* **Real-time Chat Support:** Kết nối khách hàng trực tiếp với admin thông qua Socket.io thời gian thực.
* **Cổng thanh toán:** Tích hợp VNPay, MoMo, xử lý Webhook/IPN phản hồi trạng thái thanh toán.

---

### 2. Sơ đồ Kiến trúc Hệ thống
Hạ tầng của dự án được triển khai trên nền tảng AWS nhằm tuân thủ nguyên tắc thiết kế tốt nhất (AWS Well-Architected Framework):

![Kiến trúc AWS J2Car AutoParts](/images/5-Workshop/architecture.png)

---

### 3. Chi tiết 6 Lớp Kiến trúc (Architectural Layers)

#### 3.1. Lớp Mạng và Định tuyến (Network & Routing Layer)
* **Amazon VPC (Virtual Private Cloud):** Thiết lập mạng nội bộ ảo độc lập. VPC được chia thành **Public Subnets** (chứa Application Load Balancer, NAT Gateway) và **Private Subnets** (chứa ECS Backend, Databases, Redis, Lambda) để cô lập hoàn toàn lớp dữ liệu và ứng dụng khỏi Internet.
* **Application Load Balancer (ALB):** Tiếp nhận lưu lượng HTTP/HTTPS từ người dùng ở Public Subnet và phân phối tải đều đến các container Backend trong Private Subnets theo các **Path Rule** (ví dụ: `/api/*` trỏ về Backend Target Group).
* **NAT Gateway & Elastic IP (EIP):** Cho phép các tài nguyên chạy trong Private Subnets (như ECS Backend, Lambda) kết nối outbound ra ngoài Internet (ví dụ: gọi API thanh toán VNPay/MoMo, gửi mail qua SMTP) nhưng ngăn chặn hoàn toàn kết nối inbound ngược lại từ bên ngoài.

#### 3.2. Lớp Tính toán và Ứng dụng (Compute Layer)
* **Amazon ECS (Elastic Container Service) với AWS Fargate:** Vận hành các Container Docker chứa mã nguồn NodeJS Backend dưới dạng Serverless Compute. Chúng ta không cần quản lý, bảo trì hệ điều hành hay máy chủ EC2. ECS có tính năng **self-healing** (tự động thay thế container lỗi) và phối hợp cùng ALB để **rolling update** phiên bản mới không gây gián đoạn hệ thống.

#### 3.3. Lớp Dữ liệu và Caching (Data & Cache Layer)
* **Amazon DocumentDB (MongoDB Compatible):** Cơ sở dữ liệu NoSQL chính lưu trữ danh mục phụ tùng, đơn hàng, giỏ hàng, thông tin người dùng. DocumentDB chạy trong phân vùng Private Subnet với cấu hình dự phòng **Multi-AZ** (1 Primary + 2 Replicas) tự động failover, kết nối bảo mật qua SSL (sử dụng chứng chỉ `global-bundle.pem`) và cơ chế xác thực SCRAM-SHA-1.
* **Amazon ElastiCache cho Redis:** Lưu trữ bộ nhớ đệm (Cache) tốc độ cao và làm kênh Broker truyền tin realtime thông qua `socket.io-redis` để đồng bộ kết nối thời gian thực giữa các container Backend, đẩy thông báo thanh toán (Realtime Push Notification) tới client ngay khi nhận được webhook từ ngân hàng.

#### 3.4. Lớp Tích hợp Bất đồng bộ (Integration & Serverless Layer)
* **Amazon SQS (Simple Queue Service):** Hàng đợi tin nhắn trung gian để hứng các sự kiện Webhook/IPN phản hồi thanh toán từ các cổng VNPay/MoMo gửi về. Khi có webhook, Backend đẩy nhanh payload vào SQS và phản hồi ngay cho ngân hàng, giúp tránh nghẽn/mất mát dữ liệu khi server quá tải.
* **AWS Lambda:** Hàm xử lý sự kiện Serverless (FaaS) tự động rút tin nhắn từ SQS để xử lý cập nhật trạng thái đơn hàng và ghi hóa đơn vào DocumentDB. Lambda chạy ngầm trong Private Subnet, hoạt động theo mô hình pay-as-you-go (chỉ tính phí khi chạy), tối ưu chi phí vận hành.

#### 3.5. Lớp Lưu trữ (Storage Layer)
* **Amazon S3 (Simple Storage Service):** Lưu trữ tệp tin tĩnh và các tệp tin đa phương tiện.
  * **S3 Web Hosting:** Lưu trữ và phân phối mã nguồn Frontend ReactJS đến trình duyệt người dùng.
  * **S3 Media Bucket:** Lưu trữ hình ảnh sản phẩm phụ tùng tải lên từ trang Admin. Backend sử dụng AWS SDK để sinh link tạm (**Presigned URL**) giúp hiển thị ảnh an toàn.

#### 3.6. Lớp Bảo mật và Quản trị (Security & Governance Layer)
* **AWS Secrets Manager:** Quản lý, mã hóa và lưu trữ tập trung các thông tin nhạy cảm (chuỗi kết nối `MONGO_URI` chứa mật khẩu DocumentDB, `JWT_SECRET`). ECS Task Definition tự động tham chiếu khóa bí mật từ Secrets Manager lúc khởi chạy mà không cần hard-code biến môi trường.
* **AWS WAFv2 (Web Application Firewall):** Tường lửa bảo vệ ALB/CloudFront khỏi các cuộc tấn công mạng bằng cách gắn các bộ luật do AWS quản lý (`AWSManagedRulesCommonRuleSet` và `AWSManagedRulesSQLiRuleSet`) để chặn SQL Injection, Cross-Site Scripting (XSS), và các cuộc quét lỗi tự động.
* **Amazon CloudWatch Logs:** Thu thập và lưu trữ toàn bộ nhật ký hoạt động (Logs) của container ECS và hàm Lambda, phục vụ giám sát hiệu năng, troubleshoot lỗi realtime và audit giao dịch.

---

### 4. Ý Nghĩa Của Kiến Trúc Đối Với Báo Cáo Workshop
* **Tối ưu hóa Chi phí (Cost Optimization):** Sử dụng các dịch vụ Fargate và Lambda giúp hệ thống chỉ tiêu thụ tài nguyên thực tế khi có người dùng truy cập, giảm thiểu chi phí chạy máy chủ rảnh rỗi.
* **Tính Sẵn Sàng Cao (High Availability):** Thiết lập Multi-AZ trên ALB, ECS, DocumentDB và Redis đảm bảo hệ thống hoạt động liên tục ngay cả khi một vùng vật lý của AWS gặp sự cố.
* **Bảo mật Tuyệt Đối (Security):** Cô lập hoàn toàn lớp dữ liệu trong Private Subnets, quản lý khóa bảo mật qua Secrets Manager, bảo vệ lớp ngoài cùng bằng WAFv2.
