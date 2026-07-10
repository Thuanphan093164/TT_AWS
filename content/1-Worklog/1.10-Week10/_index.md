---
title: "Week 10 Worklog"
date: 2024-01-01
weight: 10
chapter: false
pre: " <b> 1.10. </b> "
---

## Week 10 Objectives

- Configure **VPC Peering** to connect two independent VPCs, set up routing, and implement **Network ACLs** for stateless subnet-level security control.
- Deploy **AWS Transit Gateway** to connect multiple VPCs in a hub-and-spoke model.
- Build a Serverless automation solution with **AWS Lambda** and **Amazon EventBridge** to automatically Start/Stop EC2 instances on schedule and send alerts to Slack.

---

## Weekly Task Plan

| Day | Task | Start Date | End Date | Reference |
|---|---|---|---|---|
| 2 | Study VPC Peering and Network ACLs. Lab 19 Part 1: prepare network environment via CloudFormation, create Security Groups, launch EC2 instances. | 22/06/2026 | 22/06/2026 | [VPC Peering](https://docs.aws.amazon.com/vpc/latest/peering/what-is-vpc-peering.html) |
| 3 | Lab 19 Part 2: configure custom NACLs, create VPC Peering Connection, update Route Tables, verify DNS resolution across Peer. | 23/06/2026 | 23/06/2026 | [VPC Peering](https://docs.aws.amazon.com/vpc/latest/peering/what-is-vpc-peering.html) |
| 4 | Study AWS Transit Gateway. Lab 20 Part 1: set up 3 VPCs, create Transit Gateway, configure VPC Attachments. | 24/06/2026 | 24/06/2026 | [Transit Gateway](https://docs.aws.amazon.com/vpc/latest/tgw/what-is-transit-gateway.html) |
| 5 | Lab 20 Part 2: set up Transit Gateway Route Tables, add routes to VPC Route Tables, verify cross-VPC connectivity. | 25/06/2026 | 25/06/2026 | [TGW Route Tables](https://docs.aws.amazon.com/vpc/latest/tgw/tgw-route-tables.html) |
| 6 | Study AWS Lambda and EventBridge Scheduler. Lab 22 Part 1: set up Slack Webhook, tag EC2 instances, create IAM Role for Lambda. | 26/06/2026 | 26/06/2026 | [Lambda Docs](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) |
| 7 | Lab 22 Part 2: write Python Lambda + boto3 for EC2 Start/Stop with Slack notifications, schedule via EventBridge, clean up. | 27/06/2026 | 28/06/2026 | [EventBridge Scheduler](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-scheduler.html) |

---

## Weekly Achievements

### 1. VPC Peering & Network ACL (Lab 19)

#### 1.1. Introduction
This lab established private network connectivity between two independent VPCs — **VPC-A** (Default VPC: `172.31.0.0/16`) and **VPC-B** (Custom VPC: `10.10.0.0/16`) — via VPC Peering, while implementing Network ACLs to observe stateless subnet-level firewall behavior compared to stateful Security Groups.

#### 1.2. Infrastructure Preparation (CloudFormation)
- Deployed CloudFormation stack creating VPC-B with CIDR `10.10.0.0/16`.
- Created Security Groups allowing ICMP cross-VPC and SSH from lab IP only.
- Launched 1 EC2 instance in each VPC's Public Subnet.

#### 1.3. Create VPC Peering Connection
```bash
aws ec2 create-vpc-peering-connection \
  --vpc-id vpc-AAAAAAA --peer-vpc-id vpc-BBBBBBB --peer-region ap-southeast-1

aws ec2 accept-vpc-peering-connection \
  --vpc-peering-connection-id pcx-XXXXXXXX
```

#### 1.4. Update Route Tables
```bash
# VPC-A: route to VPC-B via Peering
aws ec2 create-route --route-table-id rtb-AAAAAAA \
  --destination-cidr-block 10.10.0.0/16 --vpc-peering-connection-id pcx-XXXXXXXX

# VPC-B: route to VPC-A via Peering
aws ec2 create-route --route-table-id rtb-BBBBBBB \
  --destination-cidr-block 172.31.0.0/16 --vpc-peering-connection-id pcx-XXXXXXXX
```

#### 1.5. Custom Network ACL (Stateless Firewall)

| Rule # | Type | Protocol | Port | Source CIDR | Action |
|---|---|---|---|---|---|
| 100 | SSH | TCP | 22 | Lab IP/32 | ALLOW |
| 200 | ICMP | ICMP | ALL | 172.31.0.0/16 | ALLOW |
| 300 | Custom TCP | TCP | 1024-65535 | 0.0.0.0/0 | ALLOW |
| * | ALL Traffic | ALL | ALL | 0.0.0.0/0 | DENY |

**Key Observation:** Changing the ICMP rule from `ALLOW` to `DENY` on Inbound immediately blocked pings from VPC-A. Unlike stateful Security Groups, NACLs require explicit configuration for both Inbound and Outbound for the same traffic flow.

#### 1.6. Cross-Peer DNS Resolution
```bash
aws ec2 modify-vpc-peering-connection-options \
  --vpc-peering-connection-id pcx-XXXXXXXX \
  --requester-peering-connection-options AllowDnsResolutionFromRemoteVpc=true \
  --accepter-peering-connection-options AllowDnsResolutionFromRemoteVpc=true
```
Verified: `nslookup` from VPC-A EC2 successfully resolved the private hostname of VPC-B EC2.

---

### 2. AWS Transit Gateway (Lab 20)

#### 2.1. Introduction
VPC Peering only works in pairs and is not transitive (A→B→C is impossible). Connecting 10+ VPCs requires N*(N-1)/2 peering connections — extremely complex. **Transit Gateway** solves this with a hub-and-spoke model: all VPCs connect to a single TGW.

#### 2.2. Three-VPC Setup

| VPC | CIDR | Purpose |
|---|---|---|
| VPC-Production | 10.0.0.0/16 | J2Car Application |
| VPC-Shared | 10.1.0.0/16 | Shared Services |
| VPC-Management | 10.2.0.0/16 | Operations & Monitoring |

Each VPC has a Private Subnet and an EC2 instance for connectivity testing.

#### 2.3. Create Transit Gateway
```bash
aws ec2 create-transit-gateway \
  --description "J2Car-Central-TGW" \
  --options AmazonSideAsn=64512,AutoAcceptSharedAttachments=disable,\
DefaultRouteTableAssociation=enable,DefaultRouteTablePropagation=enable,\
VpnEcmpSupport=enable,DnsSupport=enable
```

#### 2.4. Create VPC Attachments
```bash
aws ec2 create-transit-gateway-vpc-attachment \
  --transit-gateway-id tgw-XXXXXXXX \
  --vpc-id vpc-PRODUCTION --subnet-ids subnet-PRIVATE-AZ1

# Repeat for VPC-Shared and VPC-Management
```

#### 2.5. Update VPC Route Tables
```bash
# VPC-Production: route to VPC-Shared and VPC-Management
aws ec2 create-route --route-table-id rtb-PRODUCTION \
  --destination-cidr-block 10.1.0.0/16 --transit-gateway-id tgw-XXXXXXXX

aws ec2 create-route --route-table-id rtb-PRODUCTION \
  --destination-cidr-block 10.2.0.0/16 --transit-gateway-id tgw-XXXXXXXX
```

#### 2.6. Connectivity Verification
```bash
ping 10.1.0.x -c 4   # From VPC-Production to VPC-Shared
ping 10.2.0.x -c 4   # From VPC-Shared to VPC-Management
```
All 3 VPCs communicated successfully through the Transit Gateway without any direct Peering Connections.

---

### 3. Serverless Automation with Lambda & EventBridge (Lab 22)

#### 3.1. Slack Webhook Setup
- Created a Slack App, enabled **Incoming Webhooks**, and saved the Webhook URL to **AWS Secrets Manager**.

#### 3.2. Tag EC2 Instances
```bash
aws ec2 create-tags --resources i-XXXXXXXX \
  --tags Key=AutoSchedule,Value=true Key=Environment,Value=development
```

#### 3.3. IAM Role for Lambda
```json
{
  "Effect": "Allow",
  "Action": ["ec2:StartInstances", "ec2:StopInstances", "ec2:DescribeInstances"],
  "Resource": "*",
  "Condition": { "StringEquals": { "ec2:ResourceTag/AutoSchedule": "true" } }
}
```

#### 3.4. Lambda Function (Python)
```python
import boto3, json, urllib.request

def lambda_handler(event, context):
    action = event.get('action', 'stop')
    ec2 = boto3.client('ec2', region_name='ap-southeast-1')

    response = ec2.describe_instances(Filters=[
        {'Name': 'tag:AutoSchedule', 'Values': ['true']},
        {'Name': 'instance-state-name',
         'Values': ['running'] if action == 'stop' else ['stopped']}
    ])

    instance_ids = [
        inst['InstanceId']
        for r in response['Reservations']
        for inst in r['Instances']
    ]

    if action == 'stop':
        ec2.stop_instances(InstanceIds=instance_ids)
        msg = f"🔴 J2Car AutoSchedule: STOPPED {len(instance_ids)} instance(s)"
    else:
        ec2.start_instances(InstanceIds=instance_ids)
        msg = f"🟢 J2Car AutoSchedule: STARTED {len(instance_ids)} instance(s)"

    # Notify Slack
    payload = json.dumps({"text": msg}).encode('utf-8')
    req = urllib.request.Request(get_slack_webhook(), data=payload,
                                 headers={'Content-Type': 'application/json'})
    urllib.request.urlopen(req)
    return {'statusCode': 200, 'body': msg}
```

#### 3.5. EventBridge Schedules
```bash
# START at 8:00 AM (UTC+7 = 1:00 UTC) Mon–Fri
aws scheduler create-schedule \
  --name "j2car-start-dev-instances" \
  --schedule-expression "cron(0 1 ? * MON-FRI *)" \
  --target '{"Arn":"...lambda...","Input":"{\"action\":\"start\"}"}'

# STOP at 10:00 PM (UTC+7 = 15:00 UTC) Mon–Fri
aws scheduler create-schedule \
  --name "j2car-stop-dev-instances" \
  --schedule-expression "cron(0 15 ? * MON-FRI *)" \
  --target '{"Arn":"...lambda...","Input":"{\"action\":\"stop\"}"}'
```

#### 3.6. Verification
- Triggered Lambda manually with `{"action": "stop"}` → EC2 instances stopped, Slack received `🔴 J2Car AutoSchedule: STOPPED...`
- Triggered with `{"action": "start"}` → EC2 instances started, Slack received `🟢 J2Car AutoSchedule: STARTED...`

---

## Week 10 Summary

Week 10 explored two critical AWS architecture domains: **Advanced networking** with VPC Peering (point-to-point) and Transit Gateway (hub-and-spoke for multi-VPC), and **operational automation** with Lambda + EventBridge Scheduler. The Auto Start/Stop EC2 solution delivers meaningful cost savings for development environments by running instances only during business hours.
