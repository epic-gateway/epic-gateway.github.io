---
title: "Public Cloud"
date: 2021-12-10T09:16:11-05:00
---

<p align="center">
<img src="/images/public-cloud.png" style="width:600px">
</p>
<div class="bar-small"></div>


The platform can provide a better alternative to the Application Access solutions offered by Public Cloud providers that were created by repurposed Virtualization tools.  Multicloud, or a combination of Public and Private Cloud resources can provide offer a best of breed, highly available solution for production applications.

The Access platforms k8s Gateway Controller, PureGW can co-exist with the default Cloud Provider access tools (as our k8s v1.22) using LoadBalancer Class or the Gateway API.  Developers can select the access mechanism that best meets the needs of the application users.  

Cloud provider separate Access into three distinct products, NLB - L3/4 access, ALB - L7 access, and API gateway -L7 with improved routing rules.  The Application Access Platform provides all three access modalities in a single platform with significantly more functionality

Kubernetes is integrated with Cloud Providers infrastructure using a Cloud controller that translates Kubernetes API requests into the providers infrastructure components.  This controller is not visible to Cloud users, inspecting its operation requires locating and reading the cloud controller source code assuming it has been released.  This integration with the Cloud providers legacy tools compounds the problems caused by limited function legacy tools and impacts the ability on how in-cluster tools can be employed.  

Cloud providers do a very good job (not perfect) of VPC isolation, but edge NLB/ALB and API gateways are shared resources and no visibility is given to adjacent users of the shared complex, who may be under DDOS or some other form of attack.  

Acnodal gives infrastructure teams the choice of dedicated resources with complete visibility to all request/traffic being presented at the gateway, either via privately managed EPIC platforms or dedicated instances from our datacenter partners who are directly connected to major cloud providers.