---
title: "Worklog Tuần 6"
date: 2024-01-01
weight: 6
chapter: false
pre: " <b> 1.6. </b> "
---

## Mục Tiêu Tuần 6

- Thực hành giám sát hệ thống AWS với **Amazon CloudWatch**: cấu hình Metrics, Logs, Alarms và Dashboard.
- Tìm hiểu các gói hỗ trợ của AWS Support và thực hành tạo/quản lý Support Case.
- Triển khai kiến trúc **Hybrid DNS** tích hợp hệ thống on-premises với AWS thông qua Route 53 Resolver và AWS Managed Microsoft AD.

---

## Kế Hoạch Công Việc

| Thứ | Công việc | Ngày bắt đầu | Ngày hoàn thành | Tài liệu tham khảo |
|---|---|---|---|---|
| 2 | Tìm hiểu Amazon CloudWatch và chuẩn bị môi trường thực hành. Nghiên cứu Metrics, các biểu thức toán học (Math Expressions) và Dynamic Labels. | 25/05/2026 | 25/05/2026 | [CloudWatch Docs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html) |
| 3 | Thực hành CloudWatch Logs và Logs Insights, tạo Metric Filter, Alarm, Dashboard và dọn dẹp tài nguyên. | 26/05/2026 | 26/05/2026 | [CloudWatch Logs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/WhatIsCloudWatchLogs.html) |
| 4 | Tìm hiểu các gói AWS Support, truy cập AWS Support Console và nghiên cứu các loại Support Request. | 27/05/2026 | 27/05/2026 | [AWS Support Plans](https://aws.amazon.com/premiumsupport/plans/) |
| 5 | Tạo Support Case, chọn mức độ nghiêm trọng (Severity) và theo dõi trạng thái xử lý. | 28/05/2026 | 28/05/2026 | [Case Management](https://docs.aws.amazon.com/awssupport/latest/user/case-management.html) |
| 6 | Chuẩn bị lab Hybrid DNS: tạo Key Pair, khởi tạo CloudFormation stack, cấu hình Security Group và kết nối RDGW. | 29/05/2026 | 29/05/2026 | [AWS Directory Service](https://docs.aws.amazon.com/directoryservice/latest/admin-guide/what_is.html) |
| 7 | Cấu hình DNS với Route 53 Resolver: tạo Outbound Endpoint, Resolver Rules, Inbound Endpoint, kiểm tra kết quả và dọn dẹp. | 30/05/2026 | 31/05/2026 | [Route 53 Resolver](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resolver-forwarding-outbound-queries.html) |

---

## Kết Quả Đạt Được

### 1. Thực Hành Amazon CloudWatch

#### 1.1. Khởi Tạo Môi Trường (CloudFormation)

- Triển khai thành công CloudFormation template để tạo cấu trúc VPC, các EC2 Instance và IAM Policy cần thiết cho bài thực hành.
- Cấu hình và khởi chạy script sinh log nền (background log generator) trên EC2 Instance A thông qua **Systems Manager Run Command** — không cần SSH trực tiếp vào instance.
- Xác nhận stack được tạo thành công với trạng thái `CREATE_COMPLETE` trong AWS Console.

#### 1.2. Thao Tác Với CloudWatch Metrics

- Kiểm tra mức độ sử dụng tài nguyên (CPU, Network, Disk) trên các EC2 Instance đang chạy.
- Cấu hình **dual Y-axes** (hai trục Y) để so sánh đồng thời hai metric có đơn vị khác nhau (ví dụ: % CPU và số byte network) trên cùng một biểu đồ.
- Thêm **Horizontal Annotation** tại mốc CPU 5% để đánh dấu ngưỡng cảnh báo, đồng thời thêm **Vertical Annotation** ghi lại thời điểm bắt đầu job lúc 02:40 để truy vết sự kiện.

#### 1.3. Quản Lý CloudWatch Logs và Logs Insights

- Điều chỉnh cấu hình lưu trữ log cho nhóm `/ec2/linux/var/log/messages` từ **Never expire** xuống còn **1 tuần (7 ngày)** nhằm kiểm soát chi phí lưu trữ.
- Sử dụng **Logs Insights** để viết và chạy các câu query phân tích sự kiện theo thời gian thực, lọc các dòng chứa từ khóa `ERROR` từ hàng triệu dòng log.
- Tạo **Metric Filter** tên `PythonAppErrors` để tự động chuyển đổi các log lỗi của ứng dụng Python thành một metric số, phục vụ cho việc thiết lập Alarm tự động.

#### 1.4. Cấu Hình CloudWatch Alarm & SNS

- Tạo **SNS Topic** tên `Error_logs_reach_10` và đăng ký địa chỉ email để nhận thông báo cảnh báo tự động.
- Tạo **CloudWatch Alarm** tên `PythonApplicationErrorAlarm` được cài đặt kích hoạt khi tổng số lỗi vượt quá 10 trong vòng 1 phút. Khi Alarm chuyển sang trạng thái `ALARM`, SNS sẽ gửi email cảnh báo ngay lập tức.

#### 1.5. Xây Dựng CloudWatch Dashboard

- Tạo Dashboard tùy chỉnh tên `CloudWatch-Workshop` tổng hợp biểu đồ Metric Filter lỗi và widget trạng thái Alarm trên một màn hình duy nhất — giúp đội vận hành có cái nhìn toàn cảnh về tình trạng hệ thống.

---

### 2. Tổng Quan AWS Support

#### 2.1. Các Gói Hỗ Trợ AWS

Nghiên cứu và nắm rõ 5 gói AWS Support từ cơ bản đến nâng cao:

| Gói Support | Đặc điểm nổi bật | Chi phí |
|---|---|---|
| **Basic** | Hỗ trợ tài khoản và thanh toán, không có kỹ thuật | Miễn phí |
| **Developer** | Email kỹ thuật trong giờ làm việc | Từ $29/tháng |
| **Business** | Hỗ trợ 24/7 qua điện thoại, chat, email; SLA 1 giờ cho sự cố khẩn | Từ $100/tháng |
| **Enterprise On-Ramp** | Truy cập TAM (Technical Account Manager) dùng chung | Từ $5,500/tháng |
| **Enterprise** | TAM riêng, SLA 15 phút cho sự cố nghiêm trọng | Từ $15,000/tháng |

- Truy cập **AWS Support Console** và khám phá tính năng quản lý Support Case.
- Xem xét và cập nhật gói Support hiện tại của tài khoản thực hành.

#### 2.2. Tạo Support Case Thực Tế

- Thực hành tạo Support Case cho cả 2 loại: **Account & Billing** và **Technical**.
- Chọn mức độ nghiêm trọng phù hợp cho từng tình huống:
  - `General guidance` — câu hỏi tư vấn chung.
  - `System impaired` — hệ thống hoạt động chậm bất thường.
  - `Production system impaired` — hệ thống production bị ảnh hưởng.
  - `Production system down` — toàn bộ hệ thống sản xuất bị sập.
  - `Business/Mission critical system down` — sự cố nghiêm trọng ảnh hưởng trực tiếp đến doanh thu.
- Theo dõi trạng thái Case và quản lý phản hồi từ đội hỗ trợ AWS.

---

### 3. Lab Hybrid DNS – Route 53 Resolver

#### 3.1. Tạo Key Pair

- Tạo Key Pair tên `hybrid-DNS` (định dạng RSA, .pem) dùng để giải mã mật khẩu Administrator kết nối vào RDGW instance.

#### 3.2. Khởi Tạo CloudFormation Stack

- Tải template từ GitHub repository và deploy stack `HybridDNS` với các thông số:
  - Availability Zones: `ap-southeast-1a` và `ap-southeast-1c`
  - Key Pair: `hybrid-DNS`
  - Instance type: `t3.micro`
- Stack hoàn thành với trạng thái `CREATE_COMPLETE`, tự động tạo ra: VPC Multi-AZ, 2 Public Subnet, 2 Private Subnet, Internet Gateway, Route Table, Security Group, và EC2 Windows Server 2022 (RDGW).

#### 3.3. Cấu Hình Security Group

- Truy cập Security Group có mô tả "Enable RDP access from Internet".
- Xóa các inbound rule thừa (Port 3391, Port 443).
- Giới hạn **RDP (3389)** và **ICMP** chỉ cho phép từ IP của máy tính thực hành — thay vì mở toàn bộ Internet (`0.0.0.0/0`).

#### 3.4. Kết Nối Tới RDGW

- Tải file RDP từ EC2 Console và giải mã mật khẩu Administrator sử dụng file `hybrid-DNS.pem`.
- Kết nối thành công vào Windows Server 2022 thông qua Remote Desktop Protocol.

#### 3.5. Triển Khai AWS Managed Microsoft AD

- Cấu hình thư mục Microsoft AD với thông số:
  - Directory DNS name: `onprem.example.com`
  - NetBIOS name: `onprem`
  - Edition: Standard
  - VPC/Subnets: Private Subnet 1A và Private Subnet 2A
- Sau khoảng 20 phút, thư mục chuyển sang trạng thái **Active** với 2 địa chỉ DNS: `10.0.25.100` và `10.0.44.109`.

#### 3.6. Cấu Hình Route 53 Resolver

**Outbound Endpoint:**
- Tạo endpoint tên `outbound-endpoint` (IPv4, Do53) gắn với 2 Private Subnet, trạng thái `Operational`.
- Cho phép Route 53 Resolver chuyển tiếp DNS query từ AWS ra hệ thống DNS on-premises (Microsoft AD).

**Resolver Rule:**
- Tạo rule tên `onprem-rule` loại `FORWARD` cho domain `onprem.example.com`.
- Target IPs: `10.0.25.100:53` và `10.0.44.109:53`.
- Liên kết rule với VPC HybridDNS để mọi DNS query cho domain `onprem.example.com` đều được chuyển tiếp tới AD DNS server.

**Inbound Endpoint:**
- Tạo endpoint tên `inbound-endpoint` (IPv4, Do53) — cho phép hệ thống DNS on-premises gửi query ngược vào Route 53 Resolver để phân giải Private Hosted Zone trong AWS.

#### 3.7. Kiểm Tra Kết Quả

- Từ RDGW server, chạy lệnh `nslookup` và `Resolve-DnsName` trong PowerShell:
```powershell
nslookup onprem.example.com
Resolve-DnsName onprem.example.com
```
- Kết quả trả về địa chỉ IP chính xác — xác nhận luồng Hybrid DNS hoạt động đúng cấu hình.

#### 3.8. Dọn Dẹp Tài Nguyên

Xóa tài nguyên theo đúng thứ tự để tránh dependency error:
`Inbound Endpoint` → `Disassociate & Delete Resolver Rule` → `Outbound Endpoint` → `AWS Managed Microsoft AD` → `CloudFormation Stack HybridDNS` → `Key Pair`.

---

## Tổng Kết Tuần 6

Tuần 6 tập trung vào ba mảng kỹ năng quan trọng: **giám sát hệ thống (Observability)** với CloudWatch, **quản lý hỗ trợ kỹ thuật (Support Management)** với AWS Support, và **tích hợp hạ tầng lai (Hybrid Infrastructure)** với Route 53 Resolver + Microsoft AD. Các kiến thức và kỹ năng thực hành trong tuần này đặt nền tảng vững chắc cho việc vận hành hệ thống production trên môi trường AWS thực tế.
