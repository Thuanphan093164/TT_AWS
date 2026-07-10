---
title: "Week 4 Worklog"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 1.4. </b> "
---
 

### Week 4 Objectives

- Learn Amazon RDS fundamentals and its value compared with EC2-hosted databases, DynamoDB, and Redshift.
- Practice provisioning a secure network for RDS using VPC, Security Groups, and DB Subnet Groups.
- Initialize and configure an RDS database instance.
- Connect a Node.js application running on EC2 to RDS via the database endpoint.
- Understand backup and restore, Multi-AZ, and read replica concepts.

### Tasks to be implemented this week

| Day | Task | Start Date | End Date | Resource |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | --------- | ------------------------------------------------------------------------------ |
| 2 | Review Amazon RDS and compare it with EC2-hosted DB, DynamoDB, Redshift | 11/05/2026 | 11/05/2026 | Amazon RDS Documentation |
| 3 | Create the RDS network: VPC, EC2/RDS Security Groups, DB Subnet Group | 12/05/2026 | 12/05/2026 | VPC for RDS guide |
| 4 | Initialize an RDS database instance and configure security and parameters | 13/05/2026 | 13/05/2026 | Creating an RDS DB Instance |
| 5 | Deploy application on EC2 and connect it to RDS; verify endpoint access | 14/05/2026 | 14/05/2026 | Connecting to RDS guide |
| 6 | Practice RDS backup and restore with manual and automated snapshots | 15/05/2026 | 15/05/2026 | RDS Backup and Restore |
| 7 | Learn Multi-AZ and Read Replica options; clean up resources to avoid costs | 16/05/2026 | 17/05/2026 | High Availability (Multi-AZ) |

### Week 4 Results

#### Theoretical

- Mastered Amazon RDS concepts, supported engines, and managed service advantages.
- Understood Multi-AZ replication and read replica use cases.
- Learned the differences between RDS, DynamoDB, Redshift, and S3 for different workloads.
- Understood RDS security with Security Groups and encryption, as well as backup and snapshot concepts.

#### Practical

- Set up a secure database network with a DB Subnet Group and dedicated Security Groups.
- Created an Amazon RDS instance (MySQL/MariaDB) with restricted access.
- Connected a Node.js application on EC2 to the RDS endpoint successfully.
- Performed manual snapshot backup and restore operations.
- Cleaned up unused resources after the lab to minimize costs.

---

### Detailed Implementation - Week 4

#### 1. Lab Overview

In this lab, Amazon RDS is used to deploy a managed relational database. The workflow includes setting up a private database network, creating an RDS MySQL-compatible instance, connecting an EC2-hosted Node.js app, and exercising backup/restore features.

The RDS instance is designed to remain in a private subnet, with access limited by Security Groups so that only the EC2 application layer can connect.

#### 2. Preparation Steps

##### 2.1 Create VPC

Create a dedicated VPC for the application and database stack. The RDS subnet group should span at least two Availability Zones for resilience.

##### 2.2 Create EC2 Security Group

Configure an EC2 Security Group that allows SSH on port 22 and application traffic on port 5000. This group is used by the EC2 instance running the Node.js application.

##### 2.3 Create RDS Security Group

Create an RDS Security Group that only permits inbound traffic from the EC2 Security Group on port 3306, the MySQL/MariaDB database port.

##### 2.4 Create DB Subnet Group

Create a DB Subnet Group containing private subnets in multiple AZs. Assign this subnet group to the RDS instance so the database remains isolated from direct public access.

#### 3. Create EC2 instance

Provision an EC2 instance to host the application.

Steps:

1. Launch an EC2 instance in the prepared VPC.
2. Choose Amazon Linux 2023 and a small instance type such as `t2.micro` or `t3.micro`.
3. Create or select a key pair for SSH access.
4. Attach the EC2 Security Group and enable a public IP on a public subnet.
5. Connect via SSH using the public IP and the `.pem` key.

#### 4. Create RDS database instance

Use the RDS console to launch a MySQL or MariaDB instance with standard settings.

Steps:

1. Select Standard create.
2. Choose the database engine and Free Tier template.
3. Set an identifier such as `database-1` and a secure admin username/password.
4. Choose the prepared VPC, private DB subnets, and the RDS Security Group.
5. Disable public access and create the database.

#### 5. Application Deployment and RDS Connection

##### Install Git and Node.js on EC2

```bash
sudo dnf update -y
sudo dnf install git -y
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.nvm/nvm.sh
nvm install --lts
```

##### Deploy Application

1. Clone the application repository.
2. Install dependencies:

```bash
npm install express dotenv express-handlebars body-parser mysql
```

3. Create a `.env` file with the database configuration:

```bash
DB_HOST="RDS_ENDPOINT"
DB_NAME="first_cloud_users"
DB_USER="admin"
DB_PASS="YourPassword"
```

##### Initialize RDS Data

Connect from EC2 to RDS and run SQL to create the application schema.

```sql
CREATE DATABASE IF NOT EXISTS first_cloud_users;
USE first_cloud_users;
CREATE TABLE `user` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `first_name` VARCHAR(45) NOT NULL,
  `last_name` VARCHAR(45) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `phone` VARCHAR(15) NOT NULL,
  `comments` TEXT NOT NULL,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active'
) ENGINE=InnoDB;
```

##### Start Application

```bash
npm start
```

Access the app at `http://<EC2-Public-IP>:5000`.

#### 6. Backup and Restore

Use RDS snapshot features to protect data.

1. Monitor database performance in the RDS console.
2. Take a manual snapshot.
3. Restore the snapshot to a new instance.

#### 7. Resource Cleanup

After the lab, delete RDS instances, snapshots, EC2 instances, and any networking resources to avoid costs.

1. Delete the RDS database.
2. Delete snapshots.
3. Terminate EC2 instances.
4. Release any Elastic IPs.
5. Delete VPC resources and the VPC itself.

