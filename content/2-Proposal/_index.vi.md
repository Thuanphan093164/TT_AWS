---
title: "Bản đề xuất"
date: 2024-01-01
weight: 2
chapter: false
pre: " <b> 2. </b> "
---

# Nền tảng Thương mại Điện tử Phụ tùng Ô tô NodeJ2Car  
## Giải pháp AWS Cloud tối ưu hóa hiệu năng, bảo mật và mở rộng linh hoạt  

### 1. Tóm tắt điều hành  
Dự án **NodeJ2Car** xây dựng một hệ thống thương mại điện tử chuyên biệt cung cấp phụ tùng ô tô cao cấp. Nền tảng nổi bật với ba tính năng đột phá: Bản vẽ sơ đồ xe tương tác 2D trực quan, Chat hỗ trợ trực tuyến thời gian thực qua WebSockets và Tìm kiếm phụ tùng lỗi bằng hình ảnh quét AI. Để đáp ứng nhu cầu giao dịch trực tuyến chịu tải lớn, bảo mật tuyệt đối thông tin khách hàng và xử lý thanh toán bất đồng bộ tin cậy (Momo, VNPay, Stripe), toàn bộ hệ thống được triển khai trên đám mây AWS theo mô hình hybrid container-serverless. Giải pháp này giúp NodeJ2Car đạt độ sẵn sàng cao (High Availability), tự động mở rộng theo tải (Auto Scaling) và giảm thiểu tối đa chi phí vận hành thực tế.

### 2. Tuyên bố vấn đề  
*Vấn đề hiện tại*  
1. **Trải nghiệm tìm kiếm phụ tùng phức tạp:** Phụ tùng ô tô có hàng triệu mã linh kiện khác nhau. Khách hàng thông thường gặp rất nhiều khó khăn và dễ nhầm lẫn khi tìm mua linh kiện phù hợp với đời xe của mình qua thanh tìm kiếm văn bản truyền thống.
2. **Quá tải hệ thống khi tích hợp luồng xử lý thời gian thực:** Kết nối chat thời gian thực qua Socket.io và xử lý Webhook thanh toán (IPN) đồng thời rất dễ làm tắc nghẽn máy chủ chính, dẫn đến rủi ro sập hệ thống hoặc thất thoát giao dịch của khách hàng.
3. **Mối đe dọa bảo mật và tấn công mạng:** Một trang web thương mại điện tử chứa thông tin cá nhân và tài chính của người dùng luôn là mục tiêu của các cuộc tấn công DDoS, SQL Injection và đánh cắp dữ liệu.

*Giải pháp*  
Hệ thống giải quyết triệt để các vấn đề trên thông qua sự kết hợp của phần mềm hiện đại và hạ tầng đám mây AWS:
*   **Sơ đồ 2D trực quan (Schematics) & AI Scan Image:** Giúp đơn giản hóa quá trình tìm kiếm phụ tùng chính xác mà không cần nhớ mã linh kiện.
*   **Phát tải bất đồng bộ luồng thanh toán:** Tách biệt hoàn toàn luồng xử lý Webhook IPN bằng dịch vụ không máy chủ **AWS Lambda** và hàng đợi tin nhắn **Amazon SQS**, đảm bảo thông tin thanh toán luôn được xếp hàng bảo toàn và xử lý thành công ngay cả khi máy chủ API gặp sự cố.
*   **Chia sẻ tải Socket.io:** Sử dụng **Amazon ElastiCache Redis** làm bộ điều phối (Redis Adapter) giúp đồng bộ hóa dữ liệu chat realtime trên toàn cụm máy chủ Backend.
*   **Bảo vệ biên toàn diện:** Toàn bộ hệ thống Backend được giấu hoàn toàn trong Private Subnets đứng sau **Application Load Balancer (ALB)**, bảo vệ vòng ngoài bằng **AWS WAF** và **CloudFront CDN**.

*Lợi ích và hoàn vốn đầu tư (ROI)*  
*   **Tăng tỷ lệ chuyển đổi đơn hàng:** Tiết kiệm 70% thời gian tìm kiếm phụ tùng của khách hàng nhờ bản đồ sơ đồ và AI Scan, giúp nâng cao doanh số.
*   **Đảm bảo tính sẵn sàng 99.99%:** Kiến trúc đa vùng Availability Zone (Multi-AZ) trên ECS Fargate giúp hệ thống hoạt động liên tục, không bị gián đoạn.
*   **Tối ưu hóa chi phí hạ tầng:** Việc sử dụng các dịch vụ Serverless và Auto Scaling giúp chi phí đám mây bám sát lưu lượng sử dụng thực tế (Pay-as-you-go), tránh lãng phí khi nhàn rỗi. Thời gian hoàn vốn dự kiến trong vòng 6 tháng đầu hoạt động nhờ tiết kiệm chi phí nhân sự quản trị và giảm thiểu tỷ lệ rớt đơn hàng.

