---
title: "Reliability"
date: 2021-12-13T07:12:11-05:00
---

<p align="center">
<img src="/images/reliability.png" style="width:600px">
</p>
<div class="bar-small"></div>

EPIC is not one one of the many components that need to be integrated to create an application access platform, it is the complete platform,  Therefore we can take a wholistic approach to redundancy leveraging each component and function to deliver a platform with multilayer redundancy.  


* The EPIC platform is a cluster of nodes, and Gateway is compromised of two or more Gateway instances distributed among nodes.  

* EPIC allocates IP prefixes to each gateway and that same address is used on each instance and advertise by routing (anycast).  Gateway instances advertise external addresses when they have healthy upstream endpoints.  The upstream router is configured for Equal Cost Multi-path.  A failure of a gateway instance or EPIC node results in the route to the gateway instance being immediately withdrawn.

* The Gateway instances remove and manage unreachable endpoints, only re-adding an endpoint following successfully reachability tests.  Additional degraded and failure handling can be configured with advanced circuit breaking changing how requests are distributed based upon the available endpoints

The chosen Gateway instance engine is an important component but an Application Access platform requires more than just the engine.  The Acnodal Application Access platform provides all of the functionality necessary to leverage the benefits of the most advanced gateway engines. 
