---
title: "Bản đề xuất"
date: 2024-01-01
weight: 2
chapter: false
pre: " <b> 2. </b> "
---

# BẢN ĐỀ XUẤT DỰ ÁN: J2CAR AUTOPARTS

---

## 1. Tóm Tắt Điều Hành (Executive Summary)

**J2Car AutoParts** là một hệ thống thương mại điện tử chuyên biệt về phụ tùng ô tô, được thiết kế và triển khai hoàn toàn trên nền tảng **Amazon Web Services (AWS)**. Nền tảng tích hợp đầy đủ các tính năng hiện đại bao gồm: tra cứu phụ tùng bằng số VIN, giỏ hàng và đặt hàng trực tuyến, chat hỗ trợ khách hàng thời gian thực (Real-time), và tích hợp đa cổng thanh toán (VNPay, MoMo, Stripe).

Kiến trúc được xây dựng theo mô hình **3-Tier Architecture (Presentation - Logic - Data)**, triển khai đa vùng sẵn sàng **(Multi-AZ: AZ1 & AZ2)** trong Region **`ap-southeast-1` (Singapore)** nhằm đảm bảo:
- **High Availability:** Hệ thống hoạt động liên tục 24/7, không gián đoạn dù có sự cố tại một AZ.
- **Scalability:** Tự động mở rộng tài nguyên theo lưu lượng thực tế, xử lý đỉnh tải Flash Sale mà không cần can thiệp thủ công.
- **Security:** Tuân thủ chặt chẽ tiêu chuẩn **AWS Well-Architected Framework**, áp dụng nguyên tắc Zero Trust và Least Privilege.
- **Cost Optimization:** Kiến trúc Serverless (Fargate, Lambda) giúp chỉ trả phí cho tài nguyên thực sự sử dụng.

---

## 2. Tuyên Bố Vấn Đề (Problem Statement)

### 2.1. Vấn Đề Hiện Tại
- Hệ thống bán phụ tùng ô tô truyền thống yêu cầu nhân viên tư vấn tra cứu thủ công, gây chậm trễ và sai sót.
- Khách hàng không tự tra được phụ tùng phù hợp với xe của mình (thiếu công cụ giải mã VIN).
- Không có kênh giao tiếp Real-time giữa khách hàng và đội ngũ hỗ trợ kỹ thuật.
- Quy trình thanh toán còn thủ công, rủi ro mất dữ liệu hóa đơn khi hệ thống gặp sự cố.

### 2.2. Giải Pháp Đề Xuất
J2Car AutoParts giải quyết toàn bộ các vấn đề trên thông qua nền tảng web hiện đại với Backend phân tán, xử lý bất đồng bộ và tích hợp sâu với hệ sinh thái AWS.

### 2.3. Lợi Ích & ROI
- Tự động hóa 100% quy trình tra cứu phụ tùng, đặt hàng và thanh toán.
- Giảm thiểu sai sót nghiệp vụ nhờ luồng xử lý đơn hàng tự động qua SQS + Lambda.
- Nâng cao trải nghiệm khách hàng nhờ Chat Real-time và thông báo trạng thái đơn hàng tức thì.
- Kiến trúc Pay-as-you-go tối ưu chi phí vận hành dài hạn.

---

## 3. Kiến Trúc Giải Pháp (Solution Architecture)

Dưới đây là sơ đồ kiến trúc hệ thống tổng thể của J2Car trên nền tảng AWS:

![Kiến Trúc Hệ Thống J2Car AutoParts](images/kientruchethong.png)

### 3.1. Thiết Kế Mạng (Network Design)

Toàn bộ hạ tầng được triển khai bên trong **Amazon VPC** tên `J2Car-Production-VPC` với dải địa chỉ CIDR `10.0.0.0/16`, phân tách thành các lớp mạng rõ ràng và trải rộng trên 2 Availability Zones để đảm bảo tính sẵn sàng cao:

