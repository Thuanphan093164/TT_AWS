---
title: "Worklog Tuần 3"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 1.3. </b> "
---
 

### Mục tiêu tuần 3

- Nắm vững khái niệm và thành phần chính của Amazon EC2 (Instance types, AMI, EBS, Key Pair, Security Group).
- Thực hành khởi tạo, cấu hình và quản lý EC2 trên cả Linux và Windows.
- Triển khai ứng dụng Node.js trên EC2 (Linux/Windows) và làm quen với các phương pháp kết nối từ xa (SSH / RDP / Session Manager).

### Kế hoạch công việc (tóm tắt)

| Ngày | Công việc chính | Bắt đầu | Hoàn thành |
| --- | ------------------------------------------------------------------------- | ------- | --------- |
| 2 | Tổng quan về Amazon EC2: Instance types, AMI, Key Pair, Snapshot | 05/04/2026 | 05/04/2026 |
| 3 | Chuẩn bị môi trường EC2: tạo VPC/Security Group cho Linux và Windows | 05/05/2026 | 05/05/2026 |
| 4 | Khởi tạo Windows EC2 và kết nối RDP | 05/06/2026 | 05/06/2026 |
| 5 | Khởi tạo Linux EC2 và kết nối SSH; quản lý EBS snapshot | 05/07/2026 | 05/07/2026 |
| 6 | Thực hành nâng cao: tạo Custom AMI, khởi tạo từ AMI, xử lý mất keypair | 05/08/2026 | 05/08/2026 |
| 7 | Triển khai Node.js trên EC2 (Linux/Windows), cấu hình LAMP/Node, kiểm thử | 05/09/2026 | 05/10/2026 |

### Kết quả chính

- Hiểu cơ chế hoạt động của EC2 và vai trò của AMI/EBS/KeyPair/SecurityGroup.
- Khởi tạo và cấu hình thành công EC2 cho cả Linux và Windows.
- Tạo Snapshot EBS, xây dựng Custom AMI và khởi tạo instance từ AMI.
- Triển khai được ứng dụng Node.js trên EC2 và xác minh kết nối; thực hành khôi phục truy cập khi mất keypair.

### Chi tiết thực hành (không dùng tên người khác, không chèn ảnh)

1) Tổng quan lab và mục tiêu

- Lab mô phỏng triển khai hai EC2: một chạy Amazon Linux, một chạy Microsoft Windows Server. Mạng và bảo mật được cấu hình qua VPC và Security Groups độc lập để tách biệt quyền truy cập.

2) Chuẩn bị môi trường

2.1 Tạo VPC cho Linux (CLI mẫu)

```bash
# Tạo VPC
VPC_LINUX=$(aws ec2 create-vpc --cidr-block 10.20.0.0/16 --query 'Vpc.VpcId' --output text)
aws ec2 create-tags --resources $VPC_LINUX --tags Key=Name,Value=training-linux-vpc
```

2.2 Tạo VPC cho Windows (CLI mẫu)

```bash
VPC_WIN=$(aws ec2 create-vpc --cidr-block 10.21.0.0/16 --query 'Vpc.VpcId' --output text)
aws ec2 create-tags --resources $VPC_WIN --tags Key=Name,Value=training-windows-vpc
```

2.3 Tạo Security Group cho Linux & Windows (CLI mẫu)

```bash
# Linux SG: cho phép SSH, HTTP, HTTPS, MySQL, port ứng dụng (ví dụ 5000)
LINUX_SG=$(aws ec2 create-security-group --group-name training-linux-sg --description "Linux SG" --vpc-id $VPC_LINUX --query 'GroupId' --output text)
aws ec2 authorize-security-group-ingress --group-id $LINUX_SG --protocol tcp --port 22 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $LINUX_SG --protocol tcp --port 80 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $LINUX_SG --protocol tcp --port 443 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $LINUX_SG --protocol tcp --port 5000 --cidr 0.0.0.0/0 || true

# Windows SG: cho phép RDP (3389), HTTP, HTTPS
WIN_SG=$(aws ec2 create-security-group --group-name training-windows-sg --description "Windows SG" --vpc-id $VPC_WIN --query 'GroupId' --output text)
aws ec2 authorize-security-group-ingress --group-id $WIN_SG --protocol tcp --port 3389 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $WIN_SG --protocol tcp --port 80 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $WIN_SG --protocol tcp --port 443 --cidr 0.0.0.0/0
```

3) Khởi tạo Windows EC2 và kết nối RDP (tóm tắt)

- Tạo instance chọn AMI Windows Server (phiên bản tương ứng), tạo keypair mới, gán vào `training-windows-sg` và bật public IP cho subnet công cộng.
- Lấy mật khẩu Administrator bằng file `.pem` đã tải khi tạo keypair, sử dụng Remote Desktop để kết nối.

4) Khởi tạo Linux EC2 và kết nối SSH (tóm tắt)

- Tạo instance chọn AMI Amazon Linux 2023, tạo keypair `kp-linux`, gán `training-linux-sg`, bật public IP.
- Kết nối bằng SSH: `ssh -i kp-linux.pem ec2-user@<Public-IP>` hoặc cấu hình VS Code Remote-SSH.

5) Quản lý EBS và Snapshot

- Tạo snapshot từ volume để backup: `aws ec2 create-snapshot --volume-id $VOLUME_ID --description "backup-$(date +%F)"`.
- Dùng snapshot để tạo volume mới hoặc làm nguồn tạo AMI.

6) Tạo Custom AMI và khởi tạo từ AMI

- Trên Windows: chạy Sysprep rồi tạo AMI từ instance đã Sysprep.
- Trên Linux: tạo image từ instance bằng Console hoặc CLI: `aws ec2 create-image --instance-id $INSTANCE_ID --name "custom-linux-ami"`.

7) Triển khai Node.js trên Linux (tóm tắt các bước)

- Cài đặt môi trường: `sudo dnf update -y` và cài `git`, `node` (qua nvm) và `nginx` hoặc `httpd` nếu cần.
- Clone mã nguồn (nếu có) vào `/home/ec2-user/app`, cài `npm install`, cấu hình file `.env` cho kết nối DB.
- Khởi chạy ứng dụng: `npm start` hoặc sử dụng `pm2`/systemd để chạy nền.

8) Các thao tác phục hồi khi mất Key Pair

- Tùy chọn 1: Sử dụng Session Manager (SSM) — gán IAM role `AmazonSSMManagedInstanceCore` và bật các endpoint cần thiết.
- Tùy chọn 2: Tạo AMI từ instance hiện tại (nếu còn quyền) và khởi tạo instance mới với keypair khác.

9) Kiểm tra và xác nhận

- Kiểm tra instance: `aws ec2 describe-instances --filters Name=vpc-id,Values=$VPC_LINUX,$VPC_WIN`
- Kiểm tra status: console shows 2/2 checks for Linux, and appropriate Windows checks.

Ghi chú: tất cả tên tài nguyên sử dụng tiền tố `training-` hoặc biến placeholder; không giữ tên/ảnh của người khác. Nếu cần, mình sẽ thêm các lệnh CLI chi tiết hơn cho từng mục cụ thể.



