---
title: "PureLB"
date: 2021-01-27T09:16:11-05:00
---



<img align="left" src="/images/purelb.png">


</br>

**_PureLB_** is a Service Load Balancer for Kubernetes.  A LoadBalancer is a Service type that allows configuration of external network components to enable external network access to the specified application resources. 

Service Load Balancers are key component in the K8s developer workflow.  They allow the configuration of resources used to enable access to applications to be pre-configured so they can be accessed on demand by developers via service definition.  This simple operation can be undertaken on demand or as part of CI without custom configuration or tooling. 

PureLB assigns addresses from Service Group address pools and adds them to the Local Network or to a Virtual Network used to distribute those addresses via routers.  With PureLB you can control application access while your team uses the same workflow for exposing applications they use in Public Cloud Providers

</br>

---
##### _Get Started with PureLB_
</br>
<div class="row">
    <div class="col-md-6">
    <div align="center">
    <a href="https://gitlab.com/purelb/purelb" title="PureLB REPO">
        <img src="/images/gitlab_logo.png" style="width:88px; height:88px;">
    <br>
    Repo
    </a>

---
<br>

##### _Local Network Addresses_

<br>
<img src="/images/purelb-local.png">
<br>
</div>

By creating a service group that includes a range of addresses that is contained the subnet used by the hosts, PureLB will add each allocated Load Balancer address to the local NIC on one of the k8s nodes.  This configuration is ideally suited for applications that are accessed by users that have direct access to the hosts and host network for administrative purposes.  Exposing platform management systems is an ideal example.  Also great for use in the lab or on a desktop development workstation.


</div>
    <div class="col-md-6">
    <div align="center">
    <a href="https://purelb.gitlab.io/docs" title="Documents">
        <img src="/images/book.png">
    <br>
    Documents
    </a>

---
<br>

##### _Routed Network Addresses_

<br>
<img src="/images/purelb-routed.png">
<br>
</div>
Create a service group with a new range of addresses not currently in use and PureLB will add these addresses to an interface called kube-lb0 on each node.  By adding routing software or using the routing functionality packaged with the CNI, import the kube-lb0 interface (redistribute) into the routing process and gain full control of the distribution of Load Balancer addresses.  This technique provides anycast, each node advertizes the address and upstream router provides Equal Cost Multipath load balancing.  As routing protocol are designed to update (converge) when node failure occurs, this also provides a solution for redundancy.  Add some firewall rules to your router and the attack surface of your application becomes very small.

</div>
</div>

