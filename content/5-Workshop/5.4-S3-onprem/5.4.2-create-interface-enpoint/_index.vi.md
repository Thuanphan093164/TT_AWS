---
title: "Tạo S3 Interface Endpoint"
date: 2024-01-01
weight: 2
chapter: false
pre: " <b> 5.4.2. </b> "
---

## Khởi Tạo S3 Interface Endpoint (AWS PrivateLink)

Tôi tiến hành khởi tạo một **Interface Endpoint** cho S3 nằm trong VPC Cloud. Điểm cuối giao diện này sẽ cấp phát một địa chỉ IP nội bộ cố định cho S3 trong mỗi phân vùng Availability Zone, cho phép định tuyến dữ liệu từ VPN On-premises.

---

### Các bước cấu hình trên AWS Console

1. Mở dịch vụ **Amazon VPC Console** tại vùng Singapore (`ap-southeast-1`).
2. Trên thanh menu bên trái, chọn **Endpoints** và click **Create Endpoint**.
3. Tại giao diện cấu hình khởi tạo Endpoint:
   - **Name tag:** Nhập tên `s3-interface-endpoint`.
   - **Service category:** Chọn **AWS services**.
   - **Services:** Nhập tìm kiếm `s3` và chọn dịch vụ `com.amazonaws.ap-southeast-1.s3` có Type là **Interface**.
   - **VPC:** Chọn **J2Car-workshop-VPC** (Hãy chắc chắn chọn VPC Cloud và KHÔNG chọn VPC On-prem).
   - **Additional settings:** Đảm bảo **Enable DNS name** được bỏ chọn (chúng ta sẽ cấu hình phân giải DNS tùy biến thông qua Private Hosted Zone ở bước sau).
   - **Subnets:** Chọn 2 subnets tương ứng trong các Availability Zones: `ap-southeast-1a` và `ap-southeast-1b`.
   - **Security group:** Chọn nhóm bảo mật **SGforS3Endpoint** (đã được cấu hình mở cổng 443 HTTPS từ dải On-prem).
   - **Policy:** Giữ nguyên cấu hình mặc định **Full Access**.
4. Nhấp **Create endpoint** để tạo.

---

### Minh Chứng Thực Tế Trên AWS Console

Sau khi khởi tạo thành công, giao diện quản trị hiển thị trạng thái hoạt động:

#### Endpoint s3-interface-endpoint ở trạng thái Available:
![S3 Interface Endpoint thực tế](/images/5-Workshop/4-endpoints.png)
*(Trong danh sách sẽ xuất hiện thêm một dòng Endpoint có Type là Interface, liên kết với IP Private của VPC Cloud).*
