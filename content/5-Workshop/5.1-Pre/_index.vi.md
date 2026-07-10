---
title: "Bài 1: Giới thiệu"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 5.1. </b> "
---

## Bài 1: Giới thiệu về VPC Endpoints & Tổng quan hệ thống J2Car

**VPC Endpoints** là các thiết bị ảo được co giãn theo chiều ngang, có tính độ khả dụng cao. Chúng cho phép các tài nguyên tính toán trong VPC của bạn kết nối an toàn với các dịch vụ AWS được hỗ trợ mà không cần đi qua môi trường Internet công cộng hay NAT Gateway, giảm thiểu rủi ro bảo mật và tối ưu chi phí truyền tải dữ liệu.

Đối với dự án **J2Car AutoParts**, các container Backend Node.js cần giao tiếp liên tục với các dịch vụ AWS như **Amazon S3** (để tải ảnh phụ tùng), **Amazon ECR** (tải container images), và **AWS Secrets Manager** (lấy chuỗi kết nối). Việc cấu hình VPC Endpoints là bắt buộc để bảo đảm an toàn dữ liệu.

---

### Tổng quan kịch bản Lab của Workshop

Trong bài lab này, chúng ta sẽ mô phỏng và triển khai mạng lưới kết nối giữa hai phân vùng:

1. **VPC Cloud (J2Car-Production-VPC):** Là phân vùng chính chạy các tài nguyên đám mây bao gồm các S3 Buckets, ECR, ECS và Gateway Endpoint cho S3.
2. **VPC On-Prem (Môi trường giả lập On-premises):** Mô phỏng văn phòng làm việc hoặc kho hàng vật lý của J2Car AutoParts. Một EC2 instance chạy phần mềm VPN (strongSwan) đã được thiết lập để kết nối Site-to-Site VPN với AWS Transit Gateway, cho phép kiểm thử khả năng kết nối an toàn từ on-premises tới S3 Cloud thông qua **PrivateLink Interface Endpoint**.

---

### Sơ đồ kiến trúc triển khai thực tế của J2Car

Mọi cấu hình trong Workshop này đều tuân thủ chặt chẽ theo thiết kế hạ tầng thực tế dưới đây:

![Sơ đồ kiến trúc J2Car](images/kientruchethong.png)
