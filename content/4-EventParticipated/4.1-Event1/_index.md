---
title: "Mini Meetup – First Cloud AI Journey"
date: 2026-06-06
weight: 1
chapter: false
pre: " <b> 4.1. </b> "
---

# Harvest Report: Mini Meetup – First Cloud AI Journey

### Event Information
* **Event Name:** Mini Meetup – First Cloud AI Journey
* **Date & Time:** June 06, 2026 (09:00 - 12:00)
* **Location:** 26th Floor, Bitexco Tower, 02 Hai Trieu Street, Saigon Ward, Ho Chi Minh City
* **Role:** Attendee

---

### Event Objectives
The **Mini Meetup – First Cloud AI Journey** was an in-depth technical knowledge-sharing event organized by the First Cloud AI Journey (FCAJ) community. The meetup created an interactive environment for cloud engineers, DevOps practitioners, security analysts, game developers, AI researchers, and IT infrastructure professionals passionate about **Cloud Computing**, **Containerization**, **AI-powered Cybersecurity**, **Real-time Serverless Systems**, **Agile Teamwork Management**, **Generative AI / GraphRAG**, and **IT Infrastructure Career Growth**.

The core objectives of the event included:
* **Delivering Practical Technical Insights:** Sharing real-world application containerization using Docker, intelligent network security combining AWS WAF with Machine Learning (NIDS), serverless WebSocket architectures for real-time applications, effective teamwork methodologies, advanced knowledge retrieval using GraphRAG (Amazon Bedrock & Amazon Neptune), and career growth roadmaps from IT Helpdesk to Senior Sysadmin & Cloud/DevOps.
* **Exploring Emerging Industry Trends:** Understanding automated threat detection workflows, proactive zero-day defense strategies, full-duplex WebSocket messaging, cross-border team collaboration, multi-hop reasoning AI applications, and practical cloud operational mindsets on Amazon Web Services (AWS).
* **Fostering Community Spirit:** Promoting the core philosophy of **Learn • Build • Share • Grow**, encouraging direct Q&A with industry experts, and guiding career development in Cloud & Software Engineering.

---

### Key Presentation Highlights

#### 1. Docker – A Containerization Technology
* **Speaker:** Mr. Bảo Huỳnh (Junior Cloud Native Developer - Endava Vietnam, Founder / Head Lab - ITea Lab)
* **Detailed Breakdown:**

##### A. Virtualization Technology Fundamentals
- **Overview of Virtualization:** Hardware virtualization abstracts physical machine resources to create isolated Virtual Machines (VMs) running on top of a Hypervisor layer.
- **Benefits of Virtualization:** Isolation (crash prevention), Encapsulation (snapshots/state saves), Portability across hardware.
- **Virtual Machine Problems & Drawbacks:** Each VM carries its own Guest OS, causing heavy CPU/RAM/Disk overhead, maintenance burdens, and slow boot times.

##### B. Containerization Technology
- **Concept of Containerization:** Packages an application along with all its required libraries, configuration files, and dependencies (Bins/Libs) into a single container package.
- **Containerization Architecture:**
  $$\text{App} + \text{Bins/Libs} \longrightarrow \text{Container Engine (Docker)} \longrightarrow \text{Host OS} \longrightarrow \text{Physical/Cloud Infrastructure}$$
- **Key Advantages:** High Portability, Environment Consistency, Resource Efficiency.

##### C. Comparison: Virtual Machines (VMs) vs Containers

| Feature | Virtual Machines (VMs) | Containers (Docker) |
| :--- | :--- | :--- |
| **Weight** | Heavyweight | Lightweight |
| **OS Architecture** | Runs separate Guest OS | Shares Host OS Kernel |
| **Startup Time** | Slow (Minutes to boot OS) | Fast (Milliseconds) |
| **Performance** | Limited via Hypervisor | Native performance |
| **Image Size** | Large (Multiple GBs) | Small (MBs to a few hundred MBs) |
| **RAM/CPU Usage** | High (Fixed allocation) | Low (Dynamic allocation on demand) |
| **Deployment Density** | 10 - 100 VMs / server | 100 - 1,000 Containers / server |
| **Security & Isolation** | Fully isolated at OS level | Process-level security |

