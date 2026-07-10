---
title: "Week 3 Worklog"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 1.3. </b> "
---
 

### Week 3 Objectives

- Master Amazon EC2 fundamentals (instance types, AMIs, EBS, key pairs, security groups).
- Practice launching, configuring, and managing EC2 on Linux and Windows.
- Deploy a Node.js application on EC2 and exercise connection methods (SSH, RDP, Session Manager).

### Schedule (summary)

| Day | Task | Start | End |
| --- | ----------------------------------------------------------------------------------------------------------------------------------- | ----- | ----- |
| 2 | EC2 overview: instance types, AMI, key pair, snapshots | 05/04/2026 | 05/04/2026 |
| 3 | Prepare EC2 environment: create VPCs and security groups for Linux/Windows | 05/05/2026 | 05/05/2026 |
| 4 | Initialize Windows EC2 and connect via RDP | 05/06/2026 | 05/06/2026 |
| 5 | Initialize Linux EC2, connect via SSH, manage EBS snapshots | 05/07/2026 | 05/07/2026 |
| 6 | Advanced: create custom AMI, launch from AMI, recover from lost keypair | 05/08/2026 | 05/08/2026 |
| 7 | Deploy Node.js on EC2 (install LAMP/Node, deploy app), review IAM limits | 05/09/2026 | 05/10/2026 |

### Week 3 Achievements

- Understood EC2 core components and lifecycle (AMI, EBS, snapshots, key pairs).
- Launched and configured EC2 instances on both Linux and Windows platforms.
- Created and used snapshots and custom AMIs to reproduce environments.
- Deployed a Node.js application and verified its functionality on EC2.
- Practiced alternative access and recovery methods (SSM, AMI-based recovery) when keypairs are lost.

### Detailed practice (paraphrased, no external names/images)

1) Lab overview

- Two EC2 instances are prepared: one Amazon Linux, one Windows Server. Each runs in its own VPC and security groups to demonstrate isolation and access control.

2) Prepare networking and security (CLI examples)

2.1 Create VPC for Linux

```bash
VPC_LINUX=$(aws ec2 create-vpc --cidr-block 10.20.0.0/16 --query 'Vpc.VpcId' --output text)
aws ec2 create-tags --resources $VPC_LINUX --tags Key=Name,Value=training-linux-vpc
```

2.2 Create VPC for Windows

```bash
VPC_WIN=$(aws ec2 create-vpc --cidr-block 10.21.0.0/16 --query 'Vpc.VpcId' --output text)
aws ec2 create-tags --resources $VPC_WIN --tags Key=Name,Value=training-windows-vpc
```

2.3 Create Security Groups

```bash
LINUX_SG=$(aws ec2 create-security-group --group-name training-linux-sg --description "Linux SG" --vpc-id $VPC_LINUX --query 'GroupId' --output text)
aws ec2 authorize-security-group-ingress --group-id $LINUX_SG --protocol tcp --port 22 --cidr 0.0.0.0/0

WIN_SG=$(aws ec2 create-security-group --group-name training-windows-sg --description "Windows SG" --vpc-id $VPC_WIN --query 'GroupId' --output text)
aws ec2 authorize-security-group-ingress --group-id $WIN_SG --protocol tcp --port 3389 --cidr 0.0.0.0/0
```

3) Launch Windows EC2 and connect via RDP (summary)

- Launch a Windows Server AMI, create a new key pair, attach to the Windows security group, enable public IP on the subnet, then retrieve the administrator password via the console and connect with RDP.

4) Launch Linux EC2 and connect via SSH (summary)

- Launch an Amazon Linux 2023 AMI, create a key pair `kp-linux`, assign the Linux security group and public IP, then connect by: `ssh -i kp-linux.pem ec2-user@<Public-IP>`.

5) EBS snapshots and volume management

- Create snapshots for backup: `aws ec2 create-snapshot --volume-id $VOLUME_ID --description "backup-$(date +%F)"`.
- Use snapshots to create volumes or as a basis for AMIs.

6) Create and use Custom AMI

- For Windows, run Sysprep before creating an AMI. For Linux, use `aws ec2 create-image --instance-id $INSTANCE_ID --name "custom-linux-ami"`.
- Launch new instances from custom AMI, create new key pairs as needed.

7) Deploy Node.js application on Linux (summary)

- Update OS and install dependencies (git, nvm/node). Clone the app repo (use your own repository), install npm packages, configure `.env` for DB, and run the app with `npm start` or a process manager.

Example commands:

```bash
sudo dnf update -y
sudo dnf install -y git
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
. ~/.nvm/nvm.sh
nvm install --lts
git clone <your-repo-url>
cd repo && npm install
npm start
```

8) Recovery when keypair is lost

- Option 1: Use AWS Systems Manager Session Manager by attaching `AmazonSSMManagedInstanceCore` role to the instance.
- Option 2: Create an AMI and launch a new instance with a new key pair.

9) Verification checks

- `aws ec2 describe-instances --filters Name=instance-state-name,Values=running Name=vpc-id,Values=$VPC_LINUX,$VPC_WIN`
- Confirm instance status checks and connectivity (SSH/RDP/HTTP).

Notes: All resource names use the `training-` prefix or placeholders; no external personal names or images are included. Tell me if you want full CLI scripts for any specific step.

