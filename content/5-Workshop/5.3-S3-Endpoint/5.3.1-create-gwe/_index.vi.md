---
title: "Tạo Gateway Endpoint"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 5.3.1. </b> "
---

## Tạo S3 VPC Gateway Endpoint

Tôi tiến hành khởi tạo và liên kết Gateway Endpoint cho S3 vào bảng định tuyến của phân vùng Private nhằm định tuyến nội bộ dữ liệu của J2Car AutoParts.

---

### Các bước cấu hình trên AWS Console

1. Mở dịch vụ **Amazon VPC Console** tại vùng Singapore (`ap-southeast-1`).
2. Trên thanh menu điều hướng bên trái, nhấp chọn **Endpoints**, sau đó nhấp **Create Endpoint**.
3. Tại giao diện cấu hình khởi tạo Endpoint:
   - **Name tag:** Nhập tên `s3-gwe`.
   - **Service category:** Chọn **AWS services**.
   - **Services:** Nhập tìm kiếm `s3` và chọn dịch vụ có Type là **Gateway** (`com.amazonaws.ap-southeast-1.s3`).
   - **VPC:** Chọn VPC chính của dự án `J2Car-workshop-VPC` từ menu thả xuống.
   - **Configure route tables:** Chọn Route Table liên kết với Private Subnets (Route Table phụ trách định tuyến cho Private Subnet AZ1 và AZ2 chứa ECS Backend).
   - **Policy:** Chọn **Full Access** (Chúng ta sẽ giới hạn bảo mật bằng Endpoint Policy ở các bước tiếp theo).
4. Nhấp **Create endpoint** để hoàn tất khởi tạo.

---

### Minh Chứng Thực Tế Trên AWS Console

Sau khi khởi tạo thành công, tôi truy cập VPC Dashboard để xác thực trạng thái hoạt động:

#### Trạng thái Endpoint hoạt động ổn định (`4-endpoints.png`):
![S3 VPC Endpoint](/images/5-Workshop/4-endpoints.png)
