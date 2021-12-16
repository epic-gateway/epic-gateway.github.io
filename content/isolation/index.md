---
title: "Isolation"
date: 2021-12-10T09:16:11-05:00
---


<p align="center">
<img src="/images/isolation.png" style="width:600px">
</p>
<div class="bar-small"></div>


The accepted deployment pattern used since the inception of the Internet is that Access platforms should be isolated from customer applications and data.  However integrating a legacy solutions using in Web2.0 and virtualization architectures with k8s seriously impair functionality and undermine the benefits of the platform.  Solutions that move Application Access into the k8s cluster violate isolation and should the in-cluster access be compromised the threat of lateral movement resulting in access to customer applications and data is realized.

The Acnodal Application Gateway is the first platform built for k8s using k8s.  It follows the isolated deployment pattern without impacting k8s functionality.  In fact, the Gateway adds additional functionality that is not available in in-cluster or legacy platforms providing a superior solution for access a single cluster, multiple clusters or public clouds.



Isolation is a key foundation, our platform builds on that foundation is three key areas.

* Towards the Internet.  When a gateway is created its is allocated an IP address, when the gateway instances are active, that address is advertized towards the edge router and the specific ports for the gateway are opened for that address.  The gateway design pattern is to drop everything by default and only allow access to active gateways
* In the Gateway.  Traffic transiting the platform via the gateway instances is separate from control plane traffic.  The gateway instances are Envoy proxy engines, all of the security functions available in Envoy include traffic control plugins are available.  In addition, the option of running a WAF in the gateway is provided a partnership.
* Towards the cluster.  The cluster establishes initial connectivity between k8s clusters and the Application Gateway.  Requests traveling between the Gateway and the cluster are encapsulated and use a dynamically configured header that is required for encap/decap.  Of course, the request travelling between the gateway can be encrypted using TLS.  The NAT and firewall in front of the cluster require no specific configuration to operate.




