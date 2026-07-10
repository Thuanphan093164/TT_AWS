---
title: "Kiểm thử Interface Endpoint"
date: 2024-01-01
weight: 3
chapter: false
pre: " <b> 5.4.3. </b> "
---

## Kiểm Thử Kết Nối Interface Endpoint

Tôi thực hiện kiểm thử tải tệp tin lên S3 từ máy chủ EC2 giả lập On-premises thông qua liên kết DNS của Interface Endpoint mới tạo.

---

### 1. Lấy liên kết DNS vùng (Regional DNS Name) của Interface Endpoint

1. Mở **Amazon VPC Console -> Endpoints**.
2. Nhấp vào Endpoint có tên `s3-interface-endpoint` vừa tạo.
3. Tại tab **Details**, sao chép dòng DNS đầu tiên (Regional DNS Name, ví dụ: `vpce-0c03478d1f2a-ap-southeast-1.s3.ap-southeast-1.vpce.amazonaws.com`) và dán vào notepad để chuẩn bị sử dụng.

---

### 2. Kết nối EC2 On-premise qua Session Manager

1. Mở **AWS Systems Manager Console -> Session Manager**.
2. Nhấp **Start Session** và chọn EC2 instance có tên **Test-Interface-Endpoint** (đang chạy trong phân vùng giả lập `VPC On-prem`).
3. Khởi tạo một tệp tin test 1GB tại terminal và đẩy lên S3:

```bash
# Di chuyển vào home directory
cd ~

# Khởi tạo tệp tin testfile2.xyz
fallocate -l 1G testfile2.xyz

# Tải tệp tin lên S3 sử dụng tham số endpoint-url
aws s3 cp --endpoint-url https://bucket.vpce-0c03478d1f2a-ap-southeast-1.s3.ap-southeast-1.vpce.amazonaws.com testfile2.xyz s3://j2car-media-bucket-571210199437
```
*(Lưu ý: Thay thế tên DNS sau chữ bucket. bằng dòng DNS bạn đã sao chép ở Bước 1).*

---

### 3. Xác thực kết quả trên S3

Tệp tin `testfile2.xyz` đã được tải lên thành công. Tôi truy cập **S3 Management Console** để xác nhận file đã xuất hiện trong Media Bucket.

Quá trình tải lên thành công thông qua đường truyền mạng VPN nội bộ và Interface Endpoint mà hoàn toàn không cần tiếp cận mạng Internet công cộng từ on-premises.
