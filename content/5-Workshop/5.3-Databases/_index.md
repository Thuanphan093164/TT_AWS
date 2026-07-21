---
title: "5.3. Provision DocumentDB & Redis"
date: 2024-01-01
weight: 3
chapter: false
pre: " <b> 5.3. </b> "
---

# Step 2: Provision Data & Caching Tier (DocumentDB & Redis)

The data tier is the heart of the J2Car application. To ensure maximum reliability and latency optimization, we replace external database hosts (like MongoDB Atlas) with a fully managed **Amazon DocumentDB (MongoDB Compatible)** cluster deployed in our private network, alongside a high-performance **Amazon ElastiCache Redis** cluster. Both run in isolated subnets across multiple Availability Zones.

---

### Step-by-Step Practical Lab

#### 1. Provision Amazon DocumentDB Cluster
1. Navigate to the **Amazon DocumentDB** console page.
2. Under **Clusters**, click **Create**.
3. Configure parameters:
   * **Cluster Identifier:** `j2car-docdb-cluster`
   * **Engine Version:** Select the latest compatible MongoDB version (e.g., MongoDB 5.0).
   * **Instance Class:** `db.t3.medium` (appropriate for evaluation and testing).
   * **Number of Instances:** `3` (A Multi-AZ cluster containing **1 Primary Node** for read/write queries and **2 Replica Nodes** for read requests, providing high-availability failover).
4. **Authentication:** Set your Master Username (e.g., `dbadmin`) and password, conforming to the **SCRAM-SHA-1** authentication scheme.
5. **Network Settings:**
   * **VPC:** Target `J2Car-Production-VPC`.
   * **Subnet Group:** Select the group mapping to Private Subnets Data (`10.0.5.0/24` and `10.0.6.0/24`).
6. Enable **SSL** connection (requires downloading `global-bundle.pem` into code).
7. Click **Create Cluster** and wait until status becomes **Available**.

![Amazon DocumentDB cluster running in Available state](/images/5-Workshop/5.3-Databases/5-docdb.png)

#### 2. Provision Amazon ElastiCache Redis Cluster
1. Open the **ElastiCache** console and choose **Redis OSS clusters**.
2. Click **Create Redis OSS cluster**.
3. Configure the cluster:
   * **Name:** `j2car-redis-cache`
   * **Multi-AZ:** Set to **Enabled** for automated failover during physical zone outages.
   * **Node Type:** `cache.t3.micro` (cost-optimized).
   * **Number of Replicas:** `1` (Sets up 1 Primary and 1 Replica syncing in real-time).
   * **Subnet Group:** Assign the Private Data subnets (`10.0.5.0/24`, `10.0.6.0/24`).
4. Click **Create** to initialize the Redis cluster.

![Amazon ElastiCache Redis cluster running in Available state](/images/5-Workshop/5.3-Databases/6-redis.png)

#### 3. Establish strict Network Security Groups
* To deny access from outside and only allow internal backend queries:
  1. Create a Security Group named `J2Car-Database-SG` and assign it to both DocumentDB and Redis clusters.
  2. Configure **Inbound Rules**:
     * **Rule 1 (DocumentDB):** Port `27017` -> Source: Select the ECS Backend Security Group (`J2Car-Backend-SG`).
     * **Rule 2 (Redis):** Port `6379` -> Source: Select the ECS Backend Security Group (`J2Car-Backend-SG`).

---

### Real-Time Pub/Sub with Redis Broker
Aside from standard key-value caching, the Redis cluster acts as a messaging broker integrated with `socket.io-redis`. When payment webhooks arrive, backend nodes sync connection states via the Redis broker, broadcasting **Realtime Push Notifications** to client browsers instantly.

---

### Verification
* Confirm both DocumentDB and Redis clusters transition to an **Available** state.
* Copy the connection endpoints (including the SSL Connection String and Redis Host URL) to configure environment variables in later steps.

