---
title: "“Cloud Architect” Competition Event"
date: 2026-06-15
weight: 2
chapter: false
pre: " <b> 4.2. </b> "
---

# Harvest Report: “Cloud Architect” Competition Event

![Cloud Architect Competition Event](https://fcaj-intern-report.vercel.app/images/4-EventParticipated/Evt_2.jpeg)

### Event Information
* **Event Name:** “Cloud Architect” Competition Event
* **Date & Time:** During Internship
* **Location:** 26th Floor, Bitexco Tower, 02 Hai Trieu Street, Saigon Ward, Ho Chi Minh City
* **Role:** Event Observer & Audience Member

---

### Event Objectives & Atmosphere
The **“Cloud Architect”** competition was organized as a thrilling head-to-head knowledge contest among cloud trainees and engineering teams. The core objective of the event was to test real-time incident response reflexes, system architecture design mindsets, and comprehensive knowledge across the Amazon Web Services (AWS) ecosystem ranging from foundational to expert levels.

Attending as an active spectator and observer, I had the opportunity to witness intense score races, bold tactical power-up decisions, and dramatic turnarounds between the competing teams, particularly the head-to-head matchup between **Team PrimeOps** and **Team KLKÂT**.

---

### Competition Format & Tactical Power-ups

#### 1. Tournament Structure
The competition was structured into three direct knockout rounds featuring questions of increasing difficulty mapped to international AWS certification tiers: **Cloud Practitioner** (Foundational level - 10 points), **SAA - Solutions Architect Associate** (Intermediate level - 20 points), and **SAP - Solutions Architect Professional** (Expert level - 50 points).

* **Quarterfinals (Qualifying Round):** 10 questions (7 Practitioner, 2 SAA, 1 SAP).
* **Semifinals:** 10 questions (5 Practitioner, 3 SAA, 2 SAP).
* **Finals:** 10 questions (3 Practitioner, 4 SAA, 3 SAP).

#### 2. Tactical Lifelines (Power-ups)
Each team was equipped with two tactical lifelines to strategically alter match dynamics:
* **Minimum Risk:** When activated, a correct answer yields half the question's score (`+50%`), while an incorrect answer incurs zero penalty (`0% penalty`). A safe strategy for steady accumulation.
* **Star of Hope:** A high-risk, high-reward double-edged sword. A correct answer doubles the question's score (`+200%`), but an incorrect answer deducts double the points (`-200% penalty`).

---

### Match Narrative from an Observer's Perspective: A Dramatic Comeback

Watching from the audience during the Quarterfinal match between **Team PrimeOps** and **Team KLKÂT**, the atmosphere inside the venue was filled with intense anticipation.

#### Phase 1: PrimeOps' Dominant Early Game
For the vast majority of the match, Team PrimeOps delivered a highly convincing performance. Possessing a solid knowledge base in Practitioner and SAA questions, PrimeOps consistently provided accurate answers with rapid response times. They controlled the flow of the match, steadily expanding their lead to **70 points** heading into the final question.

#### Phase 2: The High-Stakes SAP Gamble
Peak drama unfolded at question 10 – an expert-level **SAP (Solutions Architect Professional - 50 points)** question containing deep technical complexity.

Facing a daunting 70-point deficit, Team KLKÂT was in a "nothing to lose" scenario. They made a bold strategic move: **Activating the Star of Hope lifeline**. Answering this SAP question correctly would grant them a massive **100 points** (`50 x 2 = 100`).

#### Phase 3: The Unbelievable Comeback
From an observer's viewpoint, this SAP question proved exceptionally challenging for both teams. The deep architectural topics regarding Multi-Region design, cost optimization, and traffic routing required immense deliberation.

As the timer reached zero, Team KLKÂT submitted their answer with determination combined with a stroke of timely luck. The judges announced: **Correct!**. Instantly, 100 points were added to KLKÂT's score, instantly erasing PrimeOps' 70-point lead and securing a dramatic victory that stunned the audience.

---

### Key Takeaways & Lessons Learned as an Infrastructure Observer

Although observing the match from the spectator seats, the dramatic shifts in the “Cloud Architect” competition yielded valuable technical and operational insights:

#### 1. Uncertainty & Unexpected Risk Factors in Cloud Infrastructure
In real-world cloud operations, no matter how impeccably engineered or well-prepared a system might be (much like PrimeOps' initial 70-point advantage), unexpected variables can always emerge (Zero-day vulnerabilities, physical data center outages). Complacency can expose even robust infrastructures to sudden failure.

#### 2. Risk Management & Strategic Trade-offs
KLKÂT's decision to trigger the "Star of Hope" on the hardest question demonstrated risk acceptance in action. In Architecture Design, engineers constantly evaluate **Trade-offs** between Cost vs. Availability, and Security vs. Performance. Knowing when to take calculated risks can unlock breakthrough solutions.

#### 3. The Imperative of Expert-Level Knowledge (AWS SAP Level)
The match-deciding SAP question underscored that foundational cloud knowledge alone is insufficient for complex enterprise scenarios. To architect fault-tolerant, scalable, and resilient systems, engineers must continuously deepen their expertise toward Professional-level standards.

#### 4. Practical Application to the NodeJ2Car Project
Observing the competition highlighted key principles applicable to the **NodeJ2Car** internship project:
* **Multi-AZ / Multi-Region Fault Tolerance:** Avoid single points of failure. Configure NodeJ2Car's ECS Fargate containers across multiple Availability Zones to withstand sudden regional disruptions.
* **Chaos Engineering & Resilience Testing:** Regularly simulate worst-case outage scenarios to validate failover capabilities for DocumentDB and ElastiCache Redis, ensuring the platform remains resilient against unexpected operational shifts.

---

### Conclusion
The **“Cloud Architect”** competition provided not only an entertaining spectacle for the audience but also an engaging real-world lesson in cloud architecture. Observing the teams' tactical choices reinforced my AWS knowledge, sharpened my risk analysis mindset, and motivated me to pursue higher-level AWS certifications.
