---
title: "Week 11 Worklog"
date: 2024-01-01
weight: 11
chapter: false
pre: " <b> 1.11. </b> "
---

## Week 11 Objectives

- Study and practice **AWS Cost Management**: Cost Explorer, AWS Budgets, and Cost Allocation Tags.
- Evaluate J2Car architecture against the **AWS Well-Architected Framework** across all 6 pillars.
- Deploy **S3 VPC Gateway Endpoint** to optimize costs and secure internal S3 connectivity.
- Practice **AWS CloudFormation** to fully codify J2Car infrastructure as code (IaC).

---

## Weekly Task Plan

| Day | Task | Start Date | End Date | Reference |
|---|---|---|---|---|
| 2 | Study AWS Cost Explorer: analyze costs by service, by tag, and by Availability Zone. | 29/06/2026 | 29/06/2026 | [Cost Explorer](https://docs.aws.amazon.com/cost-management/latest/userguide/ce-what-is.html) |
| 3 | Configure AWS Budgets: create cost alerts and Usage Budgets per service. | 30/06/2026 | 30/06/2026 | [AWS Budgets](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html) |
| 4 | Study the AWS Well-Architected Framework and evaluate J2Car architecture across all 6 pillars. | 01/07/2026 | 01/07/2026 | [Well-Architected](https://aws.amazon.com/architecture/well-architected/) |
| 5 | Deploy S3 VPC Gateway Endpoint and Interface Endpoint — test internal connectivity and confirm traffic bypasses NAT Gateway. | 02/07/2026 | 02/07/2026 | [VPC Endpoints](https://docs.aws.amazon.com/vpc/latest/privatelink/vpc-endpoints.html) |
| 6 | Start writing CloudFormation template for J2Car network infrastructure (VPC, Subnets, IGW, NAT, Route Tables, Security Groups). | 03/07/2026 | 03/07/2026 | [CloudFormation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html) |
| 7 | Continue CloudFormation: add ECS Cluster, Task Definitions, ALB, Target Groups, and Auto Scaling configuration. | 04/07/2026 | 05/07/2026 | [CloudFormation ECS](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-ecs-cluster.html) |

---

## Weekly Achievements

### 1. AWS Cost Management

#### 1.1. AWS Cost Explorer
- Reviewed costs by **Service**: identified top spenders (typically EC2, RDS, NAT Gateway).
- Filtered by **Tag** (`Environment: production` / `Environment: development`) to separate production vs development costs.
- Analyzed by **Availability Zone**: detected uneven cost distribution between AZ1 and AZ2.
- Reviewed **Savings Plans Recommendations** for potential Compute Savings Plan discounts on Fargate usage.

**Key Findings:**
- **NAT Gateway** typically accounts for 15–25% of total cost when many containers call external APIs — a primary driver for deploying the S3 VPC Gateway Endpoint to bypass NAT for S3 traffic.
- **Data Transfer Out** is a major hidden cost — product image distribution via CloudFront saves significantly compared to serving directly from EC2.

#### 1.2. AWS Budgets Configuration
```bash
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
    "Subscribers": [{"SubscriptionType": "EMAIL", "Address": "your-email@example.com"}]
  }]'
```

Alert thresholds configured: **80% actual** → warning email; **100% actual** → over-budget alert; **100% forecasted** → predictive warning.

---

### 2. AWS Well-Architected Framework — J2Car Review

#### 2.1. Operational Excellence

| Criteria | J2Car Implementation | Status |
|---|---|---|
| Infrastructure as Code | CloudFormation template for all infrastructure | ✅ |
| Observability | CloudWatch Metrics + Container Insights + Firelens | ✅ |
| CI/CD Pipeline | GitLab CI/CD + CodeBuild automated deployments | ✅ |
| Runbook/Playbook | No incident response documentation yet | ⚠️ |

#### 2.2. Security

| Criteria | J2Car Implementation | Status |
|---|---|---|
| Identity & Access | IAM Least Privilege Roles, no Root usage | ✅ |
| Infrastructure Protection | WAF + Security Group Chaining + Private Subnets | ✅ |
| Data Protection | KMS Encryption at Rest, Secrets Manager | ✅ |
| Incident Response | CloudWatch Alarms + SNS, no PagerDuty integration yet | ⚠️ |

#### 2.3. Reliability

| Criteria | J2Car Implementation | Status |
|---|---|---|
| Multi-AZ Deployment | ALB + ECS + DocumentDB + Redis — all Multi-AZ | ✅ |
| Auto Scaling | ECS Auto Scaling based on CPU Utilization | ✅ |
| Backup & Recovery | AWS Backup daily DocumentDB snapshots | ✅ |
| Chaos Engineering | No Fault Injection Simulator testing yet | ⚠️ |

#### 2.4. Performance Efficiency

| Criteria | J2Car Implementation | Status |
|---|---|---|
| Caching | ElastiCache Redis Cache-Aside for parts catalog API | ✅ |
| CDN | CloudFront global content distribution | ✅ |
| Right-sizing | ECS Fargate 0.25 vCPU baseline, scale on demand | ✅ |
| Database Optimization | DocumentDB Read Replica offloads Primary | ✅ |

#### 2.5. Cost Optimization

| Criteria | J2Car Implementation | Status |
|---|---|---|
| S3 VPC Endpoint | Bypass NAT Gateway for S3 traffic | ✅ |
| Pre-signed URL Upload | Browser uploads directly to S3 | ✅ |
| Serverless Lambda/SQS | Pay only per actual Webhook invocation | ✅ |
| Savings Plans | Not yet purchased Compute Savings Plans | ⚠️ |

---

### 3. S3 VPC Gateway Endpoint

#### 3.1. Problem Without Endpoint
```
ECS Task (Private Subnet) → NAT Gateway ($0.045/GB) → Internet → S3 Public Endpoint
```
NAT costs scale linearly with product image upload volume.

#### 3.2. Solution: S3 Gateway VPC Endpoint (Free)
```
ECS Task (Private Subnet) → S3 Gateway VPC Endpoint (FREE) → S3 (via AWS internal network)
```

```bash
aws ec2 create-vpc-endpoint \
  --vpc-id vpc-XXXXXXXX \
  --service-name com.amazonaws.ap-southeast-1.s3 \
  --route-table-ids rtb-PRIVATE-AZ1 rtb-PRIVATE-AZ2 \
  --vpc-endpoint-type Gateway
```

Private Route Tables automatically receive an entry:
```
Destination: pl-XXXXXXXX (S3 prefix list)  →  Target: vpce-XXXXXXXX
```

**Verification:**
```bash
curl -I https://s3.ap-southeast-1.amazonaws.com/j2car-media-bucket/
# X-Amz-Request-Id header confirms connectivity via Endpoint
```

After enabling the Endpoint, NAT Gateway `BytesProcessed` CloudWatch metric dropped significantly.

---

### 4. Infrastructure as Code with CloudFormation

#### 4.1. J2Car CloudFormation Template Structure
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
  J2CarVPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: !Ref VpcCidr
      EnableDnsSupport: true
      EnableDnsHostnames: true
      Tags:
        - Key: Name
          Value: !Sub 'J2Car-${Environment}-VPC'

  NatGateway1:
    Type: AWS::EC2::NatGateway
    Properties:
      AllocationId: !GetAtt EIP1.AllocationId
      SubnetId: !Ref PublicSubnet1

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
```

#### 4.2. Deploy Stack
```bash
aws cloudformation validate-template --template-body file://j2car-network.yaml

aws cloudformation create-stack \
  --stack-name J2Car-Network-Production \
  --template-body file://j2car-network.yaml \
  --parameters \
    ParameterKey=Environment,ParameterValue=production \
    ParameterKey=VpcCidr,ParameterValue=10.0.0.0/16 \
  --capabilities CAPABILITY_IAM \
  --tags Key=Project,Value=J2Car Key=ManagedBy,Value=CloudFormation
```

**Result:** Stack `J2Car-Network-Production` completed `CREATE_COMPLETE` with VPC, IGW, 6 Subnets, 2 NAT Gateways, and S3 Gateway Endpoint all deployed from a single command.

---

## Week 11 Summary

Week 11 focused on **optimizing and standardizing J2Car infrastructure**: reviewing actual costs via Cost Explorer, establishing automated Budget alerting, evaluating architecture against the Well-Architected Framework, and completing the most important step — codifying the entire network infrastructure as CloudFormation IaC. The J2Car infrastructure can now be fully recreated with a single `aws cloudformation create-stack` command.
