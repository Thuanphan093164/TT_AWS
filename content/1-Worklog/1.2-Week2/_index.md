---
title: "Week 2 Worklog"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 1.2. </b> "
---

This week concentrated on hands-on networking in AWS: building a test VPC, segmenting subnets, configuring Internet/NAT gateways, and deploying EC2s to validate network behavior.

### Objectives

- Learn the components and responsibilities inside an Amazon VPC (subnets, IGW, NAT, route tables).
- Build a safe lab environment using public/private subnet separation and appropriate security groups.
- Deploy EC2 instances to verify inbound and outbound connectivity and enable VPC Flow Logs for auditing.

### Schedule (summary)

| Session | Activity | Date |
| --- | --------------------------------------------------------------- | ----- |
| 1 | Review VPC fundamentals, CIDR, subnet types | 27/04/2026 |
| 2 | Design sample VPC and assign CIDR (e.g. `10.10.0.0/16`) | 28/04/2026 |
| 3 | Create IGW, public route table and associate public subnets | 29/04/2026 |
| 4 | Create NAT Gateway on public subnet for private outbound | 30/04/2026 |
| 5 | Configure Security Groups, enable Flow Logs, deploy test EC2s | 01/05/2026 |

### Key outcomes

- Clarified how CIDR and subnetting shape VPC addressing and isolation.
- Deployed a working VPC with public/private subnets, IGW and NAT setup.
- Implemented route tables directing public traffic to IGW and private outbound via NAT.
- Applied Security Groups and enabled VPC Flow Logs to CloudWatch.
- Launched EC2 instances in both public and private subnets and validated connectivity and status checks.

### Detailed practice (complete, no third-party names)

The following are step-by-step AWS CLI commands and notes. All resource names use `training-*` or placeholders — no external personal names or images are included.

1) Create VPC

- Goal: Prepare an isolated network for experiments.
- CLI:

```bash
# Create VPC and tag it
VPC_ID=$(aws ec2 create-vpc --cidr-block 10.10.0.0/16 --query 'Vpc.VpcId' --output text)
aws ec2 create-tags --resources $VPC_ID --tags Key=Name,Value=training-vpc

# Enable DNS hostnames if needed
aws ec2 modify-vpc-attribute --vpc-id $VPC_ID --enable-dns-hostnames
```

2) Subnet planning (2 public, 2 private)

```bash
PUB1=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.10.1.0/24 --availability-zone us-east-1a --query 'Subnet.SubnetId' --output text)
PUB2=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.10.2.0/24 --availability-zone us-east-1b --query 'Subnet.SubnetId' --output text)
PRI1=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.10.3.0/24 --availability-zone us-east-1a --query 'Subnet.SubnetId' --output text)
PRI2=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.10.4.0/24 --availability-zone us-east-1b --query 'Subnet.SubnetId' --output text)

aws ec2 create-tags --resources $PUB1 $PUB2 $PRI1 $PRI2 --tags Key=Name,Value=training-subnet
```

3) Internet Gateway and public route table

```bash
IGW_ID=$(aws ec2 create-internet-gateway --query 'InternetGateway.InternetGatewayId' --output text)
aws ec2 attach-internet-gateway --internet-gateway-id $IGW_ID --vpc-id $VPC_ID

PUB_RTB=$(aws ec2 create-route-table --vpc-id $VPC_ID --query 'RouteTable.RouteTableId' --output text)
aws ec2 create-route --route-table-id $PUB_RTB --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW_ID
aws ec2 associate-route-table --route-table-id $PUB_RTB --subnet-id $PUB1
aws ec2 associate-route-table --route-table-id $PUB_RTB --subnet-id $PUB2
```

4) NAT Gateway for private subnets

