---
title: "Mini Meetup – First Cloud AI Journey"
date: 2026-06-13
weight: 1
chapter: false
pre: " <b> 4.1. </b> "
---

# Báo cáo thu hoạch: Mini Meetup – First Cloud AI Journey

### Thông tin sự kiện
* **Tên sự kiện:** Mini Meetup – First Cloud AI Journey
* **Thời gian:** 13/06/2026 (09:00 - 12:00)
* **Địa điểm:** AWS Office – Grand Terra, 36 Cát Linh, Hà Nội
* **Vai trò:** Người tham dự

---

### Mục Đích Của Sự Kiện
Buổi **Mini Meetup – First Cloud AI Journey** là sự kiện chia sẻ kiến thức chuyên sâu do cộng đồng First Cloud AI Journey (FCAJ) tổ chức. Chương trình tạo ra không gian kết nối thực tế giữa các kỹ sư, chuyên gia hạ tầng đám mây và các bạn sinh viên/thực tập sinh yêu thích lĩnh vực **Cloud Computing** và **Artificial Intelligence (AI)**.

Mục tiêu cốt lõi của sự kiện bao gồm:
* **Cung cấp kiến thức thực chiến:** Chia sẻ các giải pháp quản trị hạ tầng Cloud an toàn, tối ưu phương thức kết nối máy chủ và mô hình kiến trúc dữ liệu hiện đại trong doanh nghiệp.
* **Cập nhật xu hướng công nghệ:** Giúp người tham dự nắm bắt được quy trình chuyển đổi số thực tế khi kết hợp các dịch vụ hàng đầu của Amazon Web Services (AWS) với các nền tảng phân tích hiện đại như Snowflake.
* **Thúc đẩy văn hóa cộng đồng:** Lan tỏa tinh thần **Learn • Build • Share • Grow**, khuyến khích giao lưu, đặt câu hỏi trực tiếp với diễn giả và định hướng phát triển sự nghiệp trong ngành Cloud/DevOps/Data.

---

### Tóm Tắt Nội Dung Các Bài Chia Sẻ

#### 1. How to Connect to a Virtual Machine
* **Diễn giả:** Mr. Hải Hiếu
* **Nội dung chi tiết:**

##### A. Khái niệm Virtual Machine (VM) & Tổng quan truy cập
- Tổng quan về vai trò của máy chủ ảo (Virtual Machine / Amazon EC2) trong hạ tầng đám mây: làm môi trường chạy ứng dụng Web, Backend API, Database hoặc Worker processing.
- Phân tích các phương thức kết nối phổ biến đến máy chủ ảo Linux/Windows:
  - **SSH (Secure Shell - Port 22):** Phương thức tiêu chuẩn cho Linux.
  - **RDP (Remote Desktop Protocol - Port 3389):** Dùng cho giao diện máy chủ Windows.
  - **AWS EC2 Instance Connect:** Kết nối SSH trực tiếp thông qua giao diện điều khiển AWS Management Console.
  - **AWS Systems Manager (SSM) Session Manager:** Giải pháp truy cập hiện đại không cần mở công khai Port 22 và không yêu cầu quản lý SSH key.

##### B. Đi sâu vào cơ chế xác thực SSH Key Pair
- **Nguyên lý mã hóa bất đối xứng (Asymmetric Encryption):** Sử dụng cặp khóa bao gồm **Private Key** (khóa riêng tư giữ an toàn tại máy client) và **Public Key** (khóa công khai được đẩy lên máy chủ ảo tại thư mục `~/.ssh/authorized_keys`).
- **Quy trình bắt tay (Handshake):** Máy chủ gửi câu đố ngẫu nhiên được mã hóa bằng Public Key, client dùng Private Key để giải mã và xác nhận danh tính mà không bao giờ truyền Private Key qua đường truyền mạng.

##### C. Các nguyên tắc Security Hardening (Gia cố bảo mật máy chủ)
- **Tắt đăng nhập bằng mật khẩu:** Thiết lập `PasswordAuthentication no` trong `sshd_config` để triệt tiêu hoàn toàn rủi ro tấn công dò mật khẩu (Brute-force attack).
- **Vô hiệu hóa quyền root trực tiếp:** Thiết lập `PermitRootLogin no`, buộc kỹ sư phải đăng nhập bằng tài khoản thường và dùng `sudo` khi cần thiết.
- **Cấu hình Security Group chuẩn Nguyên tắc Quyền tối thiểu (Least Privilege):** Chỉ mở Port 22 cho các dải IP tĩnh tin cậy (My IP / VPN IP), tuyệt đối không mở `0.0.0.0/0`.
- **Ứng dụng Bastion Host & AWS SSM:** Khuyến nghị dựng Jump Server (Bastion Host) trong Public Subnet hoặc chuyển sang dùng AWS SSM Session Manager để đưa máy chủ EC2 hoàn toàn vào Private Subnet, giúp xóa bỏ diện tấn công (Attack Surface) từ Internet.

