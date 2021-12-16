---
title: "Application Access Platform"
date: 2021-12-08T09:16:11-05:00
---

<p align="center">
<img src="/images/platform.png" style="width:1000px">
</p>
<div class="bar-small"></div>

The **Acnodal Application Access Platform** follows the deployment model of access external and isolated from user data, while retaining  Kubernetes functionality, enabling Multi-cloud applications and providing the network, security and traffic functionality demanded at the public edge.


- **EPIC** - *Application Gateway built for k8s using k8s*.  Deployed in isolation of the k8s clusters were applications and data reside, EPIC creates per application or service gateway instances, configures networking to attract traffic, and establishes direct-to-POD transport to application components, configured and managed using k8s familiar, native declarative object model.


- **PureGW** -  *Kubernetes Controller* that implements support for the Gateway API and LoadBalancer API that listens k8s requests, signals EPIC to create gateway instances and configures nodes to enable direct-to-POD transport for application components.  PureGW is supported by all popular k8s packages and can be deployed in Public Cloud providers.  

<div class="bar-small"></div>

#### How EPIC & PureGW work together
Installed in the k8s the PureGW controller provides a familiar k8s interface to enable the developer to configure application components and request the creation of a gateway for developed applications.  The request contains the name of a gateway template, located in the Gateway User Namespace containing the configuration of the gateway to be created for the application. This separation allows the infrastructure and security team to establish pre-defined gateway configurations and in the target k8s clusters developers request gateways configured to meet their applications needs. 

When Gateway is created, direct-to-POD communications is established and PureGW dynamically updates application endpoint to that k8s POD scaling, changes or tests are dynamically reflected in the Gateway instance.  To provide the flexibility to create more complex single page applications, routing rules can be established in the k8s cluster than are also dynamically updated.  The Gateway also allocates IP address, configures firewall rules, advertised allocated addresses via BGP and adds records to DNS services, all based upon the initial gateway template. 

A Gateway instance can also be shared among multiple k8s clusters.  When configured, each clusters endpoints will be added and request distributed among those clusters.  Connectivity or cluster failure to one of the clusters is rapidly identified, enabling applications resilience over cluster, providers and geographies.

<div class="bar-small"></div>

#### Access built for k8s, using k8s
<p align="center">
<img src="/images/solution-compare.png" style="width:600px">
</p>

Legacy Web2.0 and virtualization solutions provide that provide the necessary isolation deployment pattern but lack the architecture, features and integration necessary to leverage the velocity and user experience that can be provided by k8s abstraction and dynamic resource management.

Ingress controllers or Service Meshes deployed in the k8s cluster attempting to take on the role as external access devices provide the the k8s features needed but bring external access into the cluster where the customer applications and data resides, violating the isolation pattern and increasing security threats. 

The Acnodal Application Access platform provides physical and operational isolation, while delivering a Multi-cloud superset of the features of in-cluster solutions.  This deployment pattern and functionality combination is the only solution that enables deployment of large scale k8s applications safely, reliably and rapidly.