| Subnet | CIDR | Loại | AZ | Chứa dịch vụ |
|---|---|---|---|---|
| Public Subnet 1 | 10.0.1.0/24 | Public | AZ1 | NAT Gateway 1, ALB |
| Public Subnet 2 | 10.0.2.0/24 | Public | AZ2 | NAT Gateway 2, ALB |
| Private Subnet 1 | 10.0.3.0/24 | Private | AZ1 | ECS Backend Task 1 |
| Private Subnet 2 | 10.0.4.0/24 | Private | AZ2 | ECS Backend Task 2 |
| Private Subnet 3 | 10.0.5.0/24 | Private | AZ1 | DocumentDB Primary, ElastiCache Primary |
| Private Subnet 4 | 10.0.6.0/24 | Private | AZ2 | DocumentDB Replica, ElastiCache Replica |
| Private Subnet 5 | 10.0.7.0/24 | Private | Integration | AWS Lambda, Amazon SQS |

### 3.2. Các Dịch Vụ AWS Sử Dụng (AWS Services)

| Nhóm | Dịch Vụ | Mục đích |
|---|---|---|
| Networking | Amazon VPC, ALB, NAT Gateway | Hạ tầng mạng, phân luồng traffic |
| CDN & Security | Amazon CloudFront, AWS WAF | Phân phối nội dung, tường lửa |
| Compute | Amazon ECS (Fargate), AWS Lambda | Chạy Backend, xử lý Webhook |
| Container Registry | Amazon ECR | Lưu Docker Images của Backend |
| Storage | Amazon S3 (Web Bucket, Media Bucket) | Host Frontend, lưu trữ media |
| Database | Amazon DocumentDB | CSDL NoSQL chính (MongoDB compatible) |
| Cache | Amazon ElastiCache (Redis) | Session, Cache, Socket.io Pub/Sub |
| Messaging | Amazon SQS | Hàng đợi thanh toán bất đồng bộ |
| VPC Endpoint | S3 Gateway Endpoint | Kết nối S3 nội bộ, miễn phí data transfer |
| Security | AWS WAF, AWS KMS, AWS Secrets Manager, AWS IAM | Bảo mật đa lớp |
| Monitoring | Amazon CloudWatch, Amazon SNS | Giám sát, cảnh báo sự cố |
| Backup | AWS Backup | Sao lưu tự động DocumentDB |

---

### 3.3. Luồng Dữ Liệu Chính (Data Flows)

**A. Luồng Truy Cập Của Người Dùng (User Traffic Flow)**
```
End User (HTTPS)
  → Amazon CloudFront (CDN Cache)
      ├─► S3 Web Bucket         [Giao diện React SPA]
      ├─► S3 Media Bucket       [Ảnh sản phẩm, phụ tùng]
      └─► AWS WAF
            → Application Load Balancer (ALB)
                ├─► ECS Backend Task 1 (AZ1) [Node.js + Express]
                └─► ECS Backend Task 2 (AZ2) [Node.js + Express]
                        ├─► ElastiCache Redis  [Session / Cache / Socket]
                        └─► Amazon DocumentDB  [CSDL chính]
```

**B. Luồng Tải Ảnh Sản Phẩm (Upload Flow - FinOps Optimized)**
```
Admin tải ảnh
  → ECS Backend         [Tạo Pre-signed URL]
  → Trả URL về Browser  [Không qua NAT Gateway]
  → Browser tải file thẳng vào S3 Media Bucket qua S3 VPC Gateway Endpoint
```

**C. Luồng Thanh Toán Bất Đồng Bộ (Payment Flow)**
```
[1] Khách đặt hàng
  → ECS Backend gọi API Cổng thanh toán (qua NAT Gateway)
  ← Nhận URL Link thanh toán → Trả về cho Khách

[2] Khách thanh toán xong
  → Cổng thanh toán gọi IPN Webhook về hệ thống
  → AWS WAF → ALB → AWS Lambda (Webhook Handler)
  → Lambda xác thực checksum hóa đơn
  → Đẩy "Hóa đơn sạch" vào Amazon SQS (Payment Queue)

[3] ECS Backend Worker rút Queue từ SQS
  → Cập nhật trạng thái đơn hàng vào DocumentDB
  → Phát thông báo Real-time qua Socket.io (Redis Pub/Sub)
  → Khách hàng nhận thông báo "Thanh toán thành công" ngay trên Web
```

---

### 3.4. Chi Tiết Từng Lớp Kiến Trúc

#### 3.4.1. Lớp Biên & Phân Phối Nội Dung (Edge & Content Delivery)

