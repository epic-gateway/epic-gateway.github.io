---
title: "PureLB support LoadBalancer Class"
date: 2021-09-15T08:27:23-05:00
---

### PureLB supports LoadBalancer Class in Kubernetes 1.22

##### _A key capability for multi-cloud users_

---
PureLB, the open-source Service Load Balancer for Kubernetes now supports LoadBalancer Class introduced in Kubernetes v1.22.

This capability allows users to select between the LoadBalancer provided by default by the Cloud provider and other external LoadBalancer solutions.

PureLB operates as a stand alone Service LoadBalancer controller in addition to providing integration with EPIC, the External Ingress.  PureLB can simplify exposing services at Cloud Providers where private links are used between Enterprise and Cloud networks.  When used with EPIC, advanced multi-cloud configurations leveraging the full capabilities of Envoy can be created.

This release of PureLB open-source is available today....

9/15/2021