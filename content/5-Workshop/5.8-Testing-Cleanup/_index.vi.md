---
title: "5.8. Kiểm thử & Dọn dẹp tài nguyên"
date: 2024-01-01
weight: 8
chapter: false
pre: " <b> 5.8. </b> "
---

# Bước 7: Kiểm thử Hệ thống, Dọn dẹp Tài nguyên & Đánh giá Kiến trúc

Sau khi đã triển khai và tích hợp thành công toàn bộ các lớp dịch vụ trên hạ tầng AWS, bước cuối cùng là chạy kiểm thử chức năng đầu cuối (End-to-End), thực hiện dọn dẹp các tài nguyên tính phí và đánh giá giá trị thực tiễn của mô hình kiến trúc.

---

### 1. Kịch bản Kiểm thử Hệ thống Đầu Cuối (End-to-End Testing)

Hãy thực hiện các kịch bản sau để kiểm thử tính toàn vẹn của ứng dụng J2Car AutoParts:

* **Kịch bản 1: Xác thực & Đăng nhập (Auth Flow)**
  * Truy cập ứng dụng qua URL của **CloudFront**.
  * Tiến hành đăng ký tài khoản mới và đăng nhập. Kiểm tra xem Backend (ECS Fargate) có cấp mã JWT và lưu trữ an toàn trong cookies/local storage của trình duyệt hay không.
* **Kịch bản 2: Tìm kiếm Thông minh Bằng Hình ảnh (AI Scan Image)**
  * Vào chức năng quét ảnh phụ tùng, tải lên một tệp tin hình ảnh linh kiện ô tô bị hỏng.
  * Xác nhận Backend tải ảnh thành công lên Private S3 Media Bucket thông qua AWS SDK, phân tích và gọi API để lấy danh sách gợi ý sản phẩm thay thế từ cơ sở dữ liệu **DocumentDB** (kết nối nội bộ bảo mật SSL).
* **Kịch bản 3: Hỗ trợ Trực tuyến Realtime Chat (Socket.io & Redis Broker)**
  * Mở cửa sổ chat hỗ trợ trên 2 trình duyệt khác nhau (hoặc 1 Client + 1 Admin).
  * Gửi tin nhắn và xác nhận tin nhắn truyền tải lập tức. Dù hai phiên kết nối có nằm trên hai container Backend ECS khác nhau, chúng vẫn đồng bộ được trạng thái chat nhờ kênh **ElastiCache Redis Broker** sử dụng `socket.io-redis`.
* **Kịch bản 4: Luồng Thanh Toán Bất Đồng Bộ (SQS + Lambda)**
  * Tạo một đơn hàng mới và giả lập gửi một Webhook IPN thanh toán thành công tới API Backend `/api/payment/webhook`.
  * Xác nhận Backend nhận IPN, verify chữ ký, đẩy tin nhắn vào **Amazon SQS** rồi trả về thành công nhanh cho ngân hàng.
  * Hàng đợi SQS tự kích hoạt hàm **AWS Lambda** chạy trong Private Subnet.
  * Kiểm tra xem Lambda đã kết nối DocumentDB qua SSL, tự động chuyển trạng thái đơn hàng thành `PAID` và ghi nhận một bản ghi hóa đơn thành công vào bảng `invoices` hay chưa.
  * Xác nhận trình duyệt client nhận được thông báo thanh toán thành công tức thời.
* **Kịch bản 5: Kiểm thử Tường lửa AWS WAFv2**
  * Truy cập API Backend qua Load Balancer và chèn thêm câu lệnh script giả lập SQL Injection hoặc Cross-Site Scripting (XSS).
  * Đảm bảo yêu cầu bị chặn đứng bởi AWS WAFv2 và phản hồi mã lỗi **403 Forbidden**.

---

### 2. Hướng dẫn Dọn dẹp Tài nguyên Tránh Phát Sinh Chi Phí (Cleanup)

Sau khi kết thúc Workshop thực hành, để tránh việc AWS tiếp tục tính phí các tài nguyên chạy ngầm, hãy tiến hành xóa các dịch vụ theo thứ tự sau:

1. **ECS Service & Cluster:** Truy cập ECS, cập nhật desired tasks của `j2car-backend-service` về `0` để chấm dứt các container đang chạy. Tiến hành xóa Service và xóa ECS Cluster.
2. **Application Load Balancer (ALB):** Xóa ALB `j2car-backend-alb` và các Target Groups liên quan để giải phóng IP.
3. **NAT Gateways & Elastic IPs:** Xóa các NAT Gateways nằm ở Public subnets (bước này quan trọng vì NAT Gateway tính phí theo giờ rất cao), sau đó giải phóng (Release) các địa chỉ Elastic IP tĩnh đi kèm.
4. **DocumentDB & ElastiCache Redis:** Tiến hành xóa cụm DocumentDB `j2car-docdb-cluster` và cụm Redis `j2car-redis-cache`.
5. **Amazon S3 Buckets:** Làm trống (Empty) và xóa các S3 buckets chứa mã nguồn web và media sản phẩm.
6. **CloudFront & AWS WAF:** Vô hiệu hóa (Disable) và xóa CloudFront Distribution. Xóa Web ACL cấu hình trên WAFv2.
7. **AWS Secrets Manager:** Chọn xóa secret `j2car/production/secrets` (chọn cấu hình force delete hoặc schedule delete ngắn nhất).
8. **Amazon VPC:** Tiến hành xóa VPC `J2Car-Production-VPC`. Thao tác này sẽ tự động xóa sạch các Subnets, Route Tables, Internet Gateway và VPC Endpoints đi kèm.

---

### 3. Đánh giá Giá trị Thực tiễn của Kiến trúc Triển khai

Mô hình kiến trúc đám mây của dự án J2Car AutoParts mang lại 3 giá trị cốt lõi:

* **Tối ưu hóa Chi phí (Cost Optimization):** Bằng việc sử dụng hạ tầng Serverless Compute (Fargate chạy container theo tài nguyên thực tế, Lambda chạy theo mô hình pay-as-you-go chỉ tính phí khi có tin nhắn SQS kích hoạt), doanh nghiệp loại bỏ hoàn toàn chi phí duy trì phần cứng rảnh rỗi lúc hệ thống không có người mua sắm.
* **Tính Sẵn Sàng Cao (High Availability):** Thiết kế dự phòng Multi-AZ ở tất cả các tầng (Load Balancer, Container ECS, Cơ sở dữ liệu DocumentDB 1 Primary + 2 Replicas, Cụm Redis cache) giúp hệ thống tự động phục hồi và chuyển vùng hoạt động an toàn ngay cả khi một trung tâm dữ liệu vật lý của AWS gặp sự cố mất điện/thiên tai đột ngột.
* **Bảo mật Tuyệt Đối (Security at All Layers):** Tách biệt ranh giới mạng nghiêm ngặt. Lớp dữ liệu và mã nguồn nghiệp vụ chạy hoàn toàn trong các Private Subnets, hoàn toàn miễn nhiễm trước các cuộc tấn công quét cổng trực tiếp từ Internet. Thông tin cấu hình được bảo vệ tập trung qua Secrets Manager, lớp ngoài cùng được che chắn bởi tường lửa WAFv2.
