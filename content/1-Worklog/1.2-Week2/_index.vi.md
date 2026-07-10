---
title: "Worklog Tuần 2"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 1.2. </b> "
---

Tuần 2 tập trung vào thực hành mạng trên AWS: dựng một VPC mẫu, chia subnet hợp lý, cấu hình cổng Internet/NAT, và triển khai EC2 để kiểm tra luồng mạng.

### Mục tiêu tuần 2

- Nắm chắc cấu phần của Amazon VPC và vai trò của từng thành phần (Subnet, IGW, NAT, Route Table).
- Thiết lập môi trường thử nghiệm an toàn với public/private subnet và security groups phù hợp.
- Thực hành triển khai EC2 và kiểm tra lưu lượng vào/ra, cũng như bật VPC Flow Logs để giám sát.

### Lịch công việc (tóm tắt)

| Buổi | Hoạt động chính | Ngày |
| --- | --------------------------------------------------------------- | ----- |
| 1 | Tìm hiểu khái niệm VPC, CIDR, phân loại subnet | 27/04/2026 |
| 2 | Thiết kế VPC mẫu và phân CIDR (ví dụ `10.10.0.0/16`) | 28/04/2026 |
| 3 | Tạo Internet Gateway, public route table và gán subnet public | 29/04/2026 |
| 4 | Tạo NAT Gateway trên public subnet để hỗ trợ private outbound | 30/04/2026 |
| 5 | Cấu hình Security Group, bật VPC Flow Logs, deploy EC2 kiểm thử | 01/05/2026 |

### Kết quả chính

- Hiểu rõ luồng dữ liệu trong VPC và cách quản lý địa chỉ IP bằng CIDR.
- Dựng được VPC mẫu với các subnet public/private, IGW, NAT và route table hoạt động.
- Cấu hình Security Group phù hợp cho các trường hợp public/private và bật VPC Flow Logs gửi về CloudWatch.
- Triển khai EC2 trong cả hai lớp subnet và xác minh trạng thái kết nối (2/2 checks, SSH/SSM).


### Thực hành chi tiết (đầy đủ, không dùng tên người khác)

Phần này trình bày các bước thực hiện bằng AWS CLI, đầy đủ để ai làm lab theo có thể chạy — tất cả tên đều là `training-*` hoặc biến placeholder, không dùng tên/ảnh của người khác.

1) Tạo VPC

- Mục tiêu: Tạo mạng cô lập để triển khai tài nguyên thử nghiệm.
- CLI:

```bash
# Tạo VPC và đánh tag
VPC_ID=$(aws ec2 create-vpc --cidr-block 10.10.0.0/16 --query 'Vpc.VpcId' --output text)
aws ec2 create-tags --resources $VPC_ID --tags Key=Name,Value=training-vpc

# Bật DNS hostnames nếu cần
aws ec2 modify-vpc-attribute --vpc-id $VPC_ID --enable-dns-hostnames
```

2) Tạo Subnet (2 public, 2 private)

```bash
PUB1=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.10.1.0/24 --availability-zone us-east-1a --query 'Subnet.SubnetId' --output text)
PUB2=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.10.2.0/24 --availability-zone us-east-1b --query 'Subnet.SubnetId' --output text)
PRI1=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.10.3.0/24 --availability-zone us-east-1a --query 'Subnet.SubnetId' --output text)
PRI2=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.10.4.0/24 --availability-zone us-east-1b --query 'Subnet.SubnetId' --output text)

aws ec2 create-tags --resources $PUB1 $PUB2 $PRI1 $PRI2 --tags Key=Name,Value=training-subnet
```

3) Tạo Internet Gateway và route public

```bash
IGW_ID=$(aws ec2 create-internet-gateway --query 'InternetGateway.InternetGatewayId' --output text)
aws ec2 attach-internet-gateway --internet-gateway-id $IGW_ID --vpc-id $VPC_ID

PUB_RTB=$(aws ec2 create-route-table --vpc-id $VPC_ID --query 'RouteTable.RouteTableId' --output text)
aws ec2 create-route --route-table-id $PUB_RTB --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW_ID
aws ec2 associate-route-table --route-table-id $PUB_RTB --subnet-id $PUB1
aws ec2 associate-route-table --route-table-id $PUB_RTB --subnet-id $PUB2
```

4) Tạo NAT Gateway cho private subnet

