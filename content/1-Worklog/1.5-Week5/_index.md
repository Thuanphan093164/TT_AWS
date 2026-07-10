---
title: "Week 5 Worklog"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 1.5. </b> "
---
 

### Week 5 Objectives:

- Understand the working mechanism of EC2 Auto Scaling: Launch Template, Scaling Policies, and Cooldown Period.
- Master the role of Application Load Balancer in traffic distribution and high availability.
- Distinguish between four Auto Scaling strategies: Manual, Scheduled, Dynamic, and Predictive.
- Understand the importance of AWS cost management and how AWS Budgets helps control spending.
- Practice deploying the FCJ Management application using Amazon EC2 Auto Scaling and Elastic Load Balancing.

### Tasks to be carried out this week:

| Day | Task | Start Date | Completion Date | Reference Material |
| --- | --- | --- | --- | --- |
| 2 | Study EC2 Auto Scaling theory: Launch Template, Scaling Policies, Cooldown Period, and scaling strategies. | 05/18/2026 | 05/18/2026 | https://cloudjourney.awsstudygroup.com/ |
| 3 | Study Application Load Balancer, Target Groups, Health Checks, and AWS Budgets for cost management. | 05/19/2026 | 05/19/2026 | https://docs.aws.amazon.com/ |
| 4 | Practice network setup: create VPC, public/private subnets across multiple AZs, and security groups. | 05/20/2026 | 05/20/2026 | https://cloudjourney.awsstudygroup.com/ |
| 5 | Launch EC2 web server, launch RDS database, and prepare the database data. | 05/21/2026 | 05/22/2026 | https://cloudjourney.awsstudygroup.com/ |
| 6 | Deploy the web application, configure monitoring metrics, and prepare for predictive scaling. | 05/23/2026 | 05/23/2026 | https://cloudjourney.awsstudygroup.com/ |

### Week 5 Achievements:

#### Theory

- Understood the working mechanism of EC2 Auto Scaling, including Launch Templates, scaling policies, and cooldown periods.
- Mastered the role of Application Load Balancer in traffic distribution and high availability.
- Distinguished the four Auto Scaling strategies:
  - Manual: scale instances manually.
  - Scheduled: scale based on a timetable.
  - Dynamic: scale based on real-time metrics.
  - Predictive: anticipate demand using historical patterns.
- Understood the importance of AWS cost management and how AWS Budgets helps track and control spending.

#### Practice

##### 1. Network Infrastructure Setup (VPC)

Lab overview: Deploying the FCJ Management application using Amazon EC2 Auto Scaling combined with Elastic Load Balancing to ensure high availability and flexible scalability.

AWS services used:

- Amazon VPC: creates an isolated virtual network environment.
- Amazon EC2: provides virtual servers to run the FCJ Management application.
- Amazon RDS: provides a managed relational database service.
- Amazon EC2 Auto Scaling: automatically adjusts the number of EC2 instances based on demand.
- Elastic Load Balancing: distributes incoming traffic across multiple EC2 instances.
- Amazon CloudWatch: monitors resources and applications.
- AWS Systems Manager: manages configuration and automates tasks on EC2 instances.

Create VPC (AutoScaling-Lab):

In the Create VPC console, configure the following:

- Select VPC and more.
- Name: AutoScaling-Lab.
- IPv4 CIDR block: 10.0.0.0/16.
- Enable Auto-assign public IPv4 address for public subnets.

