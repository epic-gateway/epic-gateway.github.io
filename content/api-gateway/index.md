---
title: "API Gateways"
date: 2021-12-13T08:20:11-05:00
---

<p align="center">
<img src="/images/api-gw.png" style="width:600px">
</p>
<div class="bar-small"></div>

Modern application are a combination of HTTP and API's enabled by frameworks like React, Vue and Angular.   The initial page is served via http containing all of the code necessary to render the page and the contents of the or pages are updated using API calls to backends.  This application pattern is often referred to as Single Page Applications.


The Application Access Platform provides support for accessing both the HTTP and API components of these applications.  The key difference is that request routing is a mandatory requirement for API requests and the requests could be sent using one of the versions of HTTP or GRPC.  The routing rules in used to direct API requests to individual backend systems that update different application components rendered by the initial HTTP page load.

The Platform includes support for the k8s Gateway API.  This component enables the configuration of request routing rules to be undertaken in the k8s clusters where the application components reside and the Application Gateway updated.  Kubernetes allows these rules to be configured using its declarative model or programmatically via the native k8s API.  The rules can extend to resources in other clusters or non-kubernetes assets if desired.

Additionally the rules can be configured directly in the Application Gateway via the configuration templates or active gateway configuration, offering flexible configuration permutations.

Combining the API Gateway Functionality with the HTTP Load Balancer functionality simplifies the operation aspects of managing initial application construction, as well as ongoing operational security and customer experience.  Acnodals product roadmap includes integration with popular API focused management systems enabling a solution that meets the needs of infrastructure, security and development engineering teams. 
