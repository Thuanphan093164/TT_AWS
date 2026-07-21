---
title: "5.4. Lưu trữ S3 & VPC Gateway Endpoints"
date: 2024-01-01
weight: 4
chapter: false
pre: " <b> 5.4. </b> "
---

# Bước 3: Lưu trữ S3 & VPC Gateway Endpoints cho S3

Lớp lưu trữ quản lý các tệp tin tĩnh và tệp tin đa phương tiện của dự án J2Car AutoParts. Chúng ta sử dụng dịch vụ lưu trữ đối tượng **Amazon S3** và tối ưu luồng dữ liệu thông qua **VPC Gateway Endpoint** để giảm thiểu chi phí băng thông NAT Gateway.

---

### Hướng dẫn Thực hành Từng bước

#### 1. Khởi tạo Amazon S3 Buckets Phân Tách
Chúng ta sẽ tạo 2 buckets riêng biệt cho 2 mục đích sử dụng khác nhau:
1. **S3 Web Hosting Bucket (Chứa Frontend tĩnh):**
   * Truy cập dịch vụ **Amazon S3** và nhấp **Create Bucket**.
   * **Bucket Name:** `j2car-frontend-web-bucket`
   * **Object Ownership:** ACLs Disabled.
   * **Block Public Access:** Tạm thời bỏ chọn (để phục vụ Static Website Hosting kiểm thử. Trong thực tế sẽ bật Block Public Access và sử dụng CloudFront OAC để bảo mật tối đa).
   * Nhấp **Create bucket**.
2. **S3 Media Bucket (Chứa hình ảnh sản phẩm):**
   * Nhấp **Create Bucket**.
   * **Bucket Name:** `j2car-media-storage-bucket`
   * **Block Public Access:** Giữ **Bật (Enabled)** hoàn toàn. Tất cả hình ảnh phụ tùng tải lên từ trang Admin sẽ được lưu giữ riêng tư, không công khai ra Internet.
   * Nhấp **Create bucket**.

![Khởi tạo các S3 Buckets thành công](/images/5-Workshop/5.4-Storage/14-s3.png)

#### 2. Kết nối Hình ảnh Bảo mật qua Presigned URLs
Để hiển thị ảnh an toàn từ Private S3 Media Bucket mà không cần mở công khai bucket:
* Backend NodeJS tích hợp AWS SDK S3 để tạo **Presigned URL** (đường dẫn tạm thời có thời hạn hết hạn ngắn, ví dụ: 15 phút).
* Khi client yêu cầu xem ảnh, Backend sinh Presigned URL động này và trả về cho client hiển thị, đảm bảo bảo mật tuyệt đối cho dữ liệu media của doanh nghiệp.

#### 3. Tạo VPC Gateway Endpoint cho S3 (Tiết kiệm Chi Phí NAT)
* Mặc định, các ECS tasks backend chạy trong Private Subnets khi gọi AWS SDK tới S3 sẽ đi qua Internet và tốn phí truyền tải của NAT Gateway. Tạo VPC Endpoint giúp định tuyến lưu lượng đi qua mạng lưới nội bộ của AWS hoàn toàn miễn phí.
1. Truy cập console **VPC**, chọn mục **Endpoints** ở menu bên trái.
2. Click **Create Endpoint**.
3. Cấu hình chi tiết:
   * **Name:** `j2car-s3-gateway-endpoint`
   * **Service Category:** Chọn **AWS services**.
   * **Service Name:** Tìm kiếm và chọn `com.amazonaws.ap-southeast-1.s3` với Type là **Gateway**.
   * **VPC:** Chọn `J2Car-Production-VPC`.
   * **Route Tables:** Chọn các Route Tables tương ứng với Private Subnet 1 và Private Subnet 2 (vùng Compute chạy Backend).
4. Nhấp **Create Endpoint**.

---

### Kiểm tra kết quả
1. Đi tới bảng định tuyến của các Private Subnets trong VPC Console.
2. Xem tab **Routes**, xác nhận có bản ghi tự động được thêm:
   `pl-xxxxxxxx (AWS Prefix List cho S3) -> vpce-xxxxxxxx`
3. Điều này đảm bảo toàn bộ tác vụ tải ảnh lên S3 hoặc sinh URL của ECS Backend sẽ được thực hiện trực tiếp trong mạng nội bộ, tối ưu hóa tốc độ và triệt tiêu phí NAT Gateway.

> [!TIP]
> Việc cấu hình VPC Gateway Endpoint cho S3 giúp giảm thiểu lên đến hơn 90% chi phí xử lý dữ liệu (Data Processing Fee) trên NAT Gateway khi hệ thống có lượng lớn hình ảnh phụ tùng tải lên và hiển thị mỗi ngày.