```bash
ALLOC_ID=$(aws ec2 allocate-address --domain vpc --query 'AllocationId' --output text)
NAT_ID=$(aws ec2 create-nat-gateway --subnet-id $PUB2 --allocation-id $ALLOC_ID --query 'NatGateway.NatGatewayId' --output text)
aws ec2 wait nat-gateway-available --nat-gateway-ids $NAT_ID

PRI_RTB=$(aws ec2 create-route-table --vpc-id $VPC_ID --query 'RouteTable.RouteTableId' --output text)
aws ec2 create-route --route-table-id $PRI_RTB --destination-cidr-block 0.0.0.0/0 --nat-gateway-id $NAT_ID
aws ec2 associate-route-table --route-table-id $PRI_RTB --subnet-id $PRI1
aws ec2 associate-route-table --route-table-id $PRI_RTB --subnet-id $PRI2
```

5) Tạo Security Groups

```bash
PUB_SG=$(aws ec2 create-security-group --group-name training-public-sg --description "Public SG" --vpc-id $VPC_ID --query 'GroupId' --output text)
aws ec2 authorize-security-group-ingress --group-id $PUB_SG --protocol tcp --port 22 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $PUB_SG --protocol icmp --port -1 --cidr 0.0.0.0/0

PRI_SG=$(aws ec2 create-security-group --group-name training-private-sg --description "Private SG" --vpc-id $VPC_ID --query 'GroupId' --output text)
aws ec2 authorize-security-group-ingress --group-id $PRI_SG --protocol tcp --port 22 --source-group $PUB_SG || true
aws ec2 authorize-security-group-ingress --group-id $PRI_SG --protocol tcp --port 80 --cidr 10.10.0.0/16 || true
```

6) Bật VPC Flow Logs

```bash
aws logs create-log-group --log-group-name /aws/vpc/flowlogs || true
aws ec2 create-flow-logs --resource-type VPC --resource-ids $VPC_ID --traffic-type ALL --log-group-name /aws/vpc/flowlogs --deliver-logs-permission-arn $ROLE_ARN
```

7) Triển khai EC2

```bash
aws ec2 run-instances --image-id ami-0abcdef1234567890 --count 1 --instance-type t3.micro --subnet-id $PUB1 --security-group-ids $PUB_SG --key-name my-keypair --associate-public-ip-address
aws ec2 run-instances --image-id ami-0abcdef1234567890 --count 1 --instance-type t3.micro --subnet-id $PRI1 --security-group-ids $PRI_SG --key-name my-keypair
```

8) Session Manager (SSM) — tùy chọn

```bash
# Tạo role và instance profile SSM (thay assume-role file khi cần)
aws iam create-role --role-name training-ssm-role --assume-role-policy-document file://assume-role-policy.json || true
aws iam attach-role-policy --role-name training-ssm-role --policy-arn arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore || true
```

9) Giám sát NAT và cảnh báo

```bash
aws cloudwatch put-metric-alarm --alarm-name NAT-PacketDrop --metric-name PacketDropCount --namespace AWS/NATGateway --statistic Sum --period 300 --threshold 1 --comparison-operator GreaterThanOrEqualToThreshold --dimensions Name=NatGatewayId,Value=$NAT_ID --evaluation-periods 1 --alarm-actions $SNS_ARN
```

10) VPN Site-to-site (tùy chọn)

```bash
CGW_ID=$(aws ec2 create-customer-gateway --type ipsec.1 --public-ip x.x.x.x --bgp-asn 65000 --query 'CustomerGateway.CustomerGatewayId' --output text)
VGW_ID=$(aws ec2 create-vpn-gateway --type ipsec.1 --amazon-side-asn 64512 --query 'VpnGateway.VpnGatewayId' --output text)
aws ec2 attach-vpn-gateway --vpn-gateway-id $VGW_ID --vpc-id $VPC_ID
aws ec2 create-vpn-connection --type ipsec.1 --customer-gateway-id $CGW_ID --vpn-gateway-id $VGW_ID
```

11) Kiểm tra

- `aws ec2 describe-instances --filters Name=vpc-id,Values=$VPC_ID`
- `aws ec2 describe-route-tables --filters Name=vpc-id,Values=$VPC_ID`
- `aws ec2 describe-flow-logs --filter Name=resource-id,Values=$VPC_ID`

Ghi chú: Thay các placeholder (`ami-...`, `my-keypair`, `$ROLE_ARN`, vùng) bằng giá trị thực khi chạy.


Nếu bạn muốn mình chèn các ảnh vào `static/images/worklog/week-2` hoặc muốn mình giữ nguyên URL ảnh trên trang nguồn, mình sẽ thêm ngay. Muốn mình chèn thêm các lệnh AWS CLI cụ thể cho từng bước không?  



