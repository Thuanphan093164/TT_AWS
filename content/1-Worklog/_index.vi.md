---
title: "Nhật ký công việc"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 1. </b> "
---

## Giới Thiệu Chung

Nhật ký công việc này ghi lại toàn bộ quá trình học tập, nghiên cứu và thực hành trong **12 tuần thực tập** tại chương trình **First Cloud Journey (FCJ) — AWS Internship**.

Trong suốt thời gian thực tập, tôi đã tập trung vào việc xây dựng và triển khai dự án **J2Car AutoParts** — một hệ thống thương mại điện tử chuyên cung cấp phụ tùng ô tô, được thiết kế theo kiến trúc **3-Tier trên nền tảng AWS**, triển khai đa vùng khả dụng (Multi-AZ) tại region `ap-southeast-1 (Singapore)`.

Bên cạnh việc xây dựng dự án chính, mỗi tuần tôi đều hoàn thành các bài lab thực hành để nắm vững các dịch vụ AWS nền tảng, từ cơ bản đến nâng cao, áp dụng trực tiếp vào kiến trúc thực tế.

---

## Tổng Quan 12 Tuần Thực Tập

| Tuần | Chủ đề chính | Công nghệ / Dịch vụ |
|---|---|---|
| Tuần 1 | Làm quen với AWS, kiến trúc Cloud và các nhóm dịch vụ cơ bản | EC2, S3, IAM, VPC, AWS CLI |
| Tuần 2 | Bảo mật và quản lý danh tính nâng cao | IAM Advanced, AWS Config, GuardDuty |
| Tuần 3 | Mạng VPC nâng cao và phân phối nội dung | VPC, ALB, CloudFront, Route 53 |
| Tuần 4 | Lưu trữ và cơ sở dữ liệu cloud | S3 Advanced, RDS, DynamoDB, Aurora |
| Tuần 5 | Điện toán không máy chủ (Serverless) | Lambda, API Gateway, SQS, SNS, EventBridge |
| Tuần 6 | Giám sát hệ thống, hỗ trợ kỹ thuật và DNS lai | CloudWatch, AWS Support, Route 53 Resolver, Hybrid DNS |
| Tuần 7 | Tự động hóa qua CLI, quản lý đa tài khoản và sao lưu | AWS CLI, Organizations, IAM Identity Center, AWS Backup |
| Tuần 8 | Di chuyển máy chủ và container hóa ứng dụng | VM Import/Export, Docker, Docker Compose, RDS, ECR |
| Tuần 9 | Triển khai ECS Fargate, CI/CD và đánh giá bảo mật | ECS Fargate, GitLab CI/CD, CodeBuild, Container Insights, Security Hub |
| Tuần 10 | Mạng nâng cao và tự động hóa vận hành Serverless | VPC Peering, Network ACL, Transit Gateway, Lambda, EventBridge |
| Tuần 11 | Quản lý chi phí, Well-Architected và Infrastructure as Code | Cost Explorer, AWS Budgets, S3 VPC Endpoint, CloudFormation |
| Tuần 12 | Kiểm thử tải, HTTPS, hoàn thiện và tổng kết dự án | JMeter, Route 53, ACM, CloudFormation Master Stack |

---

## Chi Tiết Từng Tuần

**Tuần 1:** [Làm quen với AWS, EC2, S3, IAM và VPC cơ bản](1.1-week1/)

**Tuần 2:** [Bảo mật nâng cao: IAM Policy, AWS Config và GuardDuty](1.2-week2/)

**Tuần 3:** [Mạng VPC nâng cao, ALB, CloudFront và Route 53](1.3-week3/)

**Tuần 4:** [Cơ sở dữ liệu và lưu trữ: S3, RDS, DynamoDB, Aurora](1.4-week4/)

**Tuần 5:** [Serverless: Lambda, API Gateway, SQS, SNS và EventBridge](1.5-week5/)

**Tuần 6:** [Giám sát CloudWatch, AWS Support và Hybrid DNS với Route 53 Resolver](1.6-week6/)

**Tuần 7:** [AWS CLI, Organizations, IAM Identity Center và AWS Backup](1.7-week7/)

**Tuần 8:** [VM Import/Export, Docker, Docker Compose, Amazon RDS và ECR](1.8-week8/)

**Tuần 9:** [Amazon ECS Fargate, CI/CD tự động, Container Insights, Firelens và Security Hub](1.9-week9/)

**Tuần 10:** [VPC Peering, Network ACL, Transit Gateway và Lambda Auto Start/Stop EC2](1.10-week10/)

**Tuần 11:** [Cost Management, Well-Architected Review, S3 VPC Endpoint và CloudFormation IaC](1.11-week11/)

**Tuần 12:** [Load Testing, Route 53 + HTTPS/ACM, kiểm thử E2E và tổng kết dự án J2Car](1.12-week12/)

---

## Kết Quả Tổng Thể

Sau 12 tuần thực tập, dự án **J2Car AutoParts** đã được triển khai hoàn chỉnh trên AWS với các thành tựu nổi bật:

- ✅ Kiến trúc 3 lớp chuẩn Multi-AZ, sẵn sàng vận hành thực tế
- ✅ Hệ thống thanh toán đáng tin cậy với Lambda + SQS — không mất dữ liệu hóa đơn
- ✅ Tương tác thời gian thực qua Socket.io + Redis Pub/Sub
- ✅ CI/CD tự động hóa toàn bộ quy trình triển khai
- ✅ Toàn bộ hạ tầng được quản lý bằng CloudFormation (Infrastructure as Code)
- ✅ Hiệu năng đã kiểm chứng: P95 < 210ms tại 500 người dùng đồng thời