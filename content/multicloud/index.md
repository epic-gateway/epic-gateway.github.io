---
title: "Multi-Cloud"
date: 2021-12-08T09:16:11-05:00
---

<p align="center">
<img src="/images/multicloud-app.png" style="width:600px">
</p>
<div class="bar-small"></div>



Multi-cloud will become the predominant deployment pattern for production applications.   Use cases start with simple Multi-cloud redundancy and grow when Application authentication and entitlement are enabled on the platform to address regional performance, data locality and personalization.  Looking to the future, can you imagine building Metaverse applications without containers?  The Acnodal platform supports the simplest and most complex requirements.

Simple Multi-cloud is the deployment of identical application instances over more than one cluster.  The platform makes this very simple.  The template used to create the Gateway for sharing.  The Service in the redundant clusters are configured identically and the Gateway combine the endpoints for both clusters on the gateway instances.  To change the distribution among clusters, simply scale up or down the deployments and the endpoints cluster endpoints will be dynamically removed.  This is the simplest redundancy model, but there is much more scope for configuration, Reliability / Redundancy. 

More advanced advanced Multi-cloud applications distribute Application components over multiple destinations in one or more provider.  These often include both HTTP and API services.  The Gateway provides destination endpoint control, commonly referred to as Routing configured from within the k8s cluster using the Gateway API based upon URL or SNI.  

The most advanced applications benefit from moving identity and entitlement to the Gateway edge, combining user information with the decisions made to distribute requests.  The Gateway supports authentication, the easiest way to add identify and is programmable.  A program, written in either LUA or WASM can be attached to each session context manipulating how the requests are handled and adding to or changing the requests to add information for target application components.