- **Amazon S3 — Web Bucket:** Host mã nguồn tĩnh React SPA của J2Car. Mọi request tới giao diện web đều được phục vụ từ S3 thông qua CloudFront, không tốn tài nguyên Backend.
- **Amazon S3 — Media Bucket:** Kho lưu trữ hình ảnh phụ tùng, ảnh sản phẩm. Được kết nối qua **S3 Gateway VPC Endpoint** để Backend upload ảnh nội bộ hoàn toàn miễn phí và bảo mật.
- **Amazon CloudFront:** Mạng CDN toàn cầu phân phối nội dung tĩnh từ S3 với độ trễ cực thấp cho người dùng tại Đông Nam Á. Đồng thời đóng vai trò là **Single Entry Point** duy nhất của toàn hệ thống — tất cả traffic từ Internet đều đi qua đây trước khi được phân luồng tới S3 hoặc ALB.
- **AWS WAF (Web Application Firewall):** Gắn trực tiếp với CloudFront và ALB, bảo vệ chủ động chống lại:
  - OWASP Top 10 (SQL Injection, XSS, CSRF...)
  - DDoS Layer 7 (HTTP Flood)
  - Bot Traffic và Request Rate Limiting

#### 3.4.2. Lớp Mạng & Tính Toán (Network & Compute)

- **Application Load Balancer (ALB):**  Nằm tại Public Subnet trải dài cả AZ1 và AZ2, nhận traffic từ CloudFront sau khi qua WAF. Có 2 nhiệm vụ quan trọng:
  - **Cân bằng tải API:** Phân phối đều các request HTTP/HTTPS xuống các ECS Task theo thuật toán Round Robin.
  - **Định tuyến WebSocket (Socket.io):** Cấu hình **Sticky Sessions (Cookie-based)** đảm bảo một phiên WebSocket Chat của khách luôn được định tuyến về đúng một Backend Task, tránh đứt kết nối.
- **Amazon ECS Fargate (Backend Task 1 & 2):**
  - Chạy mã nguồn Backend J2Car viết bằng **Node.js + Express**.
  - Fargate là nền tảng Serverless Container — AWS quản lý toàn bộ máy chủ vật lý bên dưới. Nhóm phát triển chỉ cần tập trung vào mã nguồn ứng dụng.
  - Mỗi AZ chạy ít nhất 1 Task (`Backend Task 1` tại AZ1, `Backend Task 2` tại AZ2). Khi tải tăng, **Auto Scaling Group** tự động khởi tạo thêm nhiều Task mới.
  - Docker Image của Backend được lấy từ **Amazon ECR** (Elastic Container Registry) — kho Docker Image riêng tư và bảo mật của J2Car.
- **NAT Gateway 1 & 2:**
  - Được đặt tại Public Subnet của từng AZ (NAT GW 1 tại AZ1, NAT GW 2 tại AZ2).
  - Cho phép các ECS Backend (đang ở Private Subnet) gọi ra Internet để: Gọi API VIN Decoder (NHTSA), Tạo link thanh toán từ VNPay/MoMo/Stripe.
  - **Quan trọng:** Chặn hoàn toàn chiều ngược lại — không có bất kỳ kết nối nào từ Internet có thể chủ động truy cập vào Backend.

#### 3.4.3. Lớp Tích Hợp Thanh Toán (Integration Tier — Serverless)

*Được đặt riêng biệt tại Private Subnet 5 (Integration Tier), cô lập hoàn toàn với lớp Compute chính.*

- **AWS Lambda — Webhook Handler:**
  - Hàm Serverless, chỉ chạy khi được kích hoạt bởi IPN Callback từ cổng thanh toán ngoài.
  - Thực hiện: Xác thực chữ ký bảo mật (HMAC/Checksum) của từng hóa đơn, lọc bỏ các callback giả mạo, định dạng lại dữ liệu hóa đơn và đẩy vào SQS.
  - Ưu điểm: Hoàn toàn không chiếm tài nguyên của ECS Backend chính, không bao giờ bị nghẽn dù có hàng ngàn callback cùng lúc.
- **Amazon SQS — Payment Queue:**
  - Đóng vai trò bộ đệm (Buffer) giữa Lambda và Backend Worker.
  - Đảm bảo **không bao giờ mất dữ liệu hóa đơn** — ngay cả khi toàn bộ ECS Backend bị sập, SQS vẫn giữ nguyên các message thanh toán. Khi Backend khởi động lại, tất cả sẽ được xử lý tuần tự.
  - **ECS Backend đóng vai trò Worker:** Liên tục polling SQS, rút message ra, chốt đơn hàng trong DocumentDB và phát thông báo Real-time.