##### D. Docker Overview & Live Demonstration
- **Docker Philosophy:** **"Build once, run anywhere"**.
- **Core Components:** **Docker Images** (Read-only templates), **Docker Containers** (Runtime instances), **Dockerfile** (`FROM`, `ARG`, `RUN`, `WORKDIR`, `COPY`/`ADD`, `CMD`/`ENTRYPOINT`).
- **Demonstration:** Speaker Bảo Huỳnh performed a live demo writing a Dockerfile, building a Docker Image, and launching an application container.

---

#### 2. WAF + ML for Cyber Attack Detection: Machine Learning-based Network Intrusion Detection System (NIDS) on AWS
* **Speaker:** Mr. Lê Hoàng Gia Đại (ID: 2280618445, Team AWS G3)
* **Detailed Breakdown:**

##### A. AWS WAF Overview & Limitations of Traditional Firewalls
- **AWS WAF (Web Application Firewall):** Protects web apps and APIs behind CloudFront, ALB, and API Gateway against HTTP/HTTPS exploits (SQLi, XSS, Bot traffic, Brute force). Limitations: Relies on static predefined rules, struggling against novel **Zero-day** and spoofing attacks.

##### B. Network Intrusion Detection System (NIDS) & Machine Learning Integration
- **Core Functions:** Traffic Monitoring $\rightarrow$ Behavioral Analysis $\rightarrow$ Detection & Alerting $\rightarrow$ Logging & Response $\rightarrow$ Integration (Firewalls/SIEMs).
- **Machine Learning Advantages:** Self-learning from real-world network traffic, analyzing massive datasets automatically, and continuously adapting to evolving attack vectors.

##### C. Model Building & Training with CSE-CIC-IDS2018 Dataset
- **Dataset Selection (CSE-CIC-IDS2018):** Jointly developed by CSE & CIC (Canada). Contains rich attack labels (`Benign`, `Bot`, `SQLi`, `Brute Force`, `DoS`, `DDoS`).
- **Data Preprocessing Workflow:** Explore $\rightarrow$ Merge CSVs $\rightarrow$ Clean data $\rightarrow$ Balance classes $\rightarrow$ Dimensionality reduction via **PCA** and **Elbow method**.
- **Outperforming LightGBM Model Results:** Accuracy **95.86%** (`0.9586`), Precision Macro `0.9653`, Recall Macro `0.9586`, F1-Score Macro `0.9571`, **AUC-ROC 99.82%** (`0.9982`).

##### D. Overall Security System Architecture on AWS
- **Secure Architecture:** AWS VPC, Amazon EC2, ALB, AWS WAF, **Amazon Kinesis Data Firehose**, **Amazon S3 Data Lake**, **AWS Lambda**, **Amazon SNS / SES** (Real-time alert dispatch), Security Hub, GuardDuty, Inspector, Config, and AWS SSM.
- **Development Environment:** VS Code, Jupyter Notebook, Python (`scikit-learn`, `pandas`, `NumPy`), GitHub, and AWS Cloud infrastructure.

---

#### 3. Multiplayer in the Cloud: Connecting Godot Clients with AWS WebSockets
* **Speaker:** Mr. Nguyễn Quốc Bảo (Nguyen Quoc Bao)
* **Detailed Breakdown:**

##### A. Multiplayer Networking Concepts & Architecture Selection
- **Protocol Comparison:** UDP/ENet (Lowest latency for FPS/Racing) vs **WebSocket** (Full-duplex, reliable delivery for Turn-based/Lobbies/Chat) vs HTTP Polling (Stateless for Login/Leaderboards).