![Configure Auto-assign Public IP for Public Subnets](https://tranvantrung27.github.io/aws-report/images/worklog/week-5/1.png)

##### 2. Create Security Group for FCJ Management Application

Configure the security group:

- Security group name: FCJ-Management-SG.
- Description: Security Group for FCJ Management.
- VPC: select the VPC just created, AutoScaling-Lab.

![Successfully created FCJ-Management-SG Security Group](https://tranvantrung27.github.io/aws-report/images/worklog/week-5/2.png)

##### 3. Create Security Group for Database Instance

Configure the security group:

- Security group name: FCJ-Management-DB-SG.
- Description: Security Group for DB instance.
- VPC: select the VPC just created.
- Inbound rules:
  - Protocol: MYSQL/Aurora.
  - Port: 3306.
  - Source: FCJ-Management-SG.

![Successfully created FCJ-Management-DB-SG Security Group](https://tranvantrung27.github.io/aws-report/images/worklog/week-5/3.png)

##### Infrastructure Setup Summary

Completed the basic network infrastructure setup including:

- VPC and subnets: isolated virtual network with subnets distributed across multiple Availability Zones.
- Internet Gateway: enables connectivity from the VPC to the internet.
- Route Table: configured routing for subnets.
- Security Groups: established security rules for EC2 instances and RDS database.

##### 4. Launch EC2 Instance

Create EC2 instance:

1. Open the EC2 console.
2. Set the instance name to FCJ-Management.
3. Choose Amazon Linux 2023 AMI.
4. Select instance type t2.micro.
5. Create a new key pair named fcj-key.
6. Choose the created VPC AutoScaling-Lab and a public subnet.
7. Select the security group FCJ-Management-SG.
8. Launch the instance.

![Instance launched successfully](https://tranvantrung27.github.io/aws-report/images/worklog/week-5/4.png)

Connect to EC2 via SSH:

For Windows, use PuTTYgen to convert the .pem file to .ppk and connect with PuTTY using the EC2 public IP and ec2-user.

![Successfully connected to EC2 Instance](https://tranvantrung27.github.io/aws-report/images/worklog/week-5/6.png)

##### 5. Launch Database Instance with Amazon RDS

Create DB subnet group:

1. Open the RDS console.
2. Create a DB subnet group named FCJ-Management-Subnet-Group.
3. Select the VPC AutoScaling-Lab and private subnets in multiple AZs.

![Successfully created DB Subnet Group across 2 AZs](https://tranvantrung27.github.io/aws-report/images/worklog/week-5/7.png)

Create Amazon RDS database instance:

1. Choose Standard create.
2. Select MySQL as the engine.
3. Choose Production template and Multi-AZ DB instance.
4. Set DB instance identifier to fcj-management-db-instance.
5. Set master username to admin and create a strong password.
6. Select db.m5d.large, gp3 storage, and 20 GB allocated storage.
7. Use the VPC, subnet group, and FCJ-Management-DB-SG security group.
8. Create the initial database named awsfcjuer.

After creation, record the Endpoint and Port for application configuration.

##### 6. Create Launch Template

Create an AMI from the EC2 instance:

1. Select the FCJ-Management instance.
2. Choose Actions > Image and templates > Create image.
3. Name the AMI FCJ-Management-AMI.

![AMI created successfully](https://tranvantrung27.github.io/aws-report/images/worklog/week-5/8.png)

Create a Launch Template:

1. Open Launch Templates in the EC2 console.
2. Create a launch template named FCJ-Management-template.
3. Select the AMI FCJ-Management-AMI.
4. Choose instance type t2.micro.
5. Select the fcj-key key pair.
6. Choose the security group FCJ-Management-SG.
7. Create the launch template.

![Launch Template created successfully](https://tranvantrung27.github.io/aws-report/images/worklog/week-5/9.png)

##### 7. Create Target Group

Create a target group:

1. Go to Target Groups in the EC2 console.
2. Create a target group named FCJ-Management-TG.
3. Set the target type to Instances, protocol HTTP, port 5000, and VPC AutoScaling-Lab.
4. Register the FCJ-Management instance on port 5000.
5. Create the target group.

![Target Group Details](https://tranvantrung27.github.io/aws-report/images/worklog/week-5/10.png)

##### 8. Create Load Balancer

Create an Application Load Balancer:

1. Go to Load Balancers and click Create Load Balancer.
2. Choose Application Load Balancer.
3. Set the name to FCJ-Management-LB.
4. Choose Internet-facing and IPv4.
5. Select public subnets in multiple Availability Zones.
6. Attach FCJ-Management-SG.
7. Set the default action to forward to FCJ-Management-TG.
8. Create the load balancer.

![Load Balancer created successfully](https://tranvantrung27.github.io/aws-report/images/worklog/week-5/11.png)

##### 9. Verify Results

To check the deployment, use the load balancer DNS name in a browser.

- Confirm the FCJ Management web page is reachable.
- Perform a basic update operation and verify that the confirmation message appears.
- Check that the updated data is displayed on the homepage.
- Review CloudWatch metrics such as RequestCount, TargetResponseTime, and HTTPCode.
- Confirm that terminating an instance causes the Auto Scaling Group to launch a replacement automatically.

![Confirmation Message](https://tranvantrung27.github.io/aws-report/images/worklog/week-5/12.png)

![Result after update](https://tranvantrung27.github.io/aws-report/images/worklog/week-5/13.png)

##### 10. Create Auto Scaling Group

Create an Auto Scaling group:

1. Open Auto Scaling Groups and choose Create Auto Scaling group.
2. Name the group FCJ-Management-ASG.
3. Select the launch template FCJ-Management-template.
4. Choose the AutoScaling-Lab VPC and the three public subnets.
5. Attach the group to the existing target group FCJ-Management-TG.
6. Enable ELB health checks and CloudWatch metrics collection.
7. Set desired capacity to 1, minimum to 1, and maximum to 3.
8. Create the Auto Scaling group.

![Email Subscription](https://tranvantrung27.github.io/aws-report/images/worklog/week-5/14.png)

![Confirm Subscription](https://tranvantrung27.github.io/aws-report/images/worklog/week-5/15.png)

The Auto Scaling group will automatically create a new instance and send a notification email.

![Instance Creation Email](https://tranvantrung27.github.io/aws-report/images/worklog/week-5/16.png)

##### 11. Configure AWS Budget

AWS Budgets helps track and control AWS spending.

Create a budget from template:

1. Open Billing and Cost Management.
2. Select Budgets.
3. Click Create budget.
4. Choose Use a template (simplified) and then Monthly cost budget.
5. Enter a budget name, monthly amount, and alert thresholds.
6. Create the budget.

![Budget created and verified successfully](https://tranvantrung27.github.io/aws-report/images/worklog/week-5/17.png)

##### 12. Create Custom Cost Budget

Create a custom cost budget:

1. Select Customize in the budget setup.
2. Choose Cost budget.
3. Enter the budget name Monthly and set the monthly amount.
4. Scope the budget to All AWS services and aggregate costs by Unblended costs.
5. Configure alert thresholds and create the budget.

![Cost Budget created successfully](https://tranvantrung27.github.io/aws-report/images/worklog/week-5/18.png)

##### 13. Create Usage Budget

Create a usage budget:

1. Select Usage budget.
2. Choose Usage type groups.
3. Select EC2: ELB - Running Hours.
4. Set the budget amount and alert thresholds.
5. Create the budget.

![View Budget List](https://tranvantrung27.github.io/aws-report/images/worklog/week-5/19.png)

##### 14. Create RI Budget

Create a reservation budget:

1. Select Reservation budget.
2. Set the budget name and coverage threshold.
3. Configure the scope and alert email.
4. Create the budget.

![RI Budget created successfully](https://tranvantrung27.github.io/aws-report/images/worklog/week-5/20.png)

![RI Budget Details](https://tranvantrung27.github.io/aws-report/images/worklog/week-5/21.png)

### Summary

Week 5 combined research and hands-on practice to deploy a resilient and scalable application on AWS. The lab reinforced Auto Scaling concepts, load balancing, secure networking, database isolation, and budget monitoring, while helping build practical experience in designing a highly available architecture.

