---
title: "5.3. Triển khai DocumentDB & Redis"
date: 2024-01-01
weight: 3
chapter: false
pre: " <b> 5.3. </b> "
---

# Bước 2: Triển khai Cụm dữ liệu & Caching (DocumentDB & Redis)

Lớp dữ liệu là trái tim của hệ thống J2Car. Để đảm bảo độ tin cậy và hiệu năng cực cao, chúng ta thay thế hoàn toàn dịch vụ MongoDB Atlas bên ngoài bằng cụm **Amazon DocumentDB (MongoDB Compatible)** chạy nội bộ, kết hợp cụm bộ nhớ đệm **Amazon ElastiCache Redis** tốc độ cao. Cả hai đều được thiết lập dự phòng Multi-AZ trong Private Subnet.

---

### Hướng dẫn Thực hành Từng bước

#### 1. Khởi tạo Cụm cơ sở dữ liệu Amazon DocumentDB
1. Mở AWS Console, tìm kiếm và truy cập dịch vụ **Amazon DocumentDB**.
2. Tại menu bên trái, chọn **Clusters** và click **Create**.
3. Cấu hình các thông số chi tiết:
   * **Cluster Identifier:** `j2car-docdb-cluster`
   * **Engine Version:** Chọn phiên bản tương thích mới nhất (ví dụ: MongoDB 5.0).
   * **Instance Class:** `db.t3.medium` (hoặc cấu hình phù hợp với tải thử nghiệm).
   * **Number of Instances:** `3` (Cụm Multi-AZ gồm **1 Primary Node** cho Đọc/Ghi và **2 Replica Nodes** cho Đọc để tự động failover và cân bằng tải truy cập).
4. **Authentication:** Thiết lập Master Username (ví dụ: `dbadmin`) và Password tuân thủ cơ chế xác thực bảo mật **SCRAM-SHA-1**.
5. **Network Settings:**
   * **VPC:** Chọn `J2Car-Production-VPC`.
   * **Subnet Group:** Tạo/Chọn Subnet Group trỏ vào 2 Private Subnets Data (`10.0.5.0/24` và `10.0.6.0/24`).
6. Bật tùy chọn mã hóa kết nối bằng **SSL** (yêu cầu tải chứng chỉ toàn cầu `global-bundle.pem` vào mã nguồn Backend để kết nối an toàn).
7. Nhấp **Create Cluster** và chờ cụm chuyển sang trạng thái *Available*.

![Amazon DocumentDB cluster hoạt động ở trạng thái Available](/images/5-Workshop/5.3-Databases/5-docdb.png)

#### 2. Khởi tạo Cụm Amazon ElastiCache cho Redis
1. Mở AWS Console, truy cập dịch vụ **ElastiCache**.
2. Chọn mục **Redis OSS clusters** và click **Create Redis OSS cluster**.
3. Định cấu hình cụm Redis:
   * **Name:** `j2car-redis-cache`
   * **Multi-AZ:** Bật **Enabled** để tự động failover khi có sự cố vật lý.
   * **Node Type:** `cache.t3.micro` (tối ưu chi phí lab).
   * **Number of Replicas:** `1` (Thiết lập 1 Primary và 1 Replica đồng bộ dữ liệu thời gian thực).
   * **Subnet Group:** Gắn cụm vào Private Subnets Data (`10.0.5.0/24` và `10.0.6.0/24`).
4. Click **Create** để khởi tạo cụm Redis.

![Amazon ElastiCache Redis cluster hoạt động ở trạng thái Available](/images/5-Workshop/5.3-Databases/6-redis.png)

#### 3. Cấu hình Nhóm Bảo mật nghiêm ngặt (Security Group)
* Để ngăn chặn hoàn toàn kết nối từ bên ngoài và chỉ cho phép ứng dụng Backend truy cập:
  1. Tạo Security Group mới tên là `J2Car-Database-SG`.
  2. Gắn Security Group này vào cụm DocumentDB và cụm Redis.
  3. Cấu hình **Inbound Rules**:
     * **Rule 1 (DocumentDB):** Cổng `27017` -> Source: Chọn Security Group của ECS Backend (`J2Car-Backend-SG`).
     * **Rule 2 (Redis):** Cổng `6379` -> Source: Chọn Security Group của ECS Backend (`J2Car-Backend-SG`).

---

### Kết nối Realtime qua Redis Broker
Cụm Redis ngoài việc lưu trữ cache tốc độ cao còn đóng vai trò làm **Message Broker** phối hợp cùng thư viện `socket.io-redis`. Khi có Webhook/IPN phản hồi từ cổng thanh toán báo đơn hàng đã thanh toán thành công, sự kiện sẽ được đồng bộ ngay qua Redis Broker đến tất cả các container Backend để đẩy thông báo thời gian thực (Realtime Push Notification) tới trình duyệt client.

---

### Kiểm tra kết quả
* Kiểm tra trên trang quản trị xem cả hai cụm cơ sở dữ liệu đều chuyển sang trạng thái **Available**.
* Ghi lại chuỗi kết nối DocumentDB (ConnectionString chứa SSL) và Endpoint của Redis Cluster để nạp vào cấu hình biến môi trường của Backend.

