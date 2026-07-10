---
title: "Step 4: Data Layer"
date: 2024-01-01
weight: 4
chapter: false
pre: " <b> 5.4. </b> "
---

## Step 4: Database & Cache Configuration (Data Layer)

To handle massive auto parts catalog inventory datasets and secure high-speed HTTP user sessions, I deployed **Amazon DocumentDB (MongoDB compatible)** and **Amazon ElastiCache Redis** inside secure Private Subnets.

---

### 1. Database Security Groups Configuration

I configured Security Groups Chaining, allowing database engine port connections only from the ECS application task security group:

```bash
VPC_ID=$(aws cloudformation describe-stacks \
  --stack-name J2Car-Workshop-Network --region ap-southeast-1 \
  --query "Stacks[0].Outputs[?OutputKey==`VpcId`].OutputValue" --output text)

# Create Database Security Groups
DOCDB_SG_ID=$(aws ec2 create-security-group --group-name J2Car-DocDB-SG --description "DocumentDB SG" --vpc-id $VPC_ID --region ap-southeast-1 --query "GroupId" --output text)
REDIS_SG_ID=$(aws ec2 create-security-group --group-name J2Car-Redis-SG --description "Redis SG" --vpc-id $VPC_ID --region ap-southeast-1 --query "GroupId" --output text)

# Authorize ports 27017 (DocumentDB) and 6379 (Redis) from ECS application security group
aws ec2 authorize-security-group-ingress --group-id $DOCDB_SG_ID --protocol tcp --port 27017 --source-group $ECS_SG_ID --region ap-southeast-1
aws ec2 authorize-security-group-ingress --group-id $REDIS_SG_ID --protocol tcp --port 6379 --source-group $ECS_SG_ID --region ap-southeast-1
```

---

### 2. Launch Multi-AZ Database Clusters

I mapped database subnets to the VPC Private Subnets and initialized the database clusters:

```bash
# Create Subnet Groups
aws docdb create-db-subnet-group --db-subnet-group-name j2car-docdb-subnet-group --db-subnet-group-description "DocDB Subnets" --subnet-ids $SUB1 $SUB2 --region ap-southeast-1
aws elasticache create-cache-subnet-group --cache-subnet-group-name j2car-redis-subnet-group --cache-subnet-group-description "Redis Subnets" --subnet-ids $SUB1 $SUB2 --region ap-southeast-1

# Deploy DocumentDB Cluster
aws docdb create-db-cluster --db-cluster-identifier j2car-docdb-cluster --engine docdb --master-username dbadmin --master-user-password "SecurePassWord123" --vpc-security-group-ids $DOCDB_SG_ID --db-subnet-group-name j2car-docdb-subnet-group --region ap-southeast-1
aws docdb create-db-instance --db-cluster-identifier j2car-docdb-cluster --db-instance-class db.t3.medium --db-instance-identifier j2car-docdb-instance-1 --engine docdb --region ap-southeast-1

# Deploy Redis Cluster
aws elasticache create-replication-group --replication-group-id j2car-redis-group --replication-group-description "Redis Cluster" --num-cache-clusters 2 --cache-node-type cache.t3.micro --engine redis --cache-subnet-group-name j2car-redis-subnet-group --security-group-ids $REDIS_SG_ID --multi-az-enabled --region ap-southeast-1
```

---

### 3. Verification Proofs inside AWS Console

#### 3.1. Amazon DocumentDB Cluster Status (`5-docdb.png`)
![DocumentDB Clusters](/images/5-Workshop/5-docdb.png)

#### 3.2. Amazon ElastiCache Redis Replication Group (`6-redis.png`)
![ElastiCache Redis](/images/5-Workshop/6-redis.png)
