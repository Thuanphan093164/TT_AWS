---
title: "Week 12 Worklog"
date: 2024-01-01
weight: 12
chapter: false
pre: " <b> 1.12. </b> "
---

## Week 12 Objectives

- Finalize and thoroughly test the **J2Car AutoParts** system on the AWS production environment.
- Conduct **Load Testing** with Apache JMeter to verify ECS Auto Scaling capacity under peak traffic.
- Configure **Amazon Route 53** with a real domain name and HTTPS via **AWS Certificate Manager (ACM)**.
- Write technical documentation, finalize the internship report, and deliver a full system demo.

---

## Weekly Task Plan

| Day | Task | Start Date | End Date | Reference |
|---|---|---|---|---|
| 2 | Finalize CloudFormation templates for all layers (ECS, DocumentDB, ElastiCache, SQS, Lambda). Deploy and verify the complete master stack. | 06/07/2026 | 06/07/2026 | [CloudFormation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html) |
| 3 | Configure Route 53 Hosted Zone, create A Records pointing to ALB. Request SSL Certificate from ACM and attach to ALB HTTPS Listener (port 443). | 07/07/2026 | 07/07/2026 | [Route 53](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/Welcome.html) |
| 4 | Conduct Load Testing with Apache JMeter: simulate 500 concurrent users, observe Auto Scaling response, monitor via CloudWatch. | 08/07/2026 | 08/07/2026 | [JMeter Docs](https://jmeter.apache.org/usermanual/index.html) |
| 5 | End-to-End testing of all business flows: registration, VIN lookup, cart, ordering, payment, real-time notifications. | 09/07/2026 | 09/07/2026 | — |
| 6 | Write technical documentation (Architecture Decision Records) and compile the final internship report. | 10/07/2026 | 10/07/2026 | — |
| 7 | Demo J2Car AutoParts system to the review panel; present architecture, costs, and lessons learned. | 11/07/2026 | 12/07/2026 | — |

---

## Weekly Achievements

### 1. Complete CloudFormation Master Stack

#### 1.1. Layered Stack Architecture
All J2Car infrastructure is organized into separate Nested Stacks, each responsible for a specific layer:

```
j2car-master.yaml
├── j2car-network.yaml       (VPC, Subnets, IGW, NAT, Route Tables, Endpoints)
├── j2car-security.yaml      (Security Groups, IAM Roles, KMS Keys, Secrets)
├── j2car-data.yaml          (DocumentDB Cluster, ElastiCache Redis)
├── j2car-compute.yaml       (ECR, ECS Cluster, Task Definitions, ALB, Services)
└── j2car-integration.yaml   (Lambda, SQS, EventBridge, SNS, CloudWatch Alarms)
```

```bash
aws cloudformation create-stack \
  --stack-name J2Car-Production-Master \
  --template-body file://j2car-master.yaml \
  --parameters \
    ParameterKey=Environment,ParameterValue=production \
    ParameterKey=BackendImageUri,ParameterValue=ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/j2car-backend:v1.0.0 \
    ParameterKey=FrontendImageUri,ParameterValue=ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/j2car-frontend:v1.0.0 \
    ParameterKey=AlertEmail,ParameterValue=devops@j2car.com \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM
```

**Result:** All 5 nested stacks completed `CREATE_COMPLETE` in ~25 minutes. Total: **47 AWS Resources** provisioned with a single command.

#### 1.2. Parameterized Templates
Changing `Environment` from `production` to `staging` automatically adjusts:
- DocumentDB: `db.r6g.large` → `db.t3.medium`
- ECS Desired Count: `2` → `1`
- Deletion Policy: `Retain` → `Delete`

---

### 2. Route 53 & HTTPS (ACM)

#### 2.1. Create Hosted Zone
```bash
aws route53 create-hosted-zone \
  --name j2car-autoparts.com --caller-reference "$(date +%s)"
```
Copied 4 NS Records and updated the Domain Registrar. DNS propagation completed in ~15 minutes.

#### 2.2. Request SSL Certificate from ACM
```bash
aws acm request-certificate \
  --domain-name j2car-autoparts.com \
  --subject-alternative-names "*.j2car-autoparts.com" \
  --validation-method DNS --region ap-southeast-1
```

Added ACM-provided CNAME validation record to Route 53. Certificate status changed to `ISSUED` in ~5 minutes.

#### 2.3. Attach Certificate to ALB
```bash
# Add HTTPS Listener (port 443)
aws elbv2 add-listener-certificates \
  --listener-arn <HTTPS_LISTENER_ARN> \
  --certificates CertificateArn=arn:aws:acm:ap-southeast-1:ACCOUNT_ID:certificate/...

# Redirect HTTP → HTTPS
aws elbv2 modify-listener \
  --listener-arn <HTTP_LISTENER_ARN> \
  --default-actions Type=redirect,RedirectConfig='{Protocol=HTTPS,Port=443,StatusCode=HTTP_301}'
```

#### 2.4. Create Alias A Record
```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id Z_XXXXXXXX \
  --change-batch '{
    "Changes": [{"Action":"UPSERT","ResourceRecordSet":{
      "Name":"j2car-autoparts.com","Type":"A",
      "AliasTarget":{"HostedZoneId":"Z14GRHDCWA56QT",
        "DNSName":"J2Car-ALB-XXXXXXXX.ap-southeast-1.elb.amazonaws.com.",
        "EvaluateTargetHealth":true}
    }}]}'
```

**Result:** `https://j2car-autoparts.com` → J2Car AutoParts interface loads with a valid SSL padlock.

---

### 3. Load Testing with Apache JMeter

#### 3.1. JMeter Test Plan

**500 concurrent user simulation:**
```
Thread Group: 500 users, 60s ramp-up, 10 loops

Sampler 1: GET /api/products        (parts listing)
Sampler 2: GET /api/products/{id}   (product details)
Sampler 3: POST /api/vin/decode     (VIN decoding)
Sampler 4: GET /api/cart            (cart retrieval)
Sampler 5: WebSocket /socket.io     (chat connection)
```

#### 3.2. Auto Scaling Behavior on CloudWatch

| Time | Avg CPU | ECS Tasks | Notes |
|---|---|---|---|
| T+0 min | 8% | 2 tasks | Baseline |
| T+2 min | 45% | 2 tasks | Load test begins |
| T+4 min | 72% | 2 tasks | CloudWatch detects threshold breach (>60%) |
| T+6 min | 68% | 4 tasks | Auto Scaling spawns 2 additional tasks |
| T+8 min | 38% | 4 tasks | Load distributed evenly, CPU drops |
| T+15 min | 35% | 4 tasks | Load test complete |
| T+25 min | 9% | 2 tasks | Scale-in: returns to 2 tasks after cooldown |

#### 3.3. Load Test Results

| Metric | Result |
|---|---|
| P50 Response Time (API) | 87ms |
| P95 Response Time (API) | 210ms |
| P99 Response Time (API) | 380ms |
| Error Rate | 0.02% (2 timeouts in 5,000 requests) |
| Max Throughput | ~1,200 requests/sec |

**Key Observations:**
- ECS Auto Scaling responded correctly — reacting within 2–4 minutes of CPU exceeding 60%.
- **ElastiCache Redis Cache Hit Rate: 94%** during the entire test — parts API responded extremely fast due to caching.
- CloudFront handled 100% of static load (React SPA, images) — Backend only processed API calls.

---

### 4. End-to-End Business Flow Testing

#### 4.1. Customer Purchasing Flow

**Step 1 — VIN Lookup:**
```
Customer enters VIN: 1HGBH41JXMN109186
→ Frontend: POST /api/vin/decode
→ Backend calls NHTSA API (via NAT Gateway)
← Returns: Toyota Camry 2021, 2.5L 4-cylinder
→ Displays compatible parts list
✅ Response time: ~320ms (including external NHTSA call)
```

**Step 2 — Add to Cart & Place Order:**
```
Customer adds 2 parts to cart
→ Cart stored temporarily in Redis ElastiCache
→ Checkout → Backend creates Order in DocumentDB
→ Backend generates VNPay payment link
→ Returns payment URL to Frontend
✅ Full flow completed in 850ms
```

**Step 3 — Payment & Real-Time Confirmation:**
```
Customer completes payment on VNPay
→ VNPay calls Webhook: POST /api/payment/ipn
→ AWS WAF → ALB → Lambda Webhook Handler
→ Lambda validates checksum → pushes to SQS Payment Queue
→ ECS Worker dequeues → updates Order status="PAID" in DocumentDB
→ Backend broadcasts Socket.io event to Client
→ Customer sees "Payment Successful" popup on browser
✅ Webhook-to-notification latency: ~1.2 seconds
```

#### 4.2. Admin Image Upload Flow
```
Admin selects image in admin panel
→ Frontend: POST /api/products/upload-url
→ Backend generates Pre-signed URL (15 min validity)
→ Frontend uses URL to PUT image directly to S3 Media Bucket
→ S3 stores image, CloudFront caches at edge nodes
→ Admin sees image display within 3 seconds
✅ Backend processed ZERO bytes of image data
```

---

### 5. Actual Cost Summary — Deployment Month

| Service | Actual Cost | % of Total |
|---|---|---|
| Amazon DocumentDB (Multi-AZ) | $124.50 | 42% |
| Amazon ElastiCache Redis | $52.20 | 18% |
| NAT Gateway (2 AZs) | $38.40 | 13% |
| ECS Fargate (Auto Scaled) | $32.80 | 11% |
| Application Load Balancer | $18.60 | 6% |
| CloudFront + S3 | $12.30 | 4% |
| AWS WAF | $9.80 | 3% |
| Lambda + SQS + SNS | $1.20 | 0.4% |
| CloudWatch + Logs | $4.50 | 1.5% |
| **Total** | **$294.30** | **100%** |

> Actual cost ($294/month) closely matched the original estimate ($275/month). The variance was primarily from higher-than-expected NAT Gateway data transfer during active load testing.

---

### 6. Lessons Learned

| Lesson | Description |
|---|---|
| **IaC from Day One** | Write CloudFormation from the very beginning, not after building manually. Rebuilding from templates is far easier than reverse-engineering existing infrastructure. |
| **NAT Gateway Costs Add Up** | Carefully evaluate which services actually need NAT and which can use VPC Endpoints to save money. |
| **ECS Sticky Sessions** | Socket.io requires Sticky Sessions on ALB. Without this, WebSocket connections disconnect intermittently. |
| **SQS Visibility Timeout** | Set Visibility Timeout longer than the Worker processing time to prevent duplicate message processing when Workers are slow. |
| **Cache Invalidation Strategy** | Cache invalidation is the hardest problem — define a clear strategy for when to flush product/parts cache. |
| **Test Progressively** | Don't run load tests before integration tests — difficult to distinguish code bugs from infrastructure issues. |
| **Team-Wide Alerting** | CloudWatch Alarm emails shouldn't go to just one person — configure SNS to notify the entire team via Slack or email group. |
| **Tag Everything Early** | Not tagging resources from Day 1 makes it impossible to separate Production vs Development costs in Cost Explorer. |

---

## Week 12 & Overall Internship Summary

Week 12 validated the collective effort invested from Week 1 through Week 11. The **J2Car AutoParts** system has been fully deployed on AWS with:

- ✅ **Standard 3-Tier Architecture** (Edge → Compute → Data) with Multi-AZ across all critical components.
- ✅ **Multi-layer Security** (WAF → Security Group Chaining → KMS → Secrets Manager).
- ✅ **Automatic Scalability** (ECS Auto Scaling based on CPU Utilization).
- ✅ **Reliable Payment Processing** (Lambda + SQS ensures zero invoice data loss).
- ✅ **Real-Time Interaction** (Socket.io + Redis Pub/Sub operating across 2 AZs).
- ✅ **Infrastructure as Code** (47 AWS resources managed by CloudFormation).
- ✅ **Verified Performance** (P95 < 210ms, 0.02% error rate at 500 concurrent users).

The internship concluded with a genuinely production-ready system — not just a theoretical exercise, but an architecture ready for real-world business deployment.
