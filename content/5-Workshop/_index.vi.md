---
title: "Workshop"
date: 2024-01-01
weight: 5
chapter: false
pre: " <b> 5. </b> "
---

# Triển khai Hệ thống Thương mại Điện tử Phụ tùng Ô tô (NodeJ2Car) trên AWS

Chào mừng các bạn đến với tài liệu hướng dẫn thực hành Workshop triển khai ứng dụng thương mại điện tử **NodeJ2Car** trên hạ tầng điện toán đám mây Amazon Web Services (AWS). 

Hệ thống được thiết kế theo mô hình kiến trúc hiện đại, có khả năng mở rộng cao, bảo mật nghiêm ngặt và chịu lỗi vật lý cao (Multi-AZ).

![Kiến trúc tổng quan AWS](/images/5-Workshop/architecture.png)

---

### Các nội dung chính trong Workshop:

1. **[Giới thiệu & Kiến trúc AWS](5.1-overview/)**
   * Tổng quan dự án NodeJ2Car và phân tích chi tiết vai trò các tầng dịch vụ AWS.
2. **[Thiết lập VPC & Hạ tầng mạng](5.2-vpc-networking/)**
   * Khởi tạo VPC, phân vùng subnet Public/Private trên 2 Availability Zones (ap-southeast-1a và ap-southeast-1b), thiết lập Route Tables và NAT Gateways.
3. **[Triển khai DocumentDB & Redis](5.3-databases/)**
   * Cấu hình database DocumentDB (MongoDB-compatible) và ElastiCache Redis chịu lỗi trong mạng riêng tư.
4. **[Lưu trữ S3 & VPC Gateway Endpoints](5.4-storage/)**
   * Thiết lập S3 buckets lưu trữ tĩnh và hình ảnh, cấu hình VPC Gateway Endpoint để kết nối nội bộ miễn phí băng thông.
5. **[Đóng gói Docker & ECS Fargate](5.5-ecs-fargate/)**
   * Đóng gói mã nguồn Backend, đẩy lên ECR và vận hành không máy chủ trên ECS Fargate qua Load Balancer với Sticky Sessions.
6. **[Xử lý thanh toán Serverless & SQS](5.6-serverless-payment/)**
   * Xây dựng luồng nhận thanh toán bất đồng bộ bảo mật sử dụng AWS Lambda Webhook, hàng đợi tin nhắn SQS và Worker.
7. **[Phân phối CloudFront & AWS WAF](5.7-cloudfront-waf/)**
   * Lưu trữ React SPA trên S3, phân phối CDN qua CloudFront và thiết lập tường lửa WAF chống SQL Injection, XSS, DDoS.
8. **[Kiểm thử & Dọn dẹp tài nguyên](5.8-testing-cleanup/)**
   * Kiểm thử tính năng (AI Scan Image, Webhook, Chat), đánh giá lợi ích kiến trúc và hướng dẫn dọn dẹp tránh phát sinh chi phí.
9. **[Demo](5.9-demo/)**
   * Video/tài liệu demo cho Workshop.