#### 3.4.4. Lớp Lưu Trữ Dữ Liệu (Data Tier)

*Đây là lớp sâu nhất và bảo mật nhất trong kiến trúc — chỉ nhận kết nối từ Security Group của Backend ECS.*

- **Amazon ElastiCache (Redis) — Primary Node (AZ1) & Replica Node (AZ2):**
  - **Session Store:** Lưu trữ session đăng nhập của người dùng, giải phóng Backend khỏi việc xử lý trạng thái.
  - **Cache-Aside:** Cache danh sách phụ tùng, danh mục sản phẩm bán chạy, kết quả tra cứu VIN — giảm thiểu truy vấn đến DocumentDB.
  - **Giỏ hàng tạm thời (Cart):** Lưu giỏ hàng chưa checkout của từng phiên.
  - **Redis Pub/Sub Adapter:** Đây là thành phần then chốt cho tính năng Chat Real-time. Khi có 2 Backend Tasks chạy ở 2 AZ khác nhau, Redis đóng vai trò làm cầu nối — đảm bảo tin nhắn gửi lên Task 1 sẽ được broadcast tới khách hàng đang kết nối với Task 2, và ngược lại.
  - **Sync Replication** giữa Primary (AZ1) và Replica (AZ2) đảm bảo không mất dữ liệu khi AZ1 gặp sự cố.
- **Amazon DocumentDB (Primary Cluster — AZ1 & Replica Instance — AZ2):**
  - Cơ sở dữ liệu NoSQL chính của J2Car, tương thích hoàn toàn với MongoDB — giữ nguyên driver và câu lệnh truy vấn hiện tại của mã nguồn.
  - **Primary Cluster (WRITE)** tại AZ1: Xử lý toàn bộ thao tác ghi (đặt hàng, cập nhật trạng thái, đăng sản phẩm mới).
  - **Replica Instance (READ)** tại AZ2: Phân tải toàn bộ thao tác đọc (tra cứu sản phẩm, lịch sử đơn hàng).
  - **Sync Replication** liên tục giữa Primary và Replica — dữ liệu luôn nhất quán giữa 2 AZ.
  - Tự động **Failover:** Nếu AZ1 có sự cố, Replica tại AZ2 được AWS tự động promote lên thành Primary trong vài giây, ứng dụng không bị gián đoạn.
- **AWS Backup:** Tự động chụp snapshot toàn bộ DocumentDB theo lịch hàng ngày. Hỗ trợ khôi phục dữ liệu về bất kỳ thời điểm nào (Point-in-Time Recovery) trong vòng 35 ngày gần nhất.

#### 3.4.5. Lớp Bảo Mật & Quản Trị (Security & Management)

*Áp dụng mô hình Defense-in-Depth — nhiều lớp bảo mật độc lập, tương hỗ lẫn nhau.*

- **Security Groups Chaining (Tường lửa ảo khép kín):**
  - `SG-CloudFront` → Chỉ cho phép IP của CloudFront vào ALB.
  - `SG-ALB` → ALB chỉ nhận traffic từ CloudFront.
  - `SG-ECS` → Backend chỉ nhận kết nối từ ALB.
  - `SG-DB` → Database & Cache chỉ nhận kết nối từ ECS Backend.
  - Không có bất kỳ cổng nào mở trực tiếp ra Internet từ các lớp Private.
- **AWS Secrets Manager:** Toàn bộ thông tin nhạy cảm (DB Connection String, JWT Secret, API Keys của VNPay/MoMo/Stripe) được mã hóa và lưu trữ tập trung. ECS Task gọi API Secrets Manager lúc khởi động để lấy credentials — tuyệt đối không ghi cứng trong mã nguồn hoặc file `.env`.
- **AWS KMS (Key Management Service):** Cung cấp và quản lý khóa mã hóa (CMK) cho Encryption at Rest trên: S3 Buckets, DocumentDB volumes, ElastiCache, SQS Queue.
- **AWS IAM:** Mỗi ECS Task được gắn một IAM Role riêng với đúng các quyền tối thiểu cần thiết (Least Privilege): quyền đọc Secrets Manager, ghi S3, gửi/nhận SQS. Không có Access Key nào được lưu trong container.
- **AWS Systems Manager (SSM) / ECS Exec:** Cho phép đội DevOps truy cập shell của container đang chạy trên Fargate thông qua trình duyệt web — hoàn toàn không cần mở SSH Port 22, không cần Bastion Host.

