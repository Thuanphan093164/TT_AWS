---
title: "Worklog Tuần 11"
date: 2024-01-01
weight: 11
chapter: false
pre: " <b> 1.11. </b> "
---

## Mục Tiêu Tuần 11

- Tìm hiểu và thực hành **AWS Cost Management**: Cost Explorer, AWS Budgets, Cost Allocation Tags.
- Nghiên cứu **AWS Well-Architected Framework** và đánh giá kiến trúc J2Car theo 6 trụ cột.
- Triển khai **S3 VPC Gateway Endpoint** để tối ưu chi phí và bảo mật kết nối nội bộ.
- Thực hành **AWS CloudFormation** để Infrastructure as Code hóa toàn bộ hạ tầng J2Car.

---

## Kế Hoạch Công Việc

| Thứ | Công việc | Ngày bắt đầu | Ngày hoàn thành | Tài liệu tham khảo |
|---|---|---|---|---|
| 2 | Tìm hiểu AWS Cost Explorer: xem phân tích chi phí theo dịch vụ, theo tag, theo AZ. | 29/06/2026 | 29/06/2026 | [Cost Explorer](https://docs.aws.amazon.com/cost-management/latest/userguide/ce-what-is.html) |
| 3 | Cấu hình AWS Budgets: tạo Budget cảnh báo chi phí và Usage Budget cho từng dịch vụ. | 30/06/2026 | 30/06/2026 | [AWS Budgets](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html) |
| 4 | Nghiên cứu AWS Well-Architected Framework và đánh giá sơ bộ kiến trúc J2Car theo 6 trụ cột. | 01/07/2026 | 01/07/2026 | [Well-Architected](https://aws.amazon.com/architecture/well-architected/) |
| 5 | Thực hành triển khai S3 VPC Gateway Endpoint và Interface Endpoint — kiểm tra kết nối nội bộ và xác nhận traffic không đi qua NAT Gateway. | 02/07/2026 | 02/07/2026 | [VPC Endpoints](https://docs.aws.amazon.com/vpc/latest/privatelink/vpc-endpoints.html) |
| 6 | Bắt đầu viết CloudFormation template cho hạ tầng mạng J2Car (VPC, Subnets, IGW, NAT, Route Tables, Security Groups). | 03/07/2026 | 03/07/2026 | [CloudFormation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html) |
| 7 | Tiếp tục CloudFormation: thêm ECS Cluster, Task Definition, ALB, Target Groups và cấu hình Auto Scaling. | 04/07/2026 | 05/07/2026 | [CloudFormation ECS](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-ecs-cluster.html) |

---

## Kết Quả Đạt Được

### 1. AWS Cost Management

#### 1.1. AWS Cost Explorer

AWS Cost Explorer là công cụ trực quan hóa và phân tích chi phí AWS, giúp hiểu rõ cơ cấu chi tiêu và phát hiện điểm bất thường.

**Các thao tác thực hành:**
- Xem chi phí theo **Service**: xác định dịch vụ nào tiêu tốn nhiều nhất (thường là EC2, RDS, NAT Gateway).
- Lọc chi phí theo **Tag** (`Environment: production` / `Environment: development`) — phân biệt chi phí môi trường production và dev.
- Phân tích theo **Availability Zone**: phát hiện chi phí phân bổ không đều giữa AZ1 và AZ2.
- Sử dụng **Savings Plans Recommendations** để xem AWS đề xuất mua Compute Savings Plans giảm chi phí Fargate bao nhiêu %.

**Phát hiện quan trọng:**
- **NAT Gateway** thường chiếm 15-25% tổng chi phí khi có nhiều container gọi ra Internet — đây là lý do chính dẫn đến việc triển khai S3 VPC Gateway Endpoint để bypass NAT cho traffic S3.
- **Data Transfer Out** cũng là ẩn số chi phí lớn — lượng ảnh sản phẩm phụ tùng phân phối qua CloudFront giúp tiết kiệm đáng kể so với phục vụ trực tiếp từ EC2.

#### 1.2. Cấu Hình AWS Budgets

```bash
# Tạo Monthly Cost Budget $100
aws budgets create-budget \
  --account-id ACCOUNT_ID \
  --budget '{
    "BudgetName": "J2Car-Monthly-Budget",
    "BudgetLimit": {"Amount": "100", "Unit": "USD"},
    "TimeUnit": "MONTHLY",
    "BudgetType": "COST"
  }' \
  --notifications-with-subscribers '[{
    "Notification": {
      "NotificationType": "ACTUAL",
      "ComparisonOperator": "GREATER_THAN",
      "Threshold": 80,
      "ThresholdType": "PERCENTAGE"
    },
    "Subscribers": [{
      "SubscriptionType": "EMAIL",
      "Address": "your-email@example.com"
    }]
  }]'
```

**Cấu hình các Budget cảnh báo:**
- **80% actual cost** → Email cảnh báo "Đã dùng 80% ngân sách tháng"
- **100% actual cost** → Email cảnh báo "Đã vượt ngân sách tháng"
- **100% forecasted cost** → Email cảnh báo "Dự báo sẽ vượt ngân sách"

**Sử dụng Cost Allocation Tags:**
```bash
# Kích hoạt tag dùng để phân bổ chi phí
aws ce list-cost-allocation-tags --status Active

# Gán tag cho tài nguyên J2Car
aws ec2 create-tags \
  --resources vpc-XXXXXXXX subnet-YYYYYYYY \
  --tags Key=Project,Value=J2Car Key=CostCenter,Value=Engineering
```

---

### 2. AWS Well-Architected Framework — Đánh Giá J2Car

AWS Well-Architected Framework gồm 6 trụ cột để đánh giá và cải thiện kiến trúc cloud:

#### 2.1. Operational Excellence (Xuất Sắc Vận Hành)

| Tiêu chí | Đánh giá J2Car | Mức độ |
|---|---|---|
| Infrastructure as Code | CloudFormation template cho toàn bộ hạ tầng | ✅ Đạt |
| Observability | CloudWatch Metrics + Container Insights + Firelens | ✅ Đạt |
| CI/CD Pipeline | GitLab CI/CD + CodeBuild tự động deploy | ✅ Đạt |
| Runbook/Playbook | Chưa có tài liệu xử lý sự cố | ⚠️ Cần bổ sung |

#### 2.2. Security (Bảo Mật)

| Tiêu chí | Đánh giá J2Car | Mức độ |
|---|---|---|
| Identity & Access | IAM Role with Least Privilege, không dùng Root | ✅ Đạt |
| Infrastructure Protection | WAF + Security Groups Chaining + Private Subnets | ✅ Đạt |
| Data Protection | KMS Encryption at Rest, Secrets Manager | ✅ Đạt |
| Incident Response | CloudWatch Alarms + SNS chưa tích hợp PagerDuty | ⚠️ Cần nâng cao |

#### 2.3. Reliability (Độ Tin Cậy)

| Tiêu chí | Đánh giá J2Car | Mức độ |
|---|---|---|
| Multi-AZ Deployment | ALB + ECS + DocumentDB + Redis đều Multi-AZ | ✅ Đạt |
| Auto Scaling | ECS Auto Scaling Group theo CPU Utilization | ✅ Đạt |
| Backup & Recovery | AWS Backup chụp snapshot DocumentDB hàng ngày | ✅ Đạt |
| Chaos Engineering | Chưa thực hiện Fault Injection Simulator | ⚠️ Cần bổ sung |

#### 2.4. Performance Efficiency (Hiệu Năng)

| Tiêu chí | Đánh giá J2Car | Mức độ |
|---|---|---|
| Caching | ElastiCache Redis Cache-Aside cho API phụ tùng | ✅ Đạt |
| CDN | CloudFront phân phối toàn cầu | ✅ Đạt |
| Right-sizing | ECS Fargate 0.25 vCPU baseline, scale khi cần | ✅ Đạt |
| Database Optimization | DocumentDB Read Replica giảm tải Primary | ✅ Đạt |

#### 2.5. Cost Optimization (Tối Ưu Chi Phí)

| Tiêu chí | Đánh giá J2Car | Mức độ |
|---|---|---|
| S3 VPC Endpoint | Bypass NAT Gateway cho S3 traffic | ✅ Đạt |
| Pre-signed URL Upload | Browser upload thẳng S3, không qua Fargate | ✅ Đạt |
| Serverless Lambda/SQS | Chỉ trả phí khi có webhook thực tế | ✅ Đạt |
| Savings Plans | Chưa mua Compute Savings Plans | ⚠️ Cân nhắc khi stable |

#### 2.6. Sustainability (Bền Vững)

| Tiêu chí | Đánh giá J2Car | Mức độ |
|---|---|---|
| Right-sizing | Fargate Spot cho non-critical tasks | ⚠️ Cân nhắc |
| Region Selection | ap-southeast-1 — AWS có cam kết năng lượng tái tạo | ✅ Đạt |

---

### 3. S3 VPC Gateway Endpoint (Lab Thực Hành)

#### 3.1. Vấn Đề Không Có Endpoint

Khi ECS Backend trong Private Subnet gọi `PutObject` upload ảnh lên S3:
```
ECS Task (Private Subnet)
  → NAT Gateway (tốn $0.045/GB)
  → Internet
  → S3 Public Endpoint
```
Chi phí NAT Gateway tăng tuyến tính theo dung lượng ảnh phụ tùng được upload.

#### 3.2. Giải Pháp: S3 Gateway VPC Endpoint

```
ECS Task (Private Subnet)
  → S3 Gateway VPC Endpoint (MIỄN PHÍ)
  → S3 Private Endpoint (qua mạng nội bộ AWS)
```

**Tạo S3 Gateway Endpoint:**
```bash
aws ec2 create-vpc-endpoint \
  --vpc-id vpc-XXXXXXXX \
  --service-name com.amazonaws.ap-southeast-1.s3 \
  --route-table-ids rtb-PRIVATE-AZ1 rtb-PRIVATE-AZ2 \
  --vpc-endpoint-type Gateway
```

**Xác nhận trong Route Table:**
Sau khi tạo, Route Table của Private Subnet tự động thêm entry:
```
Destination: pl-XXXXXXXX (S3 prefix list)
Target:      vpce-XXXXXXXX (VPC Endpoint)
```

**Kiểm Tra Kết Nối Từ ECS Task:**
```bash
# Test không qua NAT
curl -I https://s3.ap-southeast-1.amazonaws.com/j2car-media-bucket/
# Header X-Amz-Request-Id phải xuất hiện → kết nối thành công qua Endpoint
```

Sau khi bật Endpoint, kiểm tra CloudWatch Metric `BytesProcessed` của NAT Gateway — lưu lượng S3 giảm rõ rệt.

---

### 4. Infrastructure as Code Với CloudFormation

#### 4.1. Cấu Trúc Template J2Car

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: J2Car AutoParts - Network Infrastructure

Parameters:
  Environment:
    Type: String
    Default: production
    AllowedValues: [production, staging, development]
  
  VpcCidr:
    Type: String
    Default: '10.0.0.0/16'

Resources:
  # === VPC ===
  J2CarVPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: !Ref VpcCidr
      EnableDnsSupport: true
      EnableDnsHostnames: true
      Tags:
        - Key: Name
          Value: !Sub 'J2Car-${Environment}-VPC'
        - Key: Project
          Value: J2Car

  # === Internet Gateway ===
  InternetGateway:
    Type: AWS::EC2::InternetGateway
    Properties:
      Tags:
        - Key: Name
          Value: !Sub 'J2Car-${Environment}-IGW'

  IGWAttachment:
    Type: AWS::EC2::VPCGatewayAttachment
    Properties:
      VpcId: !Ref J2CarVPC
      InternetGatewayId: !Ref InternetGateway

  # === Public Subnets ===
  PublicSubnet1:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref J2CarVPC
      CidrBlock: '10.0.1.0/24'
      AvailabilityZone: !Select [0, !GetAZs '']
      MapPublicIpOnLaunch: true
      Tags:
        - Key: Name
          Value: J2Car-Public-Subnet-AZ1

  PublicSubnet2:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref J2CarVPC
      CidrBlock: '10.0.2.0/24'
      AvailabilityZone: !Select [1, !GetAZs '']
      MapPublicIpOnLaunch: true
      Tags:
        - Key: Name
          Value: J2Car-Public-Subnet-AZ2

  # === Private Subnets (App Tier) ===
  PrivateSubnetApp1:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref J2CarVPC
      CidrBlock: '10.0.3.0/24'
      AvailabilityZone: !Select [0, !GetAZs '']
      Tags:
        - Key: Name
          Value: J2Car-Private-App-Subnet-AZ1

  PrivateSubnetApp2:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref J2CarVPC
      CidrBlock: '10.0.4.0/24'
      AvailabilityZone: !Select [1, !GetAZs '']
      Tags:
        - Key: Name
          Value: J2Car-Private-App-Subnet-AZ2

  # === NAT Gateways ===
  EIP1:
    Type: AWS::EC2::EIP
    Properties:
      Domain: vpc

  EIP2:
    Type: AWS::EC2::EIP
    Properties:
      Domain: vpc

  NatGateway1:
    Type: AWS::EC2::NatGateway
    Properties:
      AllocationId: !GetAtt EIP1.AllocationId
      SubnetId: !Ref PublicSubnet1
      Tags:
        - Key: Name
          Value: J2Car-NAT-GW-AZ1

  NatGateway2:
    Type: AWS::EC2::NatGateway
    Properties:
      AllocationId: !GetAtt EIP2.AllocationId
      SubnetId: !Ref PublicSubnet2
      Tags:
        - Key: Name
          Value: J2Car-NAT-GW-AZ2

  # === S3 VPC Gateway Endpoint ===
  S3GatewayEndpoint:
    Type: AWS::EC2::VPCEndpoint
    Properties:
      VpcId: !Ref J2CarVPC
      ServiceName: !Sub 'com.amazonaws.${AWS::Region}.s3'
      VpcEndpointType: Gateway
      RouteTableIds:
        - !Ref PrivateRouteTableAZ1
        - !Ref PrivateRouteTableAZ2

Outputs:
  VpcId:
    Value: !Ref J2CarVPC
    Export:
      Name: !Sub '${AWS::StackName}-VpcId'
  
  PublicSubnet1Id:
    Value: !Ref PublicSubnet1
    Export:
      Name: !Sub '${AWS::StackName}-PublicSubnet1'
```

#### 4.2. Deploy CloudFormation Stack

```bash
# Validate template trước khi deploy
aws cloudformation validate-template \
  --template-body file://j2car-network.yaml

# Deploy stack
aws cloudformation create-stack \
  --stack-name J2Car-Network-Production \
  --template-body file://j2car-network.yaml \
  --parameters \
    ParameterKey=Environment,ParameterValue=production \
    ParameterKey=VpcCidr,ParameterValue=10.0.0.0/16 \
  --capabilities CAPABILITY_IAM \
  --tags Key=Project,Value=J2Car Key=ManagedBy,Value=CloudFormation

# Theo dõi progress
aws cloudformation describe-stack-events \
  --stack-name J2Car-Network-Production \
  --query 'StackEvents[?ResourceStatus==`CREATE_FAILED`]'
```

#### 4.3. Kết Quả Triển Khai

Stack `J2Car-Network-Production` triển khai thành công với `CREATE_COMPLETE`, tạo ra:
- 1 VPC, 1 IGW, 6 Subnets (2 Public + 4 Private)
- 2 NAT Gateways với Elastic IP
- 1 S3 Gateway VPC Endpoint
- Route Tables đầy đủ cho từng lớp mạng

---

## Tổng Kết Tuần 11

Tuần 11 tập trung vào **tối ưu hóa và chuẩn hóa hạ tầng J2Car**: đánh giá chi phí thực tế qua Cost Explorer, thiết lập hệ thống cảnh báo Budget tự động, kiểm tra kiến trúc theo chuẩn Well-Architected Framework và hoàn thiện bước quan trọng nhất — Infrastructure as Code hóa toàn bộ hạ tầng mạng bằng CloudFormation. Hạ tầng J2Car giờ đây có thể được tái tạo hoàn toàn chỉ bằng một lệnh `aws cloudformation create-stack`.