```bash
ALLOC_ID=$(aws ec2 allocate-address --domain vpc --query 'AllocationId' --output text)
NAT_ID=$(aws ec2 create-nat-gateway --subnet-id $PUB2 --allocation-id $ALLOC_ID --query 'NatGateway.NatGatewayId' --output text)
aws ec2 wait nat-gateway-available --nat-gateway-ids $NAT_ID

PRI_RTB=$(aws ec2 create-route-table --vpc-id $VPC_ID --query 'RouteTable.RouteTableId' --output text)
aws ec2 create-route --route-table-id $PRI_RTB --destination-cidr-block 0.0.0.0/0 --nat-gateway-id $NAT_ID
aws ec2 associate-route-table --route-table-id $PRI_RTB --subnet-id $PRI1
aws ec2 associate-route-table --route-table-id $PRI_RTB --subnet-id $PRI2
```

5) Security Groups

```bash
PUB_SG=$(aws ec2 create-security-group --group-name training-public-sg --description "Public SG" --vpc-id $VPC_ID --query 'GroupId' --output text)
aws ec2 authorize-security-group-ingress --group-id $PUB_SG --protocol tcp --port 22 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $PUB_SG --protocol icmp --port -1 --cidr 0.0.0.0/0

PRI_SG=$(aws ec2 create-security-group --group-name training-private-sg --description "Private SG" --vpc-id $VPC_ID --query 'GroupId' --output text)
aws ec2 authorize-security-group-ingress --group-id $PRI_SG --protocol tcp --port 22 --source-group $PUB_SG || true
aws ec2 authorize-security-group-ingress --group-id $PRI_SG --protocol tcp --port 80 --cidr 10.10.0.0/16 || true
```

6) Enable VPC Flow Logs

```bash
aws logs create-log-group --log-group-name /aws/vpc/flowlogs || true
aws ec2 create-flow-logs --resource-type VPC --resource-ids $VPC_ID --traffic-type ALL --log-group-name /aws/vpc/flowlogs --deliver-logs-permission-arn $ROLE_ARN
```

7) EC2 deployment

```bash
aws ec2 run-instances --image-id ami-0abcdef1234567890 --count 1 --instance-type t3.micro --subnet-id $PUB1 --security-group-ids $PUB_SG --key-name my-keypair --associate-public-ip-address
aws ec2 run-instances --image-id ami-0abcdef1234567890 --count 1 --instance-type t3.micro --subnet-id $PRI1 --security-group-ids $PRI_SG --key-name my-keypair
```

8) Session Manager (optional)

```bash
# Create role and instance profile for SSM
aws iam create-role --role-name training-ssm-role --assume-role-policy-document file://assume-role-policy.json || true
aws iam attach-role-policy --role-name training-ssm-role --policy-arn arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore || true
```

9) NAT monitoring and alarms

```bash
aws cloudwatch put-metric-alarm --alarm-name NAT-PacketDrop --metric-name PacketDropCount --namespace AWS/NATGateway --statistic Sum --period 300 --threshold 1 --comparison-operator GreaterThanOrEqualToThreshold --dimensions Name=NatGatewayId,Value=$NAT_ID --evaluation-periods 1 --alarm-actions $SNS_ARN
```

10) VPN Site-to-site (optional)

```bash
CGW_ID=$(aws ec2 create-customer-gateway --type ipsec.1 --public-ip x.x.x.x --bgp-asn 65000 --query 'CustomerGateway.CustomerGatewayId' --output text)
VGW_ID=$(aws ec2 create-vpn-gateway --type ipsec.1 --amazon-side-asn 64512 --query 'VpnGateway.VpnGatewayId' --output text)
aws ec2 attach-vpn-gateway --vpn-gateway-id $VGW_ID --vpc-id $VPC_ID
aws ec2 create-vpn-connection --type ipsec.1 --customer-gateway-id $CGW_ID --vpn-gateway-id $VGW_ID
```

11) Verification

- `aws ec2 describe-instances --filters Name=vpc-id,Values=$VPC_ID`
- `aws ec2 describe-route-tables --filters Name=vpc-id,Values=$VPC_ID`
- `aws ec2 describe-flow-logs --filter Name=resource-id,Values=$VPC_ID`

Notes: Replace placeholders (`ami-...`, `my-keypair`, `$ROLE_ARN`, region) with actual values before running.

If you want, I can embed the images into `static/images/worklog/week-2` (download them) or leave the external links as-is. I can also add more concrete AWS CLI examples for each step—say which steps you want CLI for? 