---

#### 2. Migrate to Modern Data Stack Using Snowflake and AWS
* **Diễn giả:** Mr. Vũ Thế Huy
* **Nội dung chi tiết:**

##### A. Khái niệm Modern Data Stack (MDS) & Sự dịch chuyển tư duy
- **Mô hình ETL truyền thống (Extract - Transform - Load):** Dữ liệu được trích xuất, biến đổi nặng nề trên hệ thống trung gian trước khi nạp vào Data Warehouse. Nhược điểm: Phức tạp, dễ nghẽn cổ chai khi dữ liệu phình to.
- **Mô hình ELT hiện đại (Extract - Load - Transform):** Dữ liệu thô được nạp thẳng vào Cloud Data Warehouse nhờ năng lượng tính toán khổng lồ trên đám mây, sau đó mới thực hiện transform bằng SQL.
- **Modern Data Stack:** Hệ sinh thái dữ liệu linh hoạt được kết nối từ các dịch vụ đám mây chuyên biệt (S3 Data Lake + Snowflake Data Warehouse + dbt Transformation + BI Tools).

##### B. Kiến trúc phân tách Compute & Storage của Snowflake trên AWS
- **Kiến trúc 3 tầng (Multi-cluster Shared Data Architecture):**
  1. **Database Storage:** Lưu trữ dữ liệu nén, phân vùng dạng cột (columnar) trực tiếp trên **Amazon S3**.
  2. **Query Processing (Compute Layer):** Sử dụng các cụm máy chủ tính toán độc lập gọi là **Virtual Warehouses**. Các cụm này có thể bật/tắt, tự động co giãn (Auto-scaling) theo nhu cầu câu truy vấn mà không ảnh hưởng lẫn nhau.
  3. **Cloud Services:** Tầng quản lý chỉ mục, phân quyền, tối ưu hóa truy vấn và metadata.
- **Lợi ích kinh tế:** Tách biệt chi phí lưu trữ (Storage) và chi phí tính toán (Compute), giúp doanh nghiệp chỉ trả tiền chính xác cho tài nguyên tính toán thực sự sử dụng (Pay-per-second compute).

##### C. Quy trình tích hợp tích hợp AWS & Snowflake
- **Thiết lập External Stage trên Amazon S3:** Khởi tạo S3 Bucket đóng vai trò làm vùng đệm chứa dữ liệu thô.
- **Tích hợp an toàn qua AWS IAM Role:** Sử dụng tính năng **Storage Integration** trong Snowflake để ủy quyền truy cập vào Amazon S3 thông qua IAM Role và External ID, tuyệt đối không hardcode AWS Access Key / Secret Key.
- **Luồng Ingest & Phân tích dữ liệu:**
  - Nạp dữ liệu hàng loạt (Batch Ingestion) bằng câu lệnh `COPY INTO` hoặc tự động hóa theo thời gian thực (Real-time Ingestion) bằng **Snowpipe** lắng nghe sự kiện `S3 Event Notifications` (SQS).
  - Phân tích và trực quan hóa dữ liệu trên các công cụ BI (Tableau, PowerBI, Amazon QuickSight), sẵn sàng cung cấp nguồn dữ liệu sạch cho các mô hình Machine Learning/AI.

---

### Những Bài Học Rút Ra & Trải Nghiệm Thực Tế

#### 1. Quản Trị & Bảo Mật Hạ Tầng Cloud
* **Nâng cao tư duy Defense-in-Depth:** Bảo mật hạ tầng không chỉ dừng lại ở việc đặt mật khẩu mạnh mà phải áp dụng kiến trúc nhiều lớp: IAM Policy $\rightarrow$ Security Group $\rightarrow$ Network ACL $\rightarrow$ SSH Key Authentication / SSM.
* **Loại bỏ sự phụ thuộc vào Port 22:** Việc áp dụng **AWS SSM Session Manager** giúp việc quản trị EC2 trở nên đơn giản, tiện lợi, không lo thất lạc SSH Private Key và có đầy đủ nhật ký truy cập (Audit Logs) trên AWS CloudTrail.

