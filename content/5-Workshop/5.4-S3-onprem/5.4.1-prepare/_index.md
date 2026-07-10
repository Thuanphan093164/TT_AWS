---
title: "Prepare the environment"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 5.4.1. </b> "
---

## Prepare Simulated Environment & Configure VPN Routing

To simulate local on-premises connectivity to the cloud, I deployed a CloudFormation stack configuring DNS Resolvers and updated the routing table of the on-premises subnet to forward traffic through the VPN gateway.

---

### 1. Provision Route 53 Resolvers via CloudFormation

I deployed a helper template `j2car-resolver.yaml` to spin up resolution endpoints:
- **Route 53 Private Hosted Zone:** Hosts alias pointers for the PrivateLink S3 endpoint.
- **Route 53 Inbound Resolver Endpoint:** Receives local DNS queries entering the cloud VPC.
- **Route 53 Outbound Resolver Endpoint:** Routes DNS queries sent from on-premises over the VPN.

```bash
aws cloudformation create-stack \
  --stack-name J2Car-Resolver-Endpoints \
  --template-body file://j2car-resolver.yaml \
  --region ap-southeast-1
```

---

### 2. Configure Private On-premises Route Table

To direct traffic targeted for the cloud VPC over the strongSwan VPN tunnel:

1. Open the **Amazon EC2 Console**.
2. Locate the instance named `infra-vpngw-test` (our simulated VPN gateway) and copy its **Instance ID**.
3. Open the **Amazon VPC Console** and select **Route Tables** from the left panel.
4. Select the table named **RT Private On-prem**, click the **Routes** tab, and select **Edit Routes**.
5. Click **Add route**:
   - **Destination:** Enter the Cloud VPC CIDR block (`10.0.0.0/16`).
   - **Target:** Select **Instance** and paste the ID of `infra-vpngw-test` copied earlier.
6. Click **Save changes** to apply.