#### 3.4.6. Tối Ưu Chi Phí Vận Hành (FinOps)

- **S3 Gateway VPC Endpoint:** Kết nối từ ECS Backend tới S3 đi qua mạng nội bộ AWS thay vì qua NAT Gateway. Chi phí NAT Gateway là $0.045/GB data — với lượng ảnh phụ tùng lớn, tiết kiệm được đáng kể mỗi tháng.
- **Pre-signed URL cho Upload:** Thay vì Backend làm trung gian tải file ảnh (tốn CPU + băng thông Fargate), Backend chỉ cấp phát một URL tạm thời (15 phút). Trình duyệt người dùng dùng URL này upload thẳng vào S3 Media Bucket — Backend không tiêu thụ bất kỳ tài nguyên nào trong quá trình này.
- **ECS Fargate Auto Scaling:** Số lượng Backend Tasks tăng/giảm tự động theo CPU Utilization. Giờ thấp điểm (2AM-6AM) chỉ chạy 2 Tasks, giờ cao điểm Flash Sale có thể tự động scale lên 10-20 Tasks.
- **Serverless Lambda & SQS:** Chi phí chỉ tính theo số lần gọi thực tế. Không có giao dịch = không tốn chi phí.

#### 3.4.7. Lớp Giám Sát & Cảnh Báo (Monitoring & Alerting)

- **Amazon CloudWatch Metrics:** Thu thập và visualize các chỉ số quan trọng:
  - ECS: CPU Utilization, Memory Utilization, Task Count.
  - ALB: Request Count, Latency (P50/P95/P99), 5xx Error Rate.
  - DocumentDB: Connections, Read/Write Latency, Replication Lag.
  - ElastiCache: Cache Hit Rate, Evictions, Connections.
  - SQS: Queue Depth (số message đang chờ xử lý), Age of Oldest Message.
- **CloudWatch Alarms + Amazon SNS:** Khi bất kỳ chỉ số nào vượt ngưỡng cảnh báo, SNS sẽ gửi Email/SMS tức thì tới đội vận hành. Ví dụ: SQS Queue Depth > 1000 message, ALB 5xx Error Rate > 1%, DocumentDB CPU > 80%.

---

## 4. Lộ Trình & Mốc Triển Khai (Roadmap)

| Giai đoạn | Nội dung | Mốc thời gian |
|---|---|---|
| **Giai đoạn 1** | Thiết kế kiến trúc chi tiết, tạo VPC, Subnets, Security Groups, IAM Roles | Tuần 1-2 |
| **Giai đoạn 2** | Triển khai Data Tier: DocumentDB Multi-AZ, ElastiCache Redis Primary-Replica, cấu hình Backup | Tuần 3-4 |
| **Giai đoạn 3** | Triển khai Compute Tier: ECR, ECS Fargate, ALB, NAT Gateways, Auto Scaling | Tuần 5-6 |
| **Giai đoạn 4** | Triển khai Frontend: S3 Buckets, CloudFront, WAF, S3 VPC Endpoint | Tuần 7 |
| **Giai đoạn 5** | Tích hợp thanh toán: Lambda Webhook Handler, SQS, kết nối VNPay/MoMo/Stripe | Tuần 8 |
| **Giai đoạn 6** | Bảo mật: KMS, Secrets Manager, CloudWatch Alarms, SNS | Tuần 9 |
| **Giai đoạn 7** | Kiểm thử chịu tải, UAT, tinh chỉnh Auto Scaling, go-live production | Tuần 10-12 |

---

## 5. Ước Tính Ngân Sách (Budget Estimation)

*Chi phí tham khảo ước tính cho môi trường Production quy mô vừa (Region: ap-southeast-1)*

