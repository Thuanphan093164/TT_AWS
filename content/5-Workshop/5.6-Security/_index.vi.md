---
title: "Bài 6: Tích hợp & Bảo mật"
date: 2024-01-01
weight: 6
chapter: false
pre: " <b> 5.6. </b> "
---

## Bài 6: Triển Khai Lớp Tích Hợp & Bảo Mật (Integration & Security Layer)

Để bảo đảm các giao dịch thanh toán mua phụ tùng trên J2Car không bị thất thoát khi quá tải và bảo vệ API khỏi các cuộc tấn công DDoS/SQL Injection, tôi triển khai tích hợp bất đồng bộ Serverless (SQS + Lambda), mã hóa mật khẩu trong Secrets Manager và thiết lập AWS WAF.

---

### 1. Triển Khai Lớp Tích Hợp Không Đồng Bộ (SQS & Lambda)

Tôi tạo một hàng đợi tin nhắn SQS nhằm tiếp nhận các webhook giao dịch thanh toán từ cổng IPN, sau đó trigger Lambda xử lý bất đồng bộ nhằm tối ưu tài nguyên cho ứng dụng backend chính:

```bash
# Tạo SQS Queue
aws sqs create-queue --queue-name J2Car-Payment-Queue --region ap-southeast-1

# Tạo IAM Execution Role cho Lambda
aws iam create-role --role-name J2Car-Lambda-Role --assume-role-policy-document file://trust.json --region ap-southeast-1
aws iam attach-role-policy --role-name J2Car-Lambda-Role --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole --region ap-southeast-1

# Khởi tạo Lambda Webhook xử lý hóa đơn giao dịch
aws lambda create-function \
  --function-name J2Car-Payment-Webhook \
  --runtime nodejs18.x \
  --zip-file fileb://function.zip \
  --handler index.handler \
  --role arn:aws:iam::571210199437:role/J2Car-Lambda-Role \
  --region ap-southeast-1
```

#### Minh Chứng Kết Quả Trên AWS Console:
- **Hàng Đợi SQS Hoạt Động (`7-sqs.png`):**
  ![SQS thực tế](/images/5-Workshop/7-sqs.png)
- **Hàm Lambda Sẵn Sàng Nhận Trigger (`8-lambda.png`):**
  ![Lambda thực tế](/images/5-Workshop/8-lambda.png)

---

### 2. Triển Khai Lớp Bảo Mật (Secrets Manager & WAF)

Tôi mã hóa thông tin tài khoản MongoDB/JWT Key và thiết lập tường lửa ứng dụng web AWS WAF để bảo vệ Load Balancer:

```bash
# Tạo khóa bí mật chứa MongoDB URI bảo mật trong Secrets Manager
aws secretsmanager create-secret \
  --name J2Car-Database-Secrets \
  --secret-string '{"db_uri":"mongodb://dbadmin:SecurePassWord123@j2car-docdb...","jwt_secret":"MySuperJWTSecretKey"}' \
  --region ap-southeast-1

# Tạo AWS WAF Web ACL gán luật để bảo vệ ALB
aws wafv2 create-web-acl \
  --name J2Car-WAF-ACL --scope REGIONAL --default-action Allow={} \
  --visibility-config SampledRequestsEnabled=true,CloudWatchMetricsEnabled=true,MetricName=J2CarWafMetric --region ap-southeast-1
```

#### Minh Chứng Kết Quả Trên AWS Console:
- **Secrets Manager Đã Tạo Khóa Thành Công (`9-secrets.png`):**
  ![Secrets Manager thực tế](/images/5-Workshop/9-secrets.png)
- **Tường Lửa AWS WAFv2 Bảo Vệ ALB Vùng Singapore (`10-waf.png`):**
  ![WAF thực tế](/images/5-Workshop/10-waf.png)
