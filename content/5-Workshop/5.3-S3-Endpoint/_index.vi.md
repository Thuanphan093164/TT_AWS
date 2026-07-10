---
title: "Bài 3: Kết nối S3 từ VPC"
date: 2024-01-01
weight: 3
chapter: false
pre: " <b> 5.3. </b> "
---

## Bài 3: Truy cập Amazon S3 từ VPC Cloud thông qua Gateway Endpoint

Trong phần này, tôi thiết lập một **VPC Gateway Endpoint** cho Amazon S3 để cho phép các dịch vụ backend chạy trong Private Subnets tải và ghi dữ liệu trực tiếp vào S3 Media Bucket mà không cần định tuyến qua môi trường Internet công cộng hay đi qua NAT Gateway.

---

### Nguyên lý kết nối an toàn

Khi cấu hình Gateway Endpoint:
1. Mọi lưu lượng kết nối từ EC2 / ECS Tasks tới S3 sẽ được định tuyến thông qua hạ tầng mạng nội bộ của AWS.
2. Route Table của Private Subnets sẽ tự động thêm tuyến đường trỏ Prefix List của S3 tới Endpoint ID.
3. Không phát sinh chi phí truyền dữ liệu (Data Transfer) qua NAT Gateway, giúp tối ưu hóa chi phí vận hành cho J2Car AutoParts.

---

### Các bước thực hiện chi tiết

1. [Tạo S3 Gateway Endpoint](5.3.1-create-gwe/)
2. [Kiểm thử kết nối Gateway Endpoint](5.3.2-test-gwe/)
