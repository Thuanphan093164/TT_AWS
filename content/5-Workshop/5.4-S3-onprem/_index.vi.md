---
title: "Bài 4: Kết nối S3 từ On-premise"
date: 2024-01-01
weight: 4
chapter: false
pre: " <b> 5.4. </b> "
---

## Bài 4: Truy cập Amazon S3 từ On-premises thông qua Interface Endpoint

Trong phần này, tôi tiến hành cấu hình **Amazon S3 PrivateLink Interface Endpoint** để cho phép các máy chủ vật lý chạy tại văn phòng/nhà kho (on-premises) của J2Car AutoParts kết nối an toàn với S3 Media Bucket thông qua đường truyền VPN nội bộ.

---

### Sự khác biệt giữa Gateway Endpoint và Interface Endpoint

- **Gateway Endpoint:** Chỉ hoạt động cho các tài nguyên tính toán chạy trực tiếp trong cùng một VPC Cloud nơi Endpoint được tạo.
- **Interface Endpoint (AWS PrivateLink):** Hoạt động được cho cả tài nguyên nội bộ VPC và các tài nguyên chạy bên ngoài (on-premises) kết nối qua Site-to-Site VPN hoặc AWS Direct Connect.

---

### Các bước thực hiện chi tiết

1. [Chuẩn bị môi trường & cấu hình VPN Route](5.4.1-prepare/)
2. [Khởi tạo S3 Interface Endpoint](5.4.2-create-interface-enpoint/)
3. [Kiểm thử kết nối qua Endpoint DNS](5.4.3-test-endpoint/)
4. [Phân giải DNS giả lập On-premises](5.4.4-dns-simulation/)
