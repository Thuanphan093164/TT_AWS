---
title: "Kiểm thử Gateway Endpoint"
date: 2024-01-01
weight: 2
chapter: false
pre: " <b> 5.3.2. </b> "
---

## Kiểm Thử Kết Nối AWS S3 VPC Gateway Endpoint

Sau khi cấu hình Gateway Endpoint, tôi tiến hành kết nối vào một EC2 instance nằm trong Private Subnet của VPC Cloud và kiểm thử khả năng tải tệp tin lên S3.

---

### 1. Kết nối EC2 thông qua AWS Systems Manager (SSM) Session Manager

Nhằm bảo đảm bảo mật tối đa, các EC2 instances trong Private Subnets không được mở cổng SSH (port 22) và không có IP Public. Tôi sử dụng **AWS Session Manager** để truy cập trực tiếp bằng giao diện shell thông qua trình duyệt:

1. Mở dịch vụ **AWS Systems Manager Console**.
2. Tại thanh điều hướng bên trái, nhấp chọn **Session Manager** bên dưới mục *Node Management*.
3. Nhấp chọn **Start Session**, chọn EC2 instance có tên **Test-Gateway-Endpoint** (được khởi chạy trong Private Subnet của VPC Cloud).
4. Nhấn **Start Session** để mở tab dòng lệnh terminal.

---

### 2. Thực thi kiểm thử tải File lên S3

Tại cửa sổ dòng lệnh Session Manager, tôi chạy các lệnh sau để tạo một file dung lượng 1GB và tải lên S3:

```bash
# Di chuyển vào thư mục home của ssm-user
cd ~

# Khởi tạo tệp tin testfile.xyz có kích thước 1GB
fallocate -l 1G testfile.xyz

# Tải tệp tin lên S3 Media Bucket của J2Car
aws s3 cp testfile.xyz s3://j2car-media-bucket-571210199437
```

---

### 3. Minh Chứng Kết Quả Thực Tế Trên AWS Console

#### 3.1. Danh sách S3 Buckets chứa tệp tin đã tải lên thành công (`14-s3.png`):
![S3 Buckets thực tế](images/5-Workshop/14-s3.png)

#### 3.2. Trạng thái Route Table của Private Subnet
Tại tab **Route Tables** của VPC Cloud, tôi xác nhận một route mới đã được tự động thêm vào trỏ Prefix List của S3 (`pl-6fa54006`) tới Target là Gateway Endpoint ID `vpce-XXXXXXXX`. 

Quá trình tải file thành công mà không cần dùng Internet Gateway, chứng minh dữ liệu được truyền hoàn toàn qua luồng nội bộ bảo mật của AWS.
