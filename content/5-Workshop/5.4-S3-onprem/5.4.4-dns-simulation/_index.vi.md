---
title: "Giả lập DNS On-premises"
date: 2024-01-01
weight: 4
chapter: false
pre: " <b> 5.4.4. </b> "
---

## Giả Lập Phân Giải DNS Từ On-Premises Lên Cloud

Để các ứng dụng nội bộ từ on-premises có thể gọi trực tiếp tên miền mặc định của S3 (`s3.ap-southeast-1.amazonaws.com`) mà vẫn tự động định tuyến qua các IP Private của Interface Endpoint mà không cần truyền tham số `--endpoint-url` thủ công, tôi tiến hành cấu hình Route 53 Resolvers.

---

### 1. Tạo DNS Alias Records trong Private Hosted Zone

1. Mở **Route 53 Console -> Hosted Zones**.
2. Nhấp vào Private Hosted Zone đã tạo có tên `s3.ap-southeast-1.amazonaws.com`.
3. Nhấp **Create record**:
   - **Record name:** Để trống để định cấu hình cho domain gốc.
   - **Alias:** Gạt nút chọn bật Alias.
   - **Route traffic to:** Chọn **Alias to VPC Endpoint**.
   - **Region:** Chọn `ap-southeast-1` (Singapore).
   - **Choose endpoint:** Dán dòng Regional VPC Endpoint DNS name đã lưu ở bước trước.
4. Nhấp **Add another record** để cấu hình cho wildcard subdomains:
   - **Record name:** Nhập `*`.
   - **Alias:** Gạt bật.
   - **Route traffic to:** Chọn Alias to VPC Endpoint vùng Singapore và dán dòng DNS Endpoint tương tự.
5. Nhấn **Create records** để hoàn tất.

---

### 2. Tạo Route 53 Resolver Forwarding Rule

Tôi tạo quy tắc chuyển tiếp (Forwarding Rule) để các truy vấn DNS gửi từ VPC On-prem hướng tới S3 sẽ tự động chuyển tiếp tới Inbound Resolver Endpoint của VPC Cloud:

1. Tại **Route 53 Console**, nhấp chọn **Inbound endpoints** ở menu bên trái. Sao chép lại 2 địa chỉ IP Private của Inbound Endpoint.
2. Nhấp chọn **Rules** dưới mục Resolver, chọn **Create rule**:
   - **Name:** Nhập `myS3Rule`.
   - **Rule type:** Chọn **Forward**.
   - **Domain name:** Nhập `s3.ap-southeast-1.amazonaws.com`.
   - **VPC:** Chọn `VPC On-prem`.
   - **Outbound endpoint:** Chọn `VPCOnpremOutboundEndpoint`.
   - **Target IP Addresses:** Nhập 2 IP Private của Inbound Endpoint đã lưu.
3. Nhấp **Submit**.

---

### 3. Kiểm thử phân giải DNS từ EC2 On-prem

Kết nối lại vào EC2 **Test-Interface-Endpoint** và thực thi lệnh kiểm tra DNS:

```bash
dig +short s3.ap-southeast-1.amazonaws.com
```

Kết quả trả về chính là 2 địa chỉ IP Private của Interface Endpoint. Bây giờ, tôi có thể chạy lệnh CLI tiêu chuẩn của AWS mà không cần tham số `--endpoint-url` nữa:

```bash
aws s3 ls s3://j2car-media-bucket-571210199437
```
Quá trình phân giải DNS nội bộ đã hoạt động hoàn hảo!
