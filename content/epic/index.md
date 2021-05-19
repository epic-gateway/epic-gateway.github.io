---
title: "EPIC"
date: 2021-01-27T09:16:11-05:00
---

<div class="row">
    <div class="col-md-6">
    <img src="/images/carousel/epic.png">
    </div>
    <div class="col-md-6">
</br></br>

## _EPIC_ ## 
Unlock the full functionality of Hyperscaler Ingress technology.  EPIC, the Intelligent External Ingresses operates outside the k8s cluster at the system, network and edge-compute edge implementing the logic that constructs web and mobile applications using containers, CDN and legacy systems.   EPIC provides Intelligent External Ingresses with devops simplicity employing native Kubernetes APIs used in public clouds avoiding specialized tooling or workflow.

</div>
</div>
<div class="bar-small"></div>

<div id="hybrid" class="row">
    <div class="col-md-6">

#### _Hybrid & MultiCloud_

<img src="/images/hybrid-multi.png" style="width:550px;">

</div>
    <div class="col-md-6">

#### _Complex Edge Applications_
</br>
</br>
<img src="/images/complex-edge.png" style="width:550px; ">
</div>
</div>

<div class="row">
    <div class="col-md-6">

EPIC, the Intelligent External Ingress resides outside of the k8s clusters enabling applications and workload components to be distributed among multiple public and private clouds.  EPIC retains and expands on the functionality of an k8s in-cluster ingress using our unique “true-ingress” direct to POD transport.

</div>
<div class="col-md-6">
Ingresses used construct applications from containers need intelligence and programmability.  Edge computing distributes application resources increasing the demand for  intelligence to direct customer requests to diverse resource endpoints including CDNs and other non-k8s endpoints.  EPIC unlocks unparalleled programmability with an individual Ingress per application enabling complex location, content and user based distribution.
</div>

<div class="bar-small"></div>


EPIC creates External Ingresses for kubernetes under the control of PureLB, the open-source Service LoadBalancer Controller.   Kubernetes is a "first class citizen", the creation of Ingresses is undertaken by the k8s services (or gateway) API.  Each External Ingress is constructed from a template and once created, version controlled.  EPIC is multi-tenant, every Ingress is created in a user namespace and each user can create as many Ingresses as they need. In addition to templates and configurations, each user namespace can contain Certificates, a system-wide Certificate Manager enables local or remote Certificates to be issued and shared among Ingresses owned by the user.  Upon creation, the Ingress is allocated an IPv4 or IPv6 address from either a global or user namespace pool, with the option of updating DNS servers dynamically with EPIC updating routing protocols to advertize the allocated addresses.  

The upstream endpoints for each Ingress are updated dynamically by PureLB running in the k8s cluster based upon changes to the application deployments or daemonsets.  An Ingress can be configured to span multiple k8s clusters operating in different cloud locations allowing applications to be distributed among providers.  Redundancy and request distribution will reflect the POD distribution in the respective k8s clusters. Endpoints other than k8s PODs can also be defined either statically via the Ingress configuration or using a REST API to achieve the same level of dynamic configuration enjoyed by the k8s clusters.   


EPIC creates Ingresses using Envoy, the leading Ingress Proxy Engine.  The Ingress is configured using a native Envoy configuration unlocking the full functionality of Envoy.  Each ingress can be created from a unique image stored in EPIC enabling advanced, early release configurations to me mixed with proven production images.  Each EPIC cluster manages fleets of Envoy Ingress Proxy Engines, multiple clusters can be configured geographically to enable anycast configurations.


An External Ingress needs to forward requests directly to PODs, otherwise advanced request routing functionality is lost.  EPIC and PureLB implement a unique Service Encapsulation called "True Ingress", developed using eBPF, that forwards requests to the POD network within the cluster and directly to the PODs.  The POD network remains segmented from the external IP network.  True Ingress avoids the need to make complex routing changes increasing the attack surface of the k8s cluster. True Ingress keeps the CNI network separate from the external routed network while also transiting Network Address Translation further avoiding routing reconfiguration.


EPIC replaces Legacy ALB’s and proxies, increasing functionality and integrating programmable Intelligent Ingress technology with modern DevOPs workflows.  Cloud ALB’s are tightly integrated with specific cloud providers and provide limited functionality and no programmability, largely operating as a blackbox.   Neither provide the level of functionality and programmability provided by the EPIC platform.
