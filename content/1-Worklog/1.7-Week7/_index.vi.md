---
title: "Worklog Tuần 7"
date: 2024-01-01
weight: 7
chapter: false
pre: " <b> 1.7. </b> "
---

## Mục Tiêu Tuần 7

- Thực hành quản trị tài nguyên AWS thông qua **AWS CLI** (Command Line Interface).
- Tìm hiểu và cấu hình **AWS Organizations** để quản lý đa tài khoản, tổ chức OU (Organizational Units).
- Triển khai **IAM Identity Center** để kiểm soát truy cập tập trung và phân quyền theo thời gian.
- Thực hành tự động hóa sao lưu dữ liệu với **AWS Backup**.

---

## Kế Hoạch Công Việc

| Thứ | Công việc | Ngày bắt đầu | Ngày hoàn thành | Tài liệu tham khảo |
|---|---|---|---|---|
| 2 | Cài đặt và cấu hình AWS CLI v2 trên máy tính. Thực hành xem tài nguyên qua CLI. | 01/06/2026 | 01/06/2026 | [AWS CLI Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) |
| 3 | Thực hành AWS CLI với Amazon S3 và Amazon SNS: tạo bucket, upload file, tạo topic và subscribe. | 02/06/2026 | 02/06/2026 | [CLI S3/SNS](https://docs.aws.amazon.com/cli/latest/userguide/cli-services-ec2.html) |
| 4 | Thực hành AWS CLI với IAM và VPC: tạo user, group, VPC, subnet, Internet Gateway và khởi chạy EC2. | 03/06/2026 | 03/06/2026 | [CLI IAM](https://docs.aws.amazon.com/cli/latest/userguide/cli-services-iam.html) |
| 5 | Tìm hiểu AWS Organizations: tạo tài khoản thành viên, cấu hình OU và mời tài khoản AWS bên ngoài. | 04/06/2026 | 04/06/2026 | [AWS Organizations](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_introduction.html) |
| 6 | Cấu hình truy cập tài khoản thành viên qua CLI, phân quyền theo thời gian (Time-based Access) và Customer Managed Policies trong IAM Identity Center. | 05/06/2026 | 05/06/2026 | [IAM Identity Center](https://docs.aws.amazon.com/singlesignon/latest/userguide/what-is.html) |
| 7 | Thực hành AWS Backup: chuẩn bị môi trường, tạo S3 bucket, triển khai hạ tầng và kiểm tra khôi phục dữ liệu. | 06/06/2026 | 06/06/2026 | [AWS Backup](https://docs.aws.amazon.com/aws-backup/latest/devguide/whatisbackup.html) |

---

## Kết Quả Đạt Được

### 1. Thực Hành AWS CLI (Lab 11)

#### 1.1. Giới Thiệu

AWS CLI (Command Line Interface) là công cụ mã nguồn mở cho phép tương tác trực tiếp với toàn bộ dịch vụ AWS thông qua dòng lệnh. Thay vì dùng tay trên Console, CLI giúp tự động hóa việc tạo tài nguyên, cấu hình hệ thống và tích hợp vào pipeline CI/CD một cách hiệu quả.

#### 1.2. Cài Đặt & Cấu Hình

- Cài đặt AWS CLI v2 trên Windows thông qua MSI installer.
- Xác nhận phiên bản sau khi cài:
```bash
aws --version
# Output: aws-cli/2.34.46 Python/3.14.4 Windows/11 exe/AMD64
```
- Cấu hình thông tin xác thực mặc định:
```bash
aws configure
# AWS Access Key ID: ****
# AWS Secret Access Key: ****
# Default region name: ap-southeast-1
# Default output format: json
```

#### 1.3. AWS CLI Với Amazon S3

- Tạo S3 bucket mới với tên unique:
```bash
aws s3 mb s3://j2car-lab-cli-2026 --region ap-southeast-1
```
- Bật tính năng Versioning cho bucket:
```bash
aws s3api put-bucket-versioning --bucket j2car-lab-cli-2026 \
  --versioning-configuration Status=Enabled
```
- Tạo file test và upload lên S3:
```bash
echo "Hello from AWS CLI Lab" > lab-test.txt
aws s3 cp lab-test.txt s3://j2car-lab-cli-2026/
```
- Kiểm tra danh sách object trong bucket:
```bash
aws s3 ls s3://j2car-lab-cli-2026/
```

#### 1.4. AWS CLI Với Amazon SNS

- Tạo SNS Topic loại Standard:
```bash
aws sns create-topic --name "j2car-alert-topic"
```
- Đăng ký email nhận thông báo từ topic:
```bash
aws sns subscribe \
  --topic-arn "arn:aws:sns:ap-southeast-1:ACCOUNT_ID:j2car-alert-topic" \
  --protocol email \
  --notification-endpoint "your-email@example.com"
```
- Xác nhận đăng ký qua email và kiểm tra topic trong SNS Dashboard.

#### 1.5. AWS CLI Với IAM

- Tạo group và user mới:
```bash
aws iam create-group --group-name "dev-team"
aws iam create-user --user-name "dev-member-1"
```
- Thêm user vào group:
```bash
aws iam add-user-to-group --user-name "dev-member-1" --group-name "dev-team"
```
- Tạo Access Key cho user:
```bash
aws iam create-access-key --user-name "dev-member-1"
```

#### 1.6. AWS CLI Với VPC

**Tạo VPC và Subnets:**
```bash
# Tạo VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16

# Tạo Public Subnet
aws ec2 create-subnet --vpc-id vpc-XXXXXXXX --cidr-block 10.0.1.0/24

# Tạo Private Subnet
aws ec2 create-subnet --vpc-id vpc-XXXXXXXX --cidr-block 10.0.2.0/24
```

**Gắn Internet Gateway:**
```bash
aws ec2 create-internet-gateway
aws ec2 attach-internet-gateway \
  --vpc-id vpc-XXXXXXXX \
  --internet-gateway-id igw-XXXXXXXX
```

#### 1.7. Khởi Chạy EC2 Qua CLI

```bash
# Tạo Security Group
aws ec2 create-security-group \
  --group-name "LabSG" \
  --description "Lab Security Group" \
  --vpc-id vpc-XXXXXXXX

# Mở cổng SSH
aws ec2 authorize-security-group-ingress \
  --group-id sg-XXXXXXXX --protocol tcp --port 22 --cidr 0.0.0.0/0

# Tạo Key Pair
aws ec2 create-key-pair \
  --key-name "LabKeyPair" \
  --query "KeyMaterial" \
  --output text > LabKeyPair.pem

# Khởi chạy EC2 instance
aws ec2 run-instances \
  --image-id ami-047126e50991d067b \
  --count 1 \
  --instance-type t3.micro \
  --key-name "LabKeyPair" \
  --security-group-ids sg-XXXXXXXX \
  --subnet-id subnet-XXXXXXXX \
  --associate-public-ip-address
```

> **Lưu ý kỹ thuật:** Trong môi trường AWS Academy Learner Sandbox, instance type `t2.micro` bị giới hạn. Phải chuyển sang `t3.micro` để khởi tạo thành công.

#### 1.8. Dọn Dẹp Tài Nguyên

Sau khi hoàn thành bài thực hành, xóa toàn bộ tài nguyên để tránh phát sinh chi phí: EC2 Instance → Security Group → Key Pair → Subnet → Route Table → Internet Gateway → VPC → S3 Bucket → SNS Topic → IAM User & Group.

---

### 2. AWS Organizations & IAM Identity Center (Lab 12)

#### 2.1. Cấu Hình AWS Organizations

**Tạo tài khoản thành viên trong Organization:**
- Từ Management Account, vào AWS Organizations → chọn **Add an AWS account**.
- Tạo tài khoản thành viên tên `production-account`.
- Giữ nguyên IAM Role mặc định `OrganizationAccountAccessRole` để sau này switch role qua lại.

**Tổ chức OU (Organizational Units):**
- Tạo các OU: `Security`, `Shared Services`, `Logging`, `Application`.
- Di chuyển tài khoản thành viên vào OU phù hợp để phân tách phạm vi quyền hạn.

**Mời tài khoản AWS bên ngoài:**
- Gửi lời mời bằng Account ID hoặc địa chỉ email.
- Tài khoản được mời chấp nhận từ Organizations Console.

**Chuyển Role sang tài khoản thành viên:**
- Từ Management Account, dùng chức năng Switch Role với `OrganizationAccountAccessRole` để quản lý tài nguyên tài khoản thành viên mà không cần đăng nhập riêng.

#### 2.2. AWS CLI Tích Hợp IAM Identity Center

```bash
aws configure sso
# Trình duyệt tự động mở OIDC device authorization flow
# CLI nhận về temporary credentials thông qua SSO portal
```

#### 2.3. Kiểm Soát Truy Cập Theo Thời Gian (Time-based Access)

Triển khai chính sách IAM sử dụng `aws:CurrentTime` để từ chối các hành động nhạy cảm trong khoảng thời gian cụ thể:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyTerminateOutsideWorkHours",
      "Effect": "Deny",
      "Action": "ec2:TerminateInstances",
      "Resource": "*",
      "Condition": {
        "DateGreaterThan": { "aws:CurrentTime": "2026-06-01T18:00:00Z" },
        "DateLessThan":    { "aws:CurrentTime": "2026-06-02T08:00:00Z" }
      }
    }
  ]
}
```

#### 2.4. Customer Managed Policies

- Permission Set trong IAM Identity Center có thể tham chiếu đến Customer Managed Policy đã tồn tại trong tài khoản thành viên.
- **Quan trọng:** Tên Policy trong tài khoản thành viên phải **khớp chính xác** với tên được tham chiếu trong Permission Set.

---

### 3. AWS Backup (Lab 13)

#### 3.1. Giới Thiệu

AWS Backup là dịch vụ quản lý sao lưu tập trung và tự động cho nhiều dịch vụ AWS: EBS Volumes, RDS Databases, DynamoDB Tables, EFS File Systems, và S3 Buckets — tất cả qua một giao diện duy nhất.

#### 3.2. Chuẩn Bị Môi Trường

**Tạo S3 bucket lưu artifacts:**
```bash
aws s3 mb s3://j2car-backup-lab-artifacts --region ap-southeast-1
aws s3 cp lambda_function.zip s3://j2car-backup-lab-artifacts/lambda_function.zip
```

**Triển khai CloudFormation stack:**
```bash
aws cloudformation create-stack \
  --stack-name "Backup-plan-lab" \
  --template-body "file://backup-lab.yaml" \
  --parameters \
    ParameterKey=AvailabilityZone,ParameterValue="ap-southeast-1a" \
    ParameterKey=NotificationEmail,ParameterValue="your-email@example.com" \
    ParameterKey=S3BucketName,ParameterValue="j2car-backup-lab-artifacts" \
    ParameterKey=S3KeyLambdaZip,ParameterValue="lambda_function.zip" \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM
```

> **Lưu ý:** Thay đổi instance type từ `t2.micro` sang `t3.micro` trong template để phù hợp với giới hạn của môi trường thực hành.

#### 3.3. Tạo Backup Vault & Backup Plan

```bash
# Tạo Backup Vault
aws backup create-backup-vault --backup-vault-name "J2CAR-BACKUP-VAULT"

# Tạo Backup Plan và gán tài nguyên theo Tag
# Tag: workload=j2car-production
```

#### 3.4. Cấu Hình Thông Báo Sự Kiện

```bash
aws backup put-backup-vault-notifications \
  --region ap-southeast-1 \
  --backup-vault-name "J2CAR-BACKUP-VAULT" \
  --backup-vault-events BACKUP_JOB_COMPLETED RESTORE_JOB_COMPLETED \
  --sns-topic-arn "arn:aws:sns:ap-southeast-1:ACCOUNT_ID:BackupNotificationTopic"
```

#### 3.5. Kiểm Tra Khôi Phục (Test Restore)

```bash
# Khởi chạy backup on-demand
aws backup start-backup-job \
  --backup-vault-name "J2CAR-BACKUP-VAULT" \
  --resource-arn "arn:aws:ec2:ap-southeast-1:ACCOUNT_ID:instance/i-XXXXXXXX" \
  --iam-role-arn "arn:aws:iam::ACCOUNT_ID:role/AWSServiceRoleForBackup"
```

- Theo dõi kết quả qua **CloudWatch Logs**.
- Xác nhận Backup Job hoàn thành, sau đó thực hiện Restore và kiểm tra tính toàn vẹn dữ liệu.

#### 3.6. Dọn Dẹp

Xóa theo thứ tự: Backup Selection → Backup Plan → Backup Vault → CloudFormation Stack → S3 Bucket.

---

## Tổng Kết Tuần 7

Tuần 7 củng cố kỹ năng vận hành AWS theo hướng tự động hóa và bảo mật: **AWS CLI** thay thế hoàn toàn thao tác thủ công trên Console, **AWS Organizations + IAM Identity Center** cung cấp mô hình quản trị đa tài khoản tập trung và an toàn, **AWS Backup** đảm bảo toàn vẹn dữ liệu với cơ chế sao lưu và khôi phục tự động.