##### B. Serverless WebSocket Architecture on AWS
- **Message Flow:** Godot Client (`WebSocketPeer`) $\longleftrightarrow$ Amazon API Gateway WebSocket (`$request.body.action`) $\longleftrightarrow$ AWS Lambda Function $\longleftrightarrow$ Amazon DynamoDB (`WebSocketDemoTable`).
- **DynamoDB Schema:** `connectionId` (PK), `status` (`waiting`/`matched`), `opponentId`, `choice`, `createdAt`.

##### C. AWS Lambda Event Logic & Godot Client (GDScript) Integration
- **Lambda Logic:** Handlers for `CONNECT`, `DISCONNECT`, and `MESSAGE` (`finding_match` pairing & `choice` move processing).
- **Godot Client (GDScript):** Connection init via `WebSocketPeer.new()`, Game Loop (`_process` / `poll()`), JSON transmission via `send_message()`, packet reading loop (`get_available_packet_count()` / `JSON.parse_string()`).
- **Demonstration:** Live demo showing real-time two-player Rock Paper Scissors gameplay via serverless WebSockets.

##### D. Challenges, Lessons Learned & AWS GameLift Roadmap
- **Technical Challenges:** Stale connections (`GoneException`), DynamoDB `ScanCommand` cost overhead, Lambda statelessness.
- **Roadmap:** Transitioning to **AWS GameLift** dedicated servers for continuous high-frequency game synchronization.

---

#### 4. The Art of Effective Teamwork
* **Speaker:** Mr. Trương Huy Phước (Truong Huy Phuoc)
* **Detailed Breakdown:**

##### A. Importance of Teamwork Efficiency
- **Core Proverb:** *"Many hands make light work"*.
- **Efficiency Comparison:** Contrast between Individual Work Efficiency vs Teamwork Efficiency in complex software projects.
- **Cross-Border Collaboration:** Insights into offshore software engineering collaboration between teams in Vietnam and Japan.

##### B. The 4 Golden Rules of Effective Teamwork
1. **Rule 1: Clear & Shared Goals:** Establish clear objectives and foster a shared vision across the team.
2. **Rule 2: Right Person, Right Place:** Assign tasks aligning with each team member's specific core strengths.
3. **Rule 3: Open Communication & Active Listening:** Maintain transparent communication and actively listen to peer feedback.
4. **Rule 4: Personal Accountability:** Uphold personal ownership over assigned deliverables to drive team success.

##### C. Digital Tools & Workflow Automation for Teamwork
- **Project Management:** **ClickUp** and **Trello** for task tracking and sprint planning.
- **Communication & Collaboration:** **Slack**, **Google Workspace**, and **Discord** (structured channels for specific tasks: `#chung`, `#project-structure`, `#system-spec`, `#task-nodejs`, `#task-design`, `#task-j2ee`, `#bao-cao-cuoi-ky`).
- **Workflow Automation Webhooks:**
  - **GitLab Webhook Integration:** Integrated GitLab Webhooks into Discord (`#gitlab-notification`) to automatically trigger alerts for new commits, Merge Requests (`Merge from final into main`), and CI/CD builds.
  - **ClickUp Bot Integration:** Integrated ClickUp Bot into Discord (`#clickup`) to push real-time task status updates (e.g., `task status changed from testing to complete`).

---

#### 5. GRAPHRAG: Build GraphRAG applications using Amazon Bedrock and Amazon Neptune
* **Speaker:** Mr. Việt Phát (Viet Phat) *(AI major at Swinburne University of Technology)*
* **Detailed Breakdown:**

##### A. RAG Overview & Limitations of Traditional Vector RAG
- **RAG (Retrieval-Augmented Generation):** Augments Large Language Models (LLMs) with external knowledge bases at runtime to eliminate hallucinations and generate grounded answers. Phases: **Indexing** (Vector store chunking) and **Generating** (Vector search & prompt injection).
- **Limitations of Traditional Vector RAG:** Performs semantic similarity matching over isolated text chunks. Fails on complex queries requiring **Multi-hop reasoning** across multiple scattered documents (e.g., Jeff Bezos $\rightarrow$ Amazon $\rightarrow$ Whole Foods $\rightarrow$ Austin headquarters).

