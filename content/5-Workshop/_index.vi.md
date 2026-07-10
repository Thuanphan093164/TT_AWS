---
title: "Workshop"
date: 2024-01-01
weight: 5
chapter: false
pre: " <b> 5. </b> "
---

# Kịch Bản Triển Khai Thực Tế J2Car AutoParts Trên AWS

---

### Giới Thiệu

Nhằm chứng minh tính khả thi và đo lường hiệu năng thực tế của kiến trúc đề xuất cho dự án **J2Car AutoParts**, tôi đã tiến hành triển khai toàn bộ hệ thống lên môi trường đám mây AWS. 

Mục tiêu của workshop này là ghi lại toàn bộ quá trình tự tay tôi thiết lập và vận hành hệ thống từ sơ đồ thiết kế ban đầu thành một ứng dụng chạy thực tế trên internet.

---

### Sơ Đồ Kiến Trúc Triển Khai Thực Tế

Toàn bộ quá trình triển khai đều tuân thủ nghiêm ngặt sơ đồ thiết kế dưới đây:

![Sơ đồ kiến trúc thực tế](/images/kientruchethong.png)

---

### Các Bài Viết Triển Khai Chi Tiết

1. [Bài 1: Chuẩn bị tài nguyên & Đóng gói Docker Images](5.1-Pre/)
2. [Bài 2: Thiết lập hạ tầng mạng Multi-AZ (Network Layer)](5.2-Network/)
3. [Bài 3: Cấu hình kết nối S3 VPC Gateway Endpoint](5.3-S3-Endpoint/)
4. [Bài 4: Khởi tạo cơ sở dữ liệu & Caching (Data Layer)](5.4-Data/)
5. [Bài 5: Triển khai ứng dụng & Load Balancer (Compute Layer)](5.5-Compute/)
6. [Bài 6: Triển khai lớp Tích hợp & Bảo mật (Integration & Security Layer)](5.6-Security/)
7. [Bài 7: Kiểm thử End-to-End hệ thống](5.7-Verify/)
