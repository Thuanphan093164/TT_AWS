---
title: "5.7. Secrets Manager & AWS WAF Setup"
date: 2024-01-01
weight: 7
chapter: false
pre: " <b> 5.7. </b> "
---

# Step 6: Configure AWS WAFv2 Firewall & AWS Secrets Manager

The security, integration, and governance layer shields public application entry points from external exploits and centrally manages credential stores.

---

### Step-by-Step Practical Lab

#### 2. Manage Secrets centrally using AWS Secrets Manager
To prevent hard-coding sensitive database connection strings and token validation keys in your repository:
1. Access the **AWS Secrets Manager** console and select **Store a new secret**.
2. Choose Secret Type: **Other type of secret**.
3. Specify the Key/Value pairs:
   * `MONGO_URI`: The secure connection string for DocumentDB (including username, password, and SSL flags).
   * `JWT_SECRET`: The encryption secret string used for signing JSON Web Tokens.
4. Name the secret: `j2car/production/secrets` and click **Store**.

![Encrypted Secret Keys in AWS Secrets Manager](/images/5-Workshop/5.7-SecretsManager-WAF/9-secrets.png)
5. **Reference Secrets inside ECS Task Definitions:**
   * Open the ECS Task Definition created in Step 5.
   * In the Container Environment Variables section, select `ValueFrom` (instead of `Value`) and paste the Secret's ARN appended with the key (e.g., `arn:aws:secretsmanager:...:j2car/production/secrets:MONGO_URI::`).
   * ECS automatically decrypts and mounts these variables into container processes during startup.

#### 3. Establish Firewall Protections using AWS WAFv2
To shield the Application Load Balancer (ALB) and CloudFront edges from automated exploits:
1. Open the **AWS WAF & Shield** console and click **Create Web ACL**.
2. Apply basic details:
   * **Name:** `j2car-web-acl`
   * **Resource Type:** Choose **Regional resources** to protect your ALB, or **CloudFront distributions** to protect the front end. Assign it to your `j2car-backend-alb`.
3. Add AWS-managed rules (**Managed Rule Groups**):
   * **AWSManagedRulesCommonRuleSet:** Defends against OWASP Top 10 web vulnerabilities.
   * **AWSManagedRulesSQLiRuleSet:** Detects and blocks SQL Injection payload injections.
4. Configure default action: **Allow** (permits valid traffic, filtering only flagged payloads).
5. Complete the Web ACL deployment.

![AWS WAFv2 Web ACL Associated to ALB](/images/5-Workshop/5.7-SecretsManager-WAF/10-waf.png)

#### 4. Monitor & Audit logs with Amazon CloudWatch Logs
* Log outputs (stdout/stderr) from ECS Fargate task containers and AWS Lambda functions are automatically streamed to **Amazon CloudWatch Logs**.
* This enables administrators to:
  * Troubleshoot code crashes and view system operations in real-time (**Troubleshooting**).
  * Validate webhook callback transactions from VNPay/MoMo to check processing logs (**Transaction Auditing**).

---

### Verification
* Visit the website using the S3 Static Website Hosting URL and confirm the React app loads correctly.
* Attempt a mock SQL injection query parameter (e.g., `/api/products?id=' OR 1=1 --`) at the ALB endpoint and verify that AWS WAFv2 blocks the request with a **403 Forbidden** status.
* Open the **CloudWatch Logs** console and review the stream outputs for running ECS tasks.