#### 2. Quản Lý & Tối Ưu Nền Tảng Dữ Liệu
* **Nắm bắt xu hướng Modern Data Stack:** Hiểu rõ tại sao các doanh nghiệp đang dịch chuyển từ hệ quản trị CSDL quan hệ truyền thống sang kiến trúc Cloud Data Warehouse linh hoạt.
* **Tối ưu hóa chi phí nhờ Cloud-native:** Việc tận dụng Amazon S3 làm Data Lake giá rẻ kết hợp với sức mạnh xử lý song song của Snowflake giúp giải quyết bài toán dữ liệu lớn (Big Data) một cách tiết kiệm và hiệu quả nhất.

---

### Ứng Dụng Thực Tế Vào Dự Án NodeJ2Car

Dựa trên các kiến thức thu hoạch từ buổi Mini Meetup, tôi đã đúc kết và đề xuất các giải pháp cải tiến trực tiếp cho kiến trúc hạ tầng và dữ liệu của dự án **NodeJ2Car** (Nền tảng thương mại điện tử phụ tùng ô tô):

```
                                  +---------------------------------------------------+
                                  |            NodeJ2Car Cloud Infrastructure         |
                                  +---------------------------------------------------+
                                                            |
                 +------------------------------------------+------------------------------------------+
                 |                                                                                     |
                 v                                                                                     v
  [1. Hạ Tầng & Bảo Mật EC2/ECS]                                                        [2. Nền Tảng Dữ Liệu Modern Data Stack]
  - Đưa EC2/ECS Fargate vào Private Subnet.                                            - Ghi log đơn hàng & AI Scan từ Node.js sang Amazon S3.
  - Sử dụng AWS SSM Session Manager (không mở Port 22).                                 - Tạo S3 External Stage kết nối Snowflake qua IAM Role.
  - Giới hạn Inbound Rules trong Security Group.                                       - Chạy pipeline ELT phân tích doanh số & tồn kho phụ tùng.
```

1. **Quản lý & Bảo mật máy chủ Backend Node.js:**
   - **Áp dụng SSH Key & SSM:** Triển khai các container Backend Node.js trên Amazon ECS Fargate/EC2 đặt hoàn toàn trong **Private Subnet**. Sử dụng **AWS Systems Manager (SSM)** để truy cập dòng lệnh debug khi cần thiết thay vì mở SSH Port 22 ra Internet.
   - **Tối ưu Security Group:** Đóng toàn bộ các cổng không sử dụng, chỉ cho phép cổng ứng dụng nhận traffic trực tiếp từ **Application Load Balancer (ALB)**.

2. **Xây dựng Nền tảng Dữ liệu & Phân tích kinh doanh (Data Pipeline cho NodeJ2Car):**
   - **Lưu trữ Log trên Amazon S3 Data Lake:** Cấu hình ứng dụng Backend Node.js tự động đẩy các log sự kiện giao dịch thanh toán, lịch sử tìm kiếm phụ tùng qua sơ đồ 2D và kết quả quét hình ảnh AI Scan lên **Amazon S3**.
   - **Tích hợp Snowflake để phân tích Business Intelligence:** 
     - Khởi tạo S3 External Stage liên kết an toàn với Snowflake thông qua AWS IAM Role.
     - Xây dựng các bảng Data Warehouse để phân tích hành vi người dùng, thống kê các mã phụ tùng ô tô được tìm kiếm nhiều nhất và dự báo nhu cầu nhập hàng tồn kho theo mùa.

---

### Trải Nghiệm Cá Nhân & Cảm Nhận

Buổi Mini Meetup **First Cloud AI Journey** đã mang lại cho tôi những trải nghiệm vô cùng quý giá. Không chỉ dừng lại ở các slide lý thuyết, hai bài chia sẻ của anh Hải Hiếu và anh Vũ Thế Huy mang tính thực chiến rất cao, giải quyết đúng những bài toán mà các kỹ sư gặp phải trong thực tế vận hành hệ thống đám mây và xử lý dữ liệu lớn.

Đặc biệt, không gian giao lưu cởi mở tại văn phòng AWS Hà Nội đã giúp tôi có cơ hội trao đổi trực tiếp với các diễn giả, học hỏi thêm về định hướng phát triển sự nghiệp trong mảng Cloud/DevOps. Những kiến thức đúc kết từ buổi meetup này đã giúp tôi tự tin hơn rất nhiều trong việc hoàn thiện thiết kế kiến trúc hạ tầng an toàn và tối ưu cho dự án thực tập NodeJ2Car.

