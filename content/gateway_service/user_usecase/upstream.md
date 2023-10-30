---
title: "Upstream Kubernetes"
linkTitle: "Upstream K8s & EPIC"
date:  2022-06-02
description: "Installing the Gateway Controller & using EPIC with Upstream Kubernetes"
---


EPIC can be used with upstream Kubernetes, it just requires the installation of the Gateway Controller as per the getting [Started Guide]({{< ref "/gateway_service/user_manual/getting-started" >}}).


### Tested Versions:

Kubernetes: 1.21, 1.22, 1.23, 1.24

CNI: Flannel, Calico

### Notes:

We use upstream Kubernetes extensively and therefore regularly use it for testing.  The CNI we use the most is the latest version of Flannel, its simple and just does one job, setup the CNI.  There is no reason that the Gateway Controller for EPIC will not run with your CNI of choice, however we don't test them all.  Let us know if you need us to test a specific CNI.    

No specific configuration or implementation was required for support of upstream Kubernetes

