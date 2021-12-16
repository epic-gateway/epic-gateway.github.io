---
title: "Friction"
date: 2021-12-10T09:16:11-05:00
---


<p align="center">
<img src="/images/friction.png" style="width:600px">
</p>
<div class="bar-small"></div>



Kubernetes does a great job of increasing Developer velocity by abstracting many of the general infrastructure tasks necessary to build application, until its necessary to expose the application to the public.  Complete k8s Project velocity can be achieved with the Acnodal Application Access platform.

The Application Access platform is integrated with k8s using k8s clusters api using the Gateway API.  This standard API was designed to provide a uniform way to configure external L7 Gateway.  Using the platform, configuring application access is abstracted to the developer just like other resources.  Using standard k8s tools or CI, the developer requests Gateway resources, the specific Network and Security configuration is contained in a template created by the infrastructure engineers, how and where requests are forwarded within the k8s clusters is part of the Gateway request configured by the application developer.  Upon request by the developer, external IP addresses are assigned, firewalls are updated,  the gateway instances are created, certs are loaded.  When each gateway instance is ready to accept traffic, routes are distributed and DNS is updated.

Application developers are not waiting for infrastructure engineers to configure access.  Infrastructure and Security engineers define compliant applications access configurations and developers can create Gateways from those template configurations.


Every cluster is accessible using the same, uniform mechanism, inside each cluster, teams are free to use the best tools, including Service Mesh technology without worrying how it will impact access and security policies.