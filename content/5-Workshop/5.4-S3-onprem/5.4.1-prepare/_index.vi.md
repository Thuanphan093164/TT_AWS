---
title: "Chuẩn bị môi trường"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 5.4.1. </b> "
---

## Chuẩn Bị Môi Trường Giả Lập & Cấu Hình VPN Route

Để mô phỏng kết nối từ on-premises của J2Car AutoParts lên AWS Cloud, tôi đã cấu hình một đường truyền Site-to-Site VPN sử dụng strongSwan VPN trên một EC2 instance nằm ở phân vùng giả lập mạng On-prem.

---

### 1. Triển khai các tài nguyên Route 53 Resolver bằng CloudFormation

Tôi tiến hành deploy CloudFormation template để tạo hạ tầng phân giải DNS giả lập:
- **Route 53 Private Hosted Zone:** Quản lý bản ghi Alias cho PrivateLink S3 Endpoint.
- **Inbound Resolver Endpoint:** Nhận các yêu cầu phân giải DNS đi vào từ on-premises.
- **Outbound Resolver Endpoint:** Cho phép VPC On-prem chuyển tiếp yêu cầu DNS của S3 về VPC Cloud để xử lý.

```bash
aws cloudformation create-stack \
  --stack-name J2Car-Resolver-Endpoints \
  --template-body file://j2car-resolver.yaml \
  --region ap-southeast-1
```

---

### 2. Cấu hình bảng định tuyến Route Table cho Private On-prem

Để định tuyến toàn bộ lưu lượng hướng về AWS Cloud đi qua strongSwan VPN Gateway:

1. Mở dịch vụ **Amazon EC2 Console**.
2. Tìm EC2 instance có tên `infra-vpngw-test` (VPN Gateway của On-premises), sao chép **Instance ID** của nó.
3. Chuyển sang dịch vụ **Amazon VPC Console**, nhấp chọn **Route Tables**.
4. Chọn bảng định tuyến **RT Private On-prem**, nhấp chọn tab **Routes** và chọn **Edit Routes**.
5. Nhấp **Add route**:
   - **Destination:** Nhập dải CIDR của Cloud VPC (`10.0.0.0/16`).
   - **Target:** Chọn **Instance** và dán ID của instance `infra-vpngw-test` mà bạn vừa sao chép.
6. Nhấp **Save changes** để lưu cấu hình.

Tuyến đường VPN kết nối an toàn từ on-premises tới đám mây AWS đã được thiết lập hoàn tất.
