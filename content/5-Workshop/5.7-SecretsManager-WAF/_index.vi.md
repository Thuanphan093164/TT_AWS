---
title: "5.7. Bảo mật Secrets Manager & AWS WAF"
date: 2024-01-01
weight: 7
chapter: false
pre: " <b> 5.7. </b> "
---

# Bước 6: Tường lửa AWS WAFv2 & Bảo mật Secrets Manager

Lớp bảo mật quản lý an ninh, bảo vệ toàn bộ hạ tầng đám mây khỏi các cuộc tấn công mạng phá hoại và quản lý tập trung các thông tin cấu hình nhạy cảm.

---

### Hướng dẫn Thực hành Từng bước

#### 1. Quản lý Bí mật Với AWS Secrets Manager
Để bảo vệ an toàn cho các thông tin nhạy cảm, loại bỏ việc lưu trữ cứng (hard-code) mật khẩu cơ sở dữ liệu và mã khóa JWT trong source code:
1. Truy cập console **AWS Secrets Manager**, chọn **Store a new secret**.
2. Chọn loại secret: **Other type of secret** (API key, connection string, etc.).
3. Điền các cặp Key/Value:
   * `MONGO_URI`: Chuỗi kết nối bảo mật đến cụm DocumentDB (chứa username, password, cert SSL).
   * `JWT_SECRET`: Khóa bí mật dùng để ký và xác thực mã JWT.
4. Đặt tên Secret: `j2car/production/secrets`. Nhấp **Store**.

![Mã hóa cấu hình bảo mật trên AWS Secrets Manager](/images/5-Workshop/5.7-SecretsManager-WAF/9-secrets.png)
5. **Cách liên kết vào ECS Task Definition:**
   * Trong giao diện cấu hình Task Definition của Backend (ở Bước 5), tại phần cấu hình Environment Variables của Container, thay vì chọn `Value`, ta chọn `ValueFrom` và dán ARN của Secrets Manager kèm theo key tương ứng (ví dụ: `arn:aws:secretsmanager:...:j2car/production/secrets:MONGO_URI::`).
   * ECS sẽ tự động giải mã và nạp các biến này vào container lúc khởi chạy.

#### 3. Cấu hình Tường lửa AWS WAFv2 Chống Tấn Công Mạng
Để bảo vệ Application Load Balancer (ALB) và phân phối CloudFront khỏi các cuộc tấn công phổ biến trên Internet:
1. Truy cập console **WAF & Shield** -> click **Create Web ACL**.
2. Thiết lập thông tin cơ bản:
   * **Name:** `j2car-web-acl`
   * **Resource Type:** Chọn **Regional resources** (để gắn trực tiếp bảo vệ ALB) hoặc **CloudFront distributions**. Gắn vào `j2car-backend-alb` đã tạo.
3. Thêm các bộ luật của AWS (**AWS Managed Rule Groups**):
   * **AWSManagedRulesCommonRuleSet:** Bộ luật cơ bản bảo vệ ứng dụng khỏi các lỗ hổng OWASP Top 10 phổ biến.
   * **AWSManagedRulesSQLiRuleSet:** Bộ luật chặn đứng các hành vi chèn mã độc hại SQL Injection vào câu truy vấn.
4. Cấu hình Default Action: **Allow** (Cho phép tất cả lưu lượng hợp lệ và chỉ chặn các request vi phạm luật).
5. Hoàn thành khởi tạo Web ACL.

![AWS WAFv2 bảo vệ Application Load Balancer](/images/5-Workshop/5.7-SecretsManager-WAF/10-waf.png)

#### 4. Thu Thập Nhật Ký Với Amazon CloudWatch Logs
* Toàn bộ nhật ký hoạt động (Console Logs) của các Container ECS Backend chạy trên Fargate và hàm AWS Lambda xử lý webhook được cấu hình tự động đẩy về CloudWatch Logs.
* Giúp quản trị viên có thể:
  * Giám sát hiệu năng và phát hiện lỗi phát sinh thời gian thực (**Troubleshooting**).
  * Truy vết và kiểm toán các giao dịch tài chính (VNPay/MoMo Webhook) đề phòng gian lận (**Transaction Auditing**).

---

### Kiểm tra kết quả
* Truy cập địa chỉ trang web qua S3 Static Website Hosting và đảm bảo React App tải thành công, các route chuyển trang mượt mà.
* Thử chèn một chuỗi SQL Injection giả lập (ví dụ: `/api/products?id=' OR 1=1 --`) trên đường dẫn ALB và xác nhận WAFv2 chặn yêu cầu ngay lập tức với mã lỗi **403 Forbidden**.
* Truy cập console **CloudWatch Logs** để kiểm tra các log stream của container ECS Backend đang chạy.