##### B. The GraphRAG Solution
- **Multi-hop Reasoning:** Traverses Knowledge Graphs to follow explicit entity-relationship paths across disparate documents.
- **Relationship Awareness:** Stores explicit relationships as graph edges in a Graph Database.
- **GraphRAG Workflow:** Build/Maintain (Entity/Fact extraction, Entity resolution, Contextual clustering $\rightarrow$ Vector Store & Graph DB) $\rightarrow$ Retrieve (Find entry points, extract relevant subgraphs $\rightarrow$ Inject into LLM Context Prompting).

##### C. AWS GraphRAG Deployment Approaches (Managed vs Open-Source)
- **Approach 1: Fully Managed Route:** Combines **Amazon Bedrock** (Model & Graph Knowledge Base) + **Amazon Neptune** (Graph Database). Ingests raw data from Amazon S3, auto-chunks and builds Knowledge Graphs. High Scalability, Performance, Security & Operational Ease.
- **Approach 2: Custom / Open-Source Route:** Utilizes `graphrag_toolkit`, **LlamaIndex**, and **Amazon Neptune Analytics** to construct custom Knowledge Graph pipelines with Cypher Query traversal. High Customisability and Open Integration.

---

#### 6. From IT Helpdesk to Senior Sysadmin
* **Speaker:** Mr. Trần Trung Vinh (Tran Trung Vinh) *(System Administrator at Central Retail Group)*
* **Detailed Breakdown:**

##### A. Journey from IT Helpdesk to Sysadmin
- **Skills Acquired from Helpdesk:** Troubleshooting under pressure, communication with end users, problem-solving mindset, deep understanding of IT system workflows.
- **Career Turning Point:** Self-learning Linux & Networking fundamentals (CCNA, Network+), building hands-on home lab environments (Shell scripting, RHCSA), exploring Virtualization and Cloud platforms (AWS/Azure).
- **Key Realization:** *"I didn't want to just support systems. I wanted to understand how they were built."*

##### B. Realities of a System Administrator Role (Life as a Sysadmin)
- **Scope Beyond Servers:** Server provisioning & maintenance, network infrastructure management, security patching & updates, capacity planning & system monitoring.
- **Practical Engineering Lessons:** Automate repetitive tasks to save operational time; document configurations and runbooks thoroughly; implement monitoring before incidents occur; build collaborative relationships with developer teams.
- **Core Principle:** *"Never test in production – protect availability, trust, and your team's time."*

##### C. Transitioning to Cloud / DevOps & Interviewing at Central Retail Group
- **4 Mindset Transition Stages:** On-Premise (physical servers, manual config) $\rightarrow$ Cloud Mindset (AWS, elastic scaling, pay-as-you-go, managed services) $\rightarrow$ Infrastructure as Code (Terraform, version control) $\rightarrow$ DevOps Culture (CI/CD, Docker, automation, Dev-Ops collaboration).
- **Modern DevOps Roadmap:** Linux & Networking $\rightarrow$ Git & Version Control $\rightarrow$ Cloud Fundamentals (AWS/Azure/GCP) $\rightarrow$ Docker & Containers $\rightarrow$ CI/CD $\rightarrow$ Terraform (IaC) $\rightarrow$ Kubernetes $\rightarrow$ Monitoring & Observability.
- **Central Retail Group Interview Journey:** Highlight real projects and achievements; research company technical landscapes; excel at architecture design and incident response scenarios. *Key Lesson: "Practical experience is your strongest advantage."*
- **Career Advice:** Avoid learning too many things at once; go deep on 1-2 core skills first; build real-world hands-on project portfolios over superficial certifications.
- **Inspiring Message:** *"Where you start doesn't matter - keep going. Every small step counts."*

---

