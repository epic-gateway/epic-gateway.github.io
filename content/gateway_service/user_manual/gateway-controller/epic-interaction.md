---
title: "EPIC & the Gateway Controller"
linkTitle: "EPIC & Gateway Controller"
weight: 20
description: >
 How the Gateway Controller interacts with EPIC
---


Gateway Controllers support specific Gateways, in this case the external EPIC gateway.  The controller installed on the k8s cluster watches the Gateway API and other k8s APIs, communicating with the EPIC gateway and updating the state of the k8s clusters.  The controller consists of two components: the controller manager, and a controller agent running on each node providing gateway connectivity.




<p align="center">
<img src="../epic-interact.png" style="width:600px">
</p>




## Control Plane
The control plane between the k8s cluster and EPIC uses a REST interface.  Communication with EPIC is initiated by the Controller.  In general the cluster manager is a control plane only component, it communicates with EPIC and the k8s API to create state. The controller agent runs as a daemonset and also communicates with EPIC.  It provides node-specific information, specifically where PODs are running so state can be established in EPIC and forwarding can be setup to direct requests to nodes with PODs.


## Forwarding 
Traffic is sent from EPIC directly to the the nodes where the targeted PODs reside.  The traffic is encapsulated using GUE variant 0 allowing control information to be passed with encapsulated traffic.  The agent running on the target node is configured to decap/encap traffic.  The decapsulated traffic is sent directly to the POD endpoints on the node.  This avoids k8s traffic distribution provided by kubeproxy and NAT translation enabling additional proxy functionality, and most importantly provides the Gateway with direct POD health checking that can be used to manage performance and uptime.  The Linux kernel does not support GUE variant 0 (only variant 1 referred to as Foo over UDP).  The controller implements GUE v0 forwarding and other session management logic using eBPF.
