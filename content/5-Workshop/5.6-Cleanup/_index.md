---
title: "Step 6: Resource Cleanup"
date: 2024-01-01
weight: 6
chapter: false
pre: " <b> 5.6. </b> "
---

## Step 6: Resource Cleanup (Clean Up)

After completing the tests and validating DNS forwarding and S3 Gateway/Interface VPC Endpoints for the J2Car AutoParts platform, cleaning up resources is important to avoid unexpected charges in the AWS account.

---

### Standard Cleanup Workflow

To clean up all components created for this lab, delete resources in the following order:

1. **Delete DNS Resources:**
   - Remove forwarding rules in the Route 53 Resolver Rules panel.
   - Delete Route 53 Private Hosted Zones and associated DNS Alias records.
2. **Delete VPC Endpoints:**
   - Terminate the Gateway Endpoint (`s3-gwe`).
   - Terminate the Interface Endpoint (`s3-interface-endpoint`).
3. **Delete CloudFormation Stacks:**
   - Delete the stack named `J2Car-Resolver-Endpoints` first.
   - Once completed, delete the core network stack `J2Car-Workshop-Network` (this automatically rolls back the VPC, NAT Gateways, Subnets, and Route Tables).
4. **Delete S3 Buckets:**
   - Empty and delete the temporary S3 Buckets.

---

> [!IMPORTANT]
> To keep the real-world system active for presentation and writing reports, all core compute, databases, S3 buckets, ECR registries, and WAF firewalls configured for **J2Car AutoParts** **remain untouched** and will not be deleted from your AWS account.