### Key Takeaways & Lessons Learned

#### 1. Application Containerization & Cloud Infrastructure
* **Container-First Mindset:** Understanding why Docker has become the gold standard in modern software engineering due to environment consistency and resource optimization compared to traditional VMs.
* **Standardizing Deployment Pipelines:** Mastering Dockerfile instructions to build lightweight, secure, and production-ready container images for deployment on Amazon ECS Fargate.

#### 2. Cybersecurity & Automated Cloud Defense
* **Defense-in-Depth Strategy:** Rule-based WAF firewalls alone are insufficient; integrating Machine Learning NIDS empowers systems to proactively detect and neutralize zero-day cyber threats.
* **Automated Incident Response:** Leveraging serverless services (AWS Lambda, Kinesis, SNS) to construct real-time security monitoring, event correlation, and instant alert workflows.

#### 3. Real-Time Systems & Serverless WebSocket Architecture
* **Optimizing Full-Duplex Connectivity:** Mastering real-time messaging and matchmaking workflows using AWS API Gateway WebSocket, AWS Lambda, and DynamoDB at minimal operational cost.

#### 4. The Art of Teamwork & Workflow Automation
* **Applying the 4 Golden Rules:** Enhancing team performance through goal clarity, optimal task alignment, open communication, and personal accountability.
* **Leveraging Webhook Automations:** Automating progress notifications from GitLab and ClickUp to Discord ensures transparency and saves manual status reporting overhead.

#### 5. Advanced AI & Knowledge Graphs (GraphRAG)
* **Evolving Beyond Vector Search:** Understanding the transition from traditional Vector RAG to GraphRAG (Amazon Bedrock + Amazon Neptune) to solve complex multi-hop reasoning tasks across interconnected domain data.

#### 6. IT Infrastructure & DevOps Career Growth
* **Building Strong Foundations:** Progressing from Helpdesk to Sysadmin by mastering Linux, Networking, task automation, and adhering to the *"Never test in production"* principle.
* **Adopting the DevOps Journey:** Embracing Cloud Mindsets, Infrastructure as Code (Terraform), containerized deployments (Docker/Kubernetes), and automated CI/CD pipelines.

---

### Practical Application to NodeJ2Car Project

Applying the takeaways from all six meetup presentations, I formulated a comprehensive architectural upgrade for the infrastructure, security posture, interactive features, team management, AI search capabilities, and DevOps pipelines of the **NodeJ2Car** project (An auto-parts e-commerce platform):

```
                                  +---------------------------------------------------+
                                  |            NodeJ2Car Cloud Architecture           |
                                  +---------------------------------------------------+
                                                            |
     +---------+---------+---------+------------------+-----+-------------------+-------------------+
     |                   |                            |                         |                   |
     v                   v                            v                         v                   v
[1. Backend Container]  [2. WAF ML Security]  [3. Serverless Realtime Chat] [4. Webhook Task Management] [5. GraphRAG AI Assistant] [6. DevOps & IaC Pipeline]
- Standard Dockerfile.  - ALB behind WAF.     - WebSocket API Gateway.           - ClickUp sprint tracking.   - Bedrock + Amazon Neptune. - Terraform for AWS infra.
- ECR image push.       - Kinesis Firehose.   - Lambda + DynamoDB/Redis.         - GitLab Webhook to Discord. - Auto part entity graph.  - CI/CD GitHub Actions.
- ECS Fargate deploy.   - Lambda + SNS alert. - Real-time support chat room.     - Automated status notifications. - Multi-hop part search.  - Monitoring & Observability.
```

1. **Containerizing & Deploying NodeJ2Car Backend on AWS:**
   - **Standardized Dockerfile:** Package the Node.js API + Socket.io backend using `node:alpine` base image to reduce image size under 150MB, significantly speeding up container build and deployment times.
   - **Serverless Container Deployment on ECS Fargate:** Push Docker Images to **Amazon ECR** and run them on **Amazon ECS Fargate** in Private Subnets, enabling dynamic auto-scaling based on real-time traffic demand.