---

### 3. Kiến trúc giải pháp  
Hệ thống sử dụng mạng ảo **Amazon VPC** làm nền tảng an ninh, chia làm các phân vùng Public và Private Subnets hoạt động trên 2 vùng sẵn sàng (AZ) độc lập. Mọi yêu cầu truy cập từ bên ngoài được kiểm duyệt bởi **AWS WAF** và **Amazon CloudFront** trước khi phân phối vào mạng nội bộ.

![Kiến trúc tổng quan AWS](/images/5-Workshop/architecture.png)

*Dịch vụ AWS sử dụng*  
*   **Amazon VPC:** Nền tảng thiết lập cấu trúc mạng an toàn (Public/Private Subnets, NAT Gateways).
*   **Amazon ECS & AWS Fargate:** Chạy các tác vụ Backend NodeJS trong container một cách tự động, co giãn linh hoạt.
*   **Application Load Balancer (ALB):** Cân bằng tải cho các ECS tasks, hỗ trợ Sticky Sessions duy trì kết nối WebSocket.
*   **Amazon DocumentDB:** Hệ cơ sở dữ liệu lưu trữ chính tương thích MongoDB, cấu hình Primary (ghi) và Replica (đọc).
*   **Amazon ElastiCache Redis:** Bộ nhớ đệm chia sẻ phiên chat Socket.io và cache dữ liệu sản phẩm.
*   **AWS Lambda & Amazon SQS:** Xử lý Webhook thanh toán và hàng đợi giao dịch bất đồng bộ.
*   **Amazon S3 & S3 Gateway Endpoint:** Lưu trữ mã nguồn tĩnh Frontend (React SPA) và tệp tin ảnh sản phẩm, kết nối trực tiếp nội bộ an toàn.
*   **Amazon CloudFront & AWS WAF:** Hệ thống CDN tăng tốc tải trang và tường lửa ứng dụng web chống tấn công.
*   **Amazon ECR:** Lưu trữ Docker Image của Backend.

*Thiết kế thành phần*  
*   **Frontend (Giao diện):** Đóng gói React SPA đặt tại S3 Web Bucket, truyền tải qua CloudFront CDN.
*   **Backend (Xử lý logic):** Container NodeJS chạy trên ECS Fargate trong Private Subnet, định tuyến bởi ALB.
*   **Integration (Tích hợp):** Webhook IPN gọi trực tiếp tới AWS Lambda, ghi nhận hóa đơn vào SQS, ECS worker rút tin nhắn chốt đơn hàng và thông báo trạng thái.
*   **Database (Dữ liệu):** DocumentDB Cluster phân chia luồng Ghi (Primary AZ1) và Đọc (Replica AZ2).

---

### 4. Triển khai kỹ thuật  
*Các giai đoạn triển khai*  
Dự án được chia thành 4 giai đoạn cụ thể:
1.  **Giai đoạn 1: Phân tích & Vẽ kiến trúc mạng (Tuần 1 - 2):** Khởi tạo VPC, phân bổ IP cho các Subnets, cấu hình Route Tables và các Security Groups. Thiết kế cấu trúc cơ sở dữ liệu DocumentDB.
2.  **Giai đoạn 2: Phát triển Core API & Tính năng tương tác (Tuần 3 - 5):** Viết API xác thực, CRUD phụ tùng, trang sơ đồ Schematic, và tích hợp Socket.io sử dụng Redis làm bộ chia sẻ trạng thái.
3.  **Giai đoạn 3: Tích hợp Serverless Payment & Container hóa (Tuần 6 - 8):** Viết code cho AWS Lambda nhận IPN, tạo SQS queue, viết module Worker xử lý giao dịch. Viết Dockerfile đóng gói mã nguồn Backend.
4.  **Giai đoạn 4: Triển khai Đám mây & Kiểm thử Tải (Tuần 9 - 11):** Triển khai ECS Fargate, ALB, S3, CloudFront và WAF. Chạy kiểm thử tải (Load test) giả lập 1,000+ người dùng đồng thời, tối ưu chỉ mục cơ sở dữ liệu và hoàn thiện bàn giao.

*Yêu cầu kỹ thuật*  
*   **Môi trường chạy:** Docker Engine để build image, AWS CLI & AWS CDK để định cấu hình hạ tầng bằng mã (Infrastructure as Code).
*   **Frontend:** ReactJS + Vite + Tailwind CSS, thư viện `socket.io-client` kết nối WebSocket.
*   **Backend:** NodeJS + ExpressJS, Mongoose kết nối DocumentDB, `vnpay` & `axios` xử lý giao dịch.

---

