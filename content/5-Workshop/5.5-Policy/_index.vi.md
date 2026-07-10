---
title: "Bước 5: VPC Endpoint Policies & CloudFront"
date: 2024-01-01
weight: 5
chapter: false
pre: " <b> 5.5. </b> "
---

## Bước 5: Bảo mật lưu lượng với VPC Endpoint Policies & CloudFront Edge

Theo mặc định, các VPC Gateway và Interface Endpoint vừa tạo sẽ đính kèm một Policy cấp quyền **Full Access** tới các dịch vụ AWS. Để thắt chặt an ninh cho nền tảng J2Car AutoParts, tôi cấu hình **VPC Endpoint Policies** tùy chỉnh nhằm giới hạn lưu lượng mạng, chỉ cho phép truy cập tới S3 bucket chỉ định của dự án.

Đồng thời, tôi cấu hình **Amazon CloudFront** tại lớp Edge để phân phối các tài nguyên tĩnh từ S3 Web Bucket.

---

### 1. Áp dụng Endpoint Policy giới hạn

Tôi thay đổi Policy của Gateway Endpoint để chặn toàn bộ các yêu cầu truyền dữ liệu tới các bucket không được phê duyệt bên ngoài hệ thống:

1. Mở **Amazon VPC Console -> Endpoints**.
2. Chọn Gateway VPC Endpoint (`s3-gwe`) đã tạo trước đó.
3. Chọn tab **Policy**, sau đó chọn **Edit policy**.
4. Thay thế cấu hình mặc định bằng cấu hình JSON dưới đây để cô lập lưu lượng chỉ được phép truy cập tới S3 media bucket của J2Car:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowAccessToJ2CarMediaBucket",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::j2car-media-bucket-571210199437",
        "arn:aws:s3:::j2car-media-bucket-571210199437/*"
      ]
    }
  ]
}
```
5. Nhấn **Save** để áp dụng.

---

### 2. Triển khai Amazon CloudFront Edge Location

Tôi thực hiện tạo CloudFront CDN trỏ về S3 Frontend Web Bucket:

```bash
# Khởi tạo CloudFront CDN trỏ tới S3 Web Bucket
aws cloudfront create-distribution \
  --origin-domain-name j2car-web-bucket-571210199437.s3.ap-southeast-1.amazonaws.com \
  --default-root-object index.html \
  --region us-east-1
```

#### AWS CloudFront Console Proof (`15-cloudfront.png`):
![AWS CloudFront Console](/images/5-Workshop/15-cloudfront.png)

> [!WARNING]
> **Lưu ý kỹ thuật về lỗi AccessDenied:**
> Đối với các tài khoản AWS cá nhân mới hoặc tài khoản AWS Educate/Academy, bạn có thể gặp lỗi `AccessDenied` khi gọi API tạo CloudFront:
> *`An error occurred (AccessDenied) when calling the CreateDistribution operation: Your account must be verified before you can add new CloudFront resources.`*
>
> **Cách khắc phục:**
> 1. Truy cập vào [AWS Support Center](https://console.aws.amazon.com/support/home#/case/create).
> 2. Tạo một ticket hỗ trợ (Support Case) yêu cầu xác minh tài khoản (Account Verification) để kích hoạt tài nguyên CloudFront.
> 3. Cung cấp thông báo lỗi chi tiết trên để AWS Support phê duyệt kích hoạt trong vòng 24 giờ.

---

### 3. Kiểm tra thực thi Policy

Tôi thực hiện kiểm tra các quy tắc Policy từ dòng lệnh của EC2 instance **Test-Gateway-Endpoint**:

- **Lệnh 1: Truy cập S3 Media Bucket được phép:**
```bash
aws s3 ls s3://j2car-media-bucket-571210199437
# Kết quả: Hiển thị danh sách tệp tin thành công (Succeeds)
```

- **Lệnh 2: Truy cập S3 Web Bucket bị chặn:**
```bash
aws s3 ls s3://j2car-web-bucket-571210199437
# Kết quả: Trả về lỗi Access Denied (Bị chặn thành công)
```

Endpoint Policy hoạt động chính xác, đảm bảo dữ liệu của J2Car AutoParts không bị rò rỉ ra các bucket nằm ngoài tầm kiểm soát.
