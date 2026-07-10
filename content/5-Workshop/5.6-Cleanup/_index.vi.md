---
title: "Bài 6: Dọn dẹp tài nguyên"
date: 2024-01-01
weight: 6
chapter: false
pre: " <b> 5.6. </b> "
---

## Bài 6: Dọn dẹp tài nguyên (Clean Up)

Sau khi hoàn thành thử nghiệm và kiểm chứng toàn bộ hệ thống phân giải DNS giả lập cũng như các kết nối Gateway/Interface VPC Endpoints cho Amazon S3 của J2Car AutoParts, việc dọn dẹp các tài nguyên tạm thời là cần thiết để tối ưu chi phí sử dụng tài khoản AWS.

---

### Quy trình dọn dẹp tài nguyên lý thuyết

Để giải phóng hoàn toàn hạ tầng của bài lab này, thứ tự xóa tài nguyên cần tuân thủ như sau:

1. **Xóa các tài nguyên DNS:**
   - Xóa các forwarding rules trong Route 53 Resolver Rules.
   - Xóa các Private Hosted Zones và DNS Alias Records.
2. **Xóa các VPC Endpoints:**
   - Chọn và xóa Gateway Endpoint (`s3-gwe`).
   - Chọn và xóa Interface Endpoint (`s3-interface-endpoint`).
3. **Xóa các CloudFormation Stacks:**
   - Xóa Stack `J2Car-Resolver-Endpoints` (Đợi hoàn tất).
   - Xóa Stack hạ tầng mạng chính `J2Car-Workshop-Network` (Sẽ tự động giải phóng toàn bộ VPC, NAT Gateways, Subnets và các Route Tables).
4. **Xóa S3 Buckets:**
   - Làm rỗng (Empty) và xóa các S3 Buckets tạm thời.

---

> [!IMPORTANT]
> Nhằm duy trì hệ thống chạy thực tế ổn định để phục vụ quá trình bảo vệ workshop và viết báo cáo, toàn bộ các tài nguyên mạng, database, ECR, ECS và SQS của dự án **J2Car AutoParts** trên tài khoản AWS của bạn **vẫn được giữ nguyên** và không chạy lệnh xóa thực tế.
