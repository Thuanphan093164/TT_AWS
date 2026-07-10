---
title: "Worklog Tuần 10"
date: 2024-01-01
weight: 10
chapter: false
pre: " <b> 1.10. </b> "
---

## Mục Tiêu Tuần 10

- Cấu hình **VPC Peering** để kết nối hai VPC riêng biệt, cấu hình routing và thiết lập **Network ACL** cho kiểm soát bảo mật không trạng thái (stateless) ở cấp subnet.
- Triển khai **AWS Transit Gateway** để kết nối nhiều VPC theo mô hình hub-and-spoke.
- Xây dựng giải pháp tự động hóa Serverless bằng **AWS Lambda** và **Amazon EventBridge** để tự động Start/Stop EC2 Instance theo lịch và gửi cảnh báo lên Slack.

---

## Kế Hoạch Công Việc

| Thứ | Công việc | Ngày bắt đầu | Ngày hoàn thành | Tài liệu tham khảo |
|---|---|---|---|---|
| 2 | Nghiên cứu VPC Peering và Network ACL. Lab 19 Phần 1: chuẩn bị môi trường mạng bằng CloudFormation, tạo Security Group, khởi chạy EC2. | 22/06/2026 | 22/06/2026 | [VPC Peering](https://docs.aws.amazon.com/vpc/latest/peering/what-is-vpc-peering.html) |
| 3 | Lab 19 Phần 2: cấu hình NACL tùy chỉnh, tạo VPC Peering Connection, cập nhật Route Table và xác nhận DNS resolution qua Peer. | 23/06/2026 | 23/06/2026 | [VPC Peering](https://docs.aws.amazon.com/vpc/latest/peering/what-is-vpc-peering.html) |
| 4 | Nghiên cứu AWS Transit Gateway. Lab 20 Phần 1: thiết lập 3 VPC, tạo Transit Gateway và cấu hình VPC Attachment. | 24/06/2026 | 24/06/2026 | [Transit Gateway](https://docs.aws.amazon.com/vpc/latest/tgw/what-is-transit-gateway.html) |
| 5 | Lab 20 Phần 2: thiết lập Transit Gateway Route Table, thêm route vào VPC Route Table và kiểm tra kết nối liên VPC. | 25/06/2026 | 25/06/2026 | [TGW Route Tables](https://docs.aws.amazon.com/vpc/latest/tgw/tgw-route-tables.html) |
| 6 | Nghiên cứu AWS Lambda và EventBridge Scheduler. Lab 22 Phần 1: thiết lập Slack Webhook, tag EC2, tạo IAM Role cho Lambda. | 26/06/2026 | 26/06/2026 | [Lambda Docs](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) |
| 7 | Lab 22 Phần 2: viết Lambda Python + boto3 để Start/Stop EC2 và thông báo Slack, lên lịch qua EventBridge, dọn dẹp. | 27/06/2026 | 28/06/2026 | [EventBridge Scheduler](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-scheduler.html) |

---

## Kết Quả Đạt Được

### 1. VPC Peering & Network ACL (Lab 19)

#### 1.1. Giới Thiệu

Bài lab thiết lập kết nối mạng riêng tư giữa hai VPC độc lập — **VPC-A** (Default VPC: `172.31.0.0/16`) và **VPC-B** (Custom VPC: `10.10.0.0/16`) — thông qua VPC Peering. Đồng thời triển khai Network ACL để quan sát hành vi stateless ở cấp subnet, so sánh với Security Group (stateful).

#### 1.2. Chuẩn Bị Hạ Tầng (CloudFormation)

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Resources:
  CustomVPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.10.0.0/16
      EnableDnsSupport: true
      EnableDnsHostnames: true
      Tags:
        - Key: Name
          Value: J2Car-Lab-VPC-B
```

- Deploy CloudFormation stack tạo VPC-B với CIDR `10.10.0.0/16`.
- Tạo Security Group cho từng VPC:
  - `SG-VPC-A`: Cho phép SSH (22) từ lab IP và ICMP từ CIDR `10.10.0.0/16` (VPC-B).
  - `SG-VPC-B`: Cho phép SSH (22) từ lab IP và ICMP từ CIDR `172.31.0.0/16` (VPC-A).
- Khởi chạy 1 EC2 instance trong Public Subnet của mỗi VPC.

#### 1.3. Tạo VPC Peering Connection

```bash
# Tạo Peering Connection từ VPC-A sang VPC-B
aws ec2 create-vpc-peering-connection \
  --vpc-id vpc-AAAAAAA \
  --peer-vpc-id vpc-BBBBBBB \
  --peer-region ap-southeast-1

# Chấp nhận từ phía VPC-B
aws ec2 accept-vpc-peering-connection \
  --vpc-peering-connection-id pcx-XXXXXXXX
```

Xác nhận Peering Connection chuyển sang trạng thái `active`.

#### 1.4. Cập Nhật Route Table

```bash
# VPC-A Route Table: định tuyến sang VPC-B qua Peering
aws ec2 create-route \
  --route-table-id rtb-AAAAAAA \
  --destination-cidr-block 10.10.0.0/16 \
  --vpc-peering-connection-id pcx-XXXXXXXX

# VPC-B Route Table: định tuyến sang VPC-A qua Peering
aws ec2 create-route \
  --route-table-id rtb-BBBBBBB \
  --destination-cidr-block 172.31.0.0/16 \
  --vpc-peering-connection-id pcx-XXXXXXXX
```

#### 1.5. Cấu Hình Network ACL (Stateless Firewall)

Tạo Custom NACL và gắn vào Public Subnet của VPC-B:

| Rule # | Type | Protocol | Port | Source CIDR | Action |
|---|---|---|---|---|---|
| 100 | SSH | TCP | 22 | Lab IP/32 | ALLOW |
| 200 | ICMP | ICMP | ALL | 172.31.0.0/16 | ALLOW |
| 300 | Custom TCP | TCP | 1024-65535 | 0.0.0.0/0 | ALLOW |
| * | ALL Traffic | ALL | ALL | 0.0.0.0/0 | DENY |

**Quan sát hành vi stateless của NACL:**
- Khi đổi Rule ICMP từ `ALLOW` → `DENY` trên Inbound: ping từ VPC-A → VPC-B bị block ngay lập tức.
- Khác với Security Group (stateful), NACL yêu cầu cấu hình cả Inbound và Outbound cho cùng một luồng kết nối.

#### 1.6. Bật Cross-Peer DNS Resolution

```bash
aws ec2 modify-vpc-peering-connection-options \
  --vpc-peering-connection-id pcx-XXXXXXXX \
  --requester-peering-connection-options AllowDnsResolutionFromRemoteVpc=true \
  --accepter-peering-connection-options AllowDnsResolutionFromRemoteVpc=true
```

Kiểm tra bằng `nslookup` từ EC2 trong VPC-A — private hostname của EC2 trong VPC-B được phân giải thành công.

---

### 2. AWS Transit Gateway (Lab 20)

#### 2.1. Giới Thiệu

VPC Peering chỉ hoạt động theo cặp và không có tính chất transitive (không thể A→B→C). Khi cần kết nối 10+ VPC, phải tạo N*(N-1)/2 peering connections → rất phức tạp. **Transit Gateway** giải quyết bằng mô hình hub-and-spoke: tất cả VPC kết nối vào 1 TGW duy nhất.

#### 2.2. Thiết Lập 3 VPC

| VPC | CIDR | Mục đích |
|---|---|---|
| VPC-Production | 10.0.0.0/16 | Ứng dụng J2Car |
| VPC-Shared | 10.1.0.0/16 | Dịch vụ dùng chung |
| VPC-Management | 10.2.0.0/16 | Quản trị, monitoring |

Mỗi VPC có Private Subnet và 1 EC2 Instance để kiểm tra kết nối.

#### 2.3. Tạo Transit Gateway

```bash
aws ec2 create-transit-gateway \
  --description "J2Car-Central-TGW" \
  --options AmazonSideAsn=64512,AutoAcceptSharedAttachments=disable,\
DefaultRouteTableAssociation=enable,DefaultRouteTablePropagation=enable,\
VpnEcmpSupport=enable,DnsSupport=enable
```

#### 2.4. Tạo VPC Attachments

```bash
# Gắn VPC-Production
aws ec2 create-transit-gateway-vpc-attachment \
  --transit-gateway-id tgw-XXXXXXXX \
  --vpc-id vpc-PRODUCTION \
  --subnet-ids subnet-PRIVATE-AZ1

# Gắn VPC-Shared
aws ec2 create-transit-gateway-vpc-attachment \
  --transit-gateway-id tgw-XXXXXXXX \
  --vpc-id vpc-SHARED \
  --subnet-ids subnet-SHARED-PRIVATE

# Gắn VPC-Management
aws ec2 create-transit-gateway-vpc-attachment \
  --transit-gateway-id tgw-XXXXXXXX \
  --vpc-id vpc-MGMT \
  --subnet-ids subnet-MGMT-PRIVATE
```

#### 2.5. Cập Nhật Route Table Từng VPC

Mỗi VPC cần route đến các CIDR khác qua Transit Gateway:

```bash
# VPC-Production: route đến VPC-Shared và VPC-Management
aws ec2 create-route \
  --route-table-id rtb-PRODUCTION \
  --destination-cidr-block 10.1.0.0/16 \
  --transit-gateway-id tgw-XXXXXXXX

aws ec2 create-route \
  --route-table-id rtb-PRODUCTION \
  --destination-cidr-block 10.2.0.0/16 \
  --transit-gateway-id tgw-XXXXXXXX
```

#### 2.6. Kiểm Tra Kết Nối

```bash
# Từ EC2 trong VPC-Production, ping EC2 trong VPC-Shared
ping 10.1.0.x -c 4

# Từ EC2 trong VPC-Shared, ping EC2 trong VPC-Management
ping 10.2.0.x -c 4
```

Tất cả 3 VPC kết nối được với nhau thông qua Transit Gateway mà không cần tạo Peering Connection trực tiếp.

---

### 3. Tự Động Hóa Serverless Với Lambda & EventBridge (Lab 22)

#### 3.1. Thiết Lập Slack Webhook

- Tạo Slack App và bật tính năng **Incoming Webhooks**.
- Copy Webhook URL (dạng `https://hooks.slack.com/services/T.../B.../...`).
- Lưu URL vào **AWS Secrets Manager** thay vì hardcode trong code Lambda.

#### 3.2. Tag EC2 Instance

Gán Tag cho các EC2 Instance cần quản lý tự động:
```bash
aws ec2 create-tags \
  --resources i-XXXXXXXX \
  --tags Key=AutoSchedule,Value=true Key=Environment,Value=development
```

#### 3.3. Tạo IAM Role Cho Lambda

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:StartInstances",
        "ec2:StopInstances",
        "ec2:DescribeInstances"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": { "ec2:ResourceTag/AutoSchedule": "true" }
      }
    },
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

#### 3.4. Viết Lambda Function Python

```python
import boto3
import json
import urllib.request
import os

def get_slack_webhook():
    client = boto3.client('secretsmanager', region_name='ap-southeast-1')
    response = client.get_secret_value(SecretId='slack-webhook-url')
    return json.loads(response['SecretString'])['webhook_url']

def notify_slack(webhook_url, message):
    payload = json.dumps({"text": message}).encode('utf-8')
    req = urllib.request.Request(
        webhook_url,
        data=payload,
        headers={'Content-Type': 'application/json'}
    )
    urllib.request.urlopen(req)

def lambda_handler(event, context):
    action = event.get('action', 'stop')  # 'start' hoặc 'stop'
    tag_key = 'AutoSchedule'
    tag_value = 'true'

    ec2 = boto3.client('ec2', region_name='ap-southeast-1')

    # Lấy danh sách EC2 có tag AutoSchedule=true
    response = ec2.describe_instances(
        Filters=[
            {'Name': f'tag:{tag_key}', 'Values': [tag_value]},
            {'Name': 'instance-state-name',
             'Values': ['running'] if action == 'stop' else ['stopped']}
        ]
    )

    instance_ids = []
    for reservation in response['Reservations']:
        for instance in reservation['Instances']:
            instance_ids.append(instance['InstanceId'])

    if not instance_ids:
        notify_slack(get_slack_webhook(),
            f"⚠️ J2Car AutoSchedule: Không tìm thấy instance nào để {action}.")
        return {'statusCode': 200, 'body': 'No instances found'}

    if action == 'stop':
        ec2.stop_instances(InstanceIds=instance_ids)
        msg = f"🔴 J2Car AutoSchedule: Đã STOP {len(instance_ids)} instance(s): {', '.join(instance_ids)}"
    else:
        ec2.start_instances(InstanceIds=instance_ids)
        msg = f"🟢 J2Car AutoSchedule: Đã START {len(instance_ids)} instance(s): {', '.join(instance_ids)}"

    notify_slack(get_slack_webhook(), msg)
    return {'statusCode': 200, 'body': msg}
```

#### 3.5. Cấu Hình EventBridge Scheduler

```bash
# Lịch START lúc 8:00 AM (UTC+7 = 1:00 UTC) Thứ 2-6
aws scheduler create-schedule \
  --name "j2car-start-dev-instances" \
  --schedule-expression "cron(0 1 ? * MON-FRI *)" \
  --target '{"Arn":"arn:aws:lambda:ap-southeast-1:ACCOUNT_ID:function:J2CarAutoSchedule","RoleArn":"arn:aws:iam::ACCOUNT_ID:role/EventBridgeSchedulerRole","Input":"{\"action\":\"start\"}"}' \
  --flexible-time-window '{"Mode":"OFF"}'

# Lịch STOP lúc 10:00 PM (UTC+7 = 15:00 UTC) Thứ 2-6
aws scheduler create-schedule \
  --name "j2car-stop-dev-instances" \
  --schedule-expression "cron(0 15 ? * MON-FRI *)" \
  --target '{"Arn":"arn:aws:lambda:ap-southeast-1:ACCOUNT_ID:function:J2CarAutoSchedule","RoleArn":"arn:aws:iam::ACCOUNT_ID:role/EventBridgeSchedulerRole","Input":"{\"action\":\"stop\"}"}' \
  --flexible-time-window '{"Mode":"OFF"}'
```

#### 3.6. Kiểm Tra Kết Quả

- Trigger Lambda thủ công với `{"action": "stop"}` → EC2 instances dừng lại, Slack nhận thông báo `🔴 J2Car AutoSchedule: Đã STOP...`
- Trigger Lambda với `{"action": "start"}` → EC2 instances khởi động, Slack nhận thông báo `🟢 J2Car AutoSchedule: Đã START...`
- Xác nhận EventBridge Scheduler hiển thị lịch tiếp theo sẽ trigger.

#### 3.7. Dọn Dẹp

```bash
aws scheduler delete-schedule --name "j2car-start-dev-instances"
aws scheduler delete-schedule --name "j2car-stop-dev-instances"
aws lambda delete-function --function-name J2CarAutoSchedule
aws ec2 delete-transit-gateway --transit-gateway-id tgw-XXXXXXXX
```

---

## Tổng Kết Tuần 10

Tuần 10 đi sâu vào hai lĩnh vực quan trọng của kiến trúc AWS: **Thiết kế mạng nâng cao** với VPC Peering (kết nối điểm-điểm) và Transit Gateway (hub-and-spoke cho nhiều VPC), và **Tự động hóa vận hành** với Lambda + EventBridge Scheduler. Giải pháp Auto Start/Stop EC2 giúp tiết kiệm đáng kể chi phí môi trường Development — chỉ chạy trong giờ làm việc.