### 5. Lộ trình & Mốc triển khai  
*   **Mốc 1 (Tuần 1 - 2):** Hoàn thành hạ tầng VPC mạng cơ bản và thiết lập cluster DocumentDB. API Xác thực người dùng hoạt động ổn định.
*   **Mốc 2 (Tuần 3 - 5):** Hoàn thành giao diện trang chủ, trang sơ đồ tương tác Schematic, và hệ thống phòng chat realtime giữa khách hàng và Admin.
*   **Mốc 3 (Tuần 6 - 8):** Tích hợp thành công AI Scan Image nhận diện phụ tùng. Xây dựng hoàn chỉnh luồng nhận Webhook thanh toán tự động qua Lambda và hàng đợi SQS.
*   **Mốc 4 (Tuần 9 - 10):** Triển khai thành công ứng dụng trên ECS Fargate và phân phối Frontend qua CloudFront CDN được bảo vệ bởi AWS WAF.
*   **Mốc 5 (Tuần 11):** Hoàn tất load testing, tối ưu hóa hiệu năng cơ sở dữ liệu và bàn giao dự án.

---

### 6. Ước tính ngân sách  
Chi phí hạ tầng AWS hàng tháng dự kiến (dành cho môi trường Production quy mô vừa):

| Dịch vụ AWS | Cấu hình ước tính | Chi phí ước tính / Tháng |
| :--- | :--- | :--- |
| **Amazon ECS & Fargate** | 2 Tasks (0.5 vCPU, 1 GB RAM) chạy liên tục | ~ $15.00 |
| **Application Load Balancer** | 1 ALB, 1 LCU | ~ $22.00 |
| **Amazon DocumentDB** | Cluster db.t3.medium (1 Primary + 1 Replica) | ~ $110.00 |
| **Amazon ElastiCache Redis** | cache.t3.micro Cluster (1 Primary + 1 Replica) | ~ $30.00 |
| **Amazon S3** | Lưu trữ Web & Media (tổng ~ 50 GB + request) | ~ $3.00 |
| **Amazon CloudFront** | Lưu lượng Data Transfer Out ~ 150 GB | ~ $12.00 |
| **AWS WAF** | 1 Web ACL + 3 Rules cơ bản | ~ $10.00 |
| **NAT Gateways** | 2 NAT Gateways + phí xử lý dữ liệu qua mạng | ~ $65.00 |
| **AWS Lambda & SQS** | 50,000 giao dịch (nằm trong Free Tier) | ~ $0.00 |
| **Tổng chi phí hạ tầng** | **Quy mô Production hoạt động ổn định** | **~ $267.00 / Tháng** |

---

### 7. Đánh giá rủi ro  
*Ma trận rủi ro & Chiến lược giảm thiểu*  
1.  **Nghẽn cổ chai cơ sở dữ liệu (DocumentDB):**
    *   *Rủi ro:* Lượng truy vấn đọc thông số phụ tùng quá lớn khi chạy chiến dịch khuyến mại làm CPU DB đạt 100%.
    *   *Giảm thiểu:* Định cấu hình chuyển toàn bộ các câu lệnh tìm kiếm/đọc sản phẩm sang các Replica Instance (chỉ đọc), đồng thời lưu trữ các phụ tùng hot nhất vào bộ nhớ cache Redis.
2.  **Sự cố đứt kết nối WebSocket (Chat Real-time):**
    *   *Rủi ro:* Người dùng di chuyển mạng hoặc máy chủ tự động co giãn (Auto Scaling) làm ngắt luồng chat.
    *   *Giảm thiểu:* Cấu hình ALB Sticky Sessions để neo người dùng vào đúng container đang chat, kết hợp Redis Pub/Sub adapter để đồng bộ tin nhắn xuyên suốt các tasks.
3.  **Chi phí đám mây vượt tầm kiểm soát:**
    *   *Rủi ro:* Băng thông mạng tăng vọt hoặc cấu hình sai tài nguyên Fargate.
    *   *Giảm thiểu:* Thiết lập AWS Budgets gửi cảnh báo qua Email ngay khi chi phí dự kiến vượt quá $300/tháng. Cấu hình quy tắc vòng đời S3 để tự động xóa/nén các ảnh quét AI cũ.

---

### 8. Kết quả kỳ vọng  
*   **Cải tiến kỹ thuật:** Tốc độ tải trang Frontend dưới 2 giây trên toàn thế giới nhờ CloudFront CDN. Máy chủ Backend có khả năng tự phục hồi và tự động nhân rộng từ 2 tasks lên tối đa 10 tasks khi lượng truy cập tăng đột biến.
*   **Giá trị kinh doanh:** Đảm bảo tỉ lệ thất thoát đơn hàng bằng 0% nhờ hàng đợi thanh toán SQS đáng tin cậy. Tăng trải nghiệm người dùng giúp tăng doanh thu bán hàng phụ tùng ô tô nhờ các tính năng tương tác sơ đồ độc đáo và quét hình ảnh thông minh.