| Dịch vụ | Cấu hình | Chi phí ước tính/tháng |
|---|---|---|
| ECS Fargate | 2 Tasks × 0.5 vCPU × 1GB RAM (baseline) | ~$15 |
| ALB | 1 ALB, ~50GB data processed | ~$20 |
| NAT Gateway | 2 NAT GW (Multi-AZ), ~10GB traffic | ~$35 |
| DocumentDB | db.t3.medium × 1 Primary + 1 Replica | ~$120 |
| ElastiCache Redis | cache.t3.micro × 1 Primary + 1 Replica | ~$50 |
| S3 (Web + Media) | ~50GB Storage + CloudFront requests | ~$10 |
| CloudFront | ~100GB data transfer | ~$9 |
| Lambda + SQS | ~500K invocations/tháng | ~$1 |
| CloudWatch, SNS, ECR | Monitoring & Registry | ~$5 |
| AWS WAF | ~1M requests/tháng | ~$10 |
| **Tổng ước tính** | | **~$275/tháng** |

> ⚠️ **Lưu ý:** Đây là mức chi phí baseline cho traffic vừa phải. Chi phí thực tế có thể thấp hơn đáng kể trong giai đoạn đầu nhờ kiến trúc Auto Scaling. Xem chi tiết tại [AWS Pricing Calculator](https://calculator.aws/).

---

## 6. Đánh Giá Rủi Ro & Phương Án Dự Phòng (Risk Assessment)

### 6.1. Ma Trận Rủi Ro

| Rủi ro | Mức độ ảnh hưởng | Xác suất | Mức độ ưu tiên |
|---|---|---|---|
| Sự cố tại 1 Availability Zone (AZ) | Cao | Thấp | 🟡 Trung bình |
| Traffic tăng đột biến (Flash Sale) | Trung bình | Cao | 🟡 Trung bình |
| Cổng thanh toán bên ngoài bị gián đoạn | Cao | Thấp | 🟡 Trung bình |
| Rò rỉ Credentials / Secret Keys | Rất cao | Rất thấp | 🔴 Cao |
| Tấn công DDoS / SQL Injection | Cao | Trung bình | 🔴 Cao |
| DocumentDB bị mất dữ liệu | Rất cao | Rất thấp | 🔴 Cao |

### 6.2. Chiến Lược Giảm Thiểu & Kế Hoạch Dự Phòng

- **Sự cố AZ:** Nhờ thiết kế Multi-AZ, ALB/ECS/DocumentDB/Redis đều có bản sao ở AZ còn lại. AWS tự động Failover trong vài giây — người dùng hầu như không cảm nhận được gián đoạn.
- **Traffic đột biến:** ECS Auto Scaling + CloudFront Cache gánh toàn bộ tải tĩnh. Ngay cả khi Backend chưa kịp scale, giao diện web vẫn hoạt động bình thường nhờ CloudFront CDN.
- **Cổng thanh toán gián đoạn:** SQS lưu giữ toàn bộ message Webhook. Hệ thống không mất bất kỳ thông tin hóa đơn nào. Khi cổng thanh toán phục hồi, các giao dịch sẽ được xử lý tuần tự và tự động.
- **Rò rỉ Credentials:** AWS Secrets Manager tự động rotate Credentials định kỳ. Không có Secret nào nằm trong mã nguồn hoặc môi trường Container — hoàn toàn không thể bị lộ qua code review hay CI/CD logs.
- **Tấn công bảo mật:** AWS WAF block ngay lập tức tại lớp biên. Security Groups Chaining đảm bảo không có điểm truy cập nào từ Internet vào lớp dữ liệu. CloudWatch + SNS cảnh báo real-time khi phát hiện traffic bất thường.
- **Mất dữ liệu DB:** AWS Backup chụp snapshot hàng ngày, hỗ trợ Point-in-Time Recovery lên tới 35 ngày. DocumentDB Sync Replication đảm bảo Primary và Replica luôn đồng bộ.

---

## 7. Kết Quả Kỳ Vọng (Expected Outcomes)

- **Kỹ thuật:** Hệ thống đạt SLA uptime 99.9%+, xử lý đồng thời hàng nghìn người dùng với độ trễ API < 200ms.
- **Nghiệp vụ:** Tự động hóa 100% vòng đời đơn hàng từ lúc đặt hàng đến khi thanh toán và xác nhận.
- **Trải nghiệm người dùng:** Chat hỗ trợ Real-time, thông báo trạng thái đơn hàng tức thì, tra cứu phụ tùng tự động qua số VIN.
- **Tài chính:** Kiến trúc Pay-as-you-go tối ưu chi phí, không tốn phí cho tài nguyên nhàn rỗi.