2. **Upgrading Cybersecurity & Automated Alerting for NodeJ2Car:**
   - **AWS WAF Web Protection:** Position the Application Load Balancer (ALB) behind **AWS WAF** with AWS Managed Rules to protect against SQL Injection, XSS, and rate-limiting brute-force/bot traffic.
   - **Real-Time Incident Monitoring & Alerting:** Utilize **Amazon Kinesis Data Firehose** to stream access logs into an **Amazon S3 Data Lake**, coupled with **AWS Lambda** and **Amazon SNS** to trigger instant email/SMS security alerts whenever anomalous network traffic or cyber attacks target the payment gateway or schematic search APIs.

3. **Real-Time Customer Support Chat & Interactive Matchmaking:**
   - **Serverless WebSocket Implementation:** Adopt **Amazon API Gateway WebSocket + AWS Lambda + DynamoDB / ElastiCache Redis** to manage real-time technical consultation chat sessions between customers and support agents, offloading socket overhead from the main API servers.

4. **Optimizing Project Management & Workflow Automation:**
   - **Enforcing the 4 Golden Rules:** Clarifying Sprint feature goals, aligning tasks according to expertise (Frontend/Backend/DevOps), and fostering personal accountability.
   - **Automated Workflow Notifications:** Manage tasks via **ClickUp** and integrate **GitLab Webhooks** & **ClickUp Bots** into the project Discord channels to automate real-time updates for code commits, merge requests, and task status transitions.

5. **Integrating Intelligent GraphRAG Auto-Part Assistant (GraphRAG for NodeJ2Car):**
   - **Amazon Bedrock & Amazon Neptune Knowledge Graph:** Build an entity-relationship Knowledge Graph mapping vehicle models, 2D schematics, and compatible replacement part SKUs. Utilizing multi-hop reasoning, NodeJ2Car's AI assistant can accurately answer complex customer queries (e.g., *"Which brake pad model is compatible with the 2022 Ford Ranger chassis and currently in stock?"*), drastically improving user search experience and conversion rates.

6. **Implementing DevOps Mindset & Infrastructure as Code (IaC) for NodeJ2Car:**
   - **Infrastructure as Code via Terraform:** Use **Terraform** to automate the provisioning of all AWS resources (VPC, ECS Cluster, ALB, DocumentDB, ElastiCache, S3, WAF), guaranteeing 100% environment consistency between Development and Production.
   - **Automated CI/CD Pipelines:** Implement robust CI/CD pipelines to automate testing, Docker building, ECR pushing, and rolling updates to ECS Fargate with zero service downtime. Configure comprehensive monitoring and observability via AWS CloudWatch and Prometheus/Grafana to proactively detect and resolve incidents before end-users are impacted.

---

### Personal Reflections

Attending the **First Cloud AI Journey Mini Meetup** was an extraordinarily rewarding experience. The six presentations by Mr. Bảo Huỳnh on Docker containerization, Mr. Lê Hoàng Gia Đại on WAF + Machine Learning NIDS, Mr. Nguyễn Quốc Bảo on Serverless WebSocket Multiplayer, Mr. Trương Huy Phước on Effective Teamwork, Mr. Việt Phát on GraphRAG with Amazon Bedrock & Neptune, and Mr. Trần Trung Vinh on IT Infrastructure & DevOps Career Growth provided comprehensive real-world knowledge spanning **DevOps/Containerization**, **Cybersecurity/AI**, **Real-Time Serverless Systems**, **Software Engineering Team Management**, **Cutting-Edge Generative AI**, and **Cloud Engineering Career Roadmaps**.

The insights gained from this meetup have given me full confidence to apply containerization best practices, design a robust multi-layered security architecture, build optimized real-time messaging capabilities, elevate team collaboration, integrate graph-based AI intelligence, and implement automated IaC & CI/CD pipelines for the NodeJ2Car internship project.
