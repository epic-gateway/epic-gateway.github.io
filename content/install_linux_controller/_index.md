---
title: "Install and use the Gateway Controller for Linux"
linkTitle: "Linux Gateway Controller"
weight: 50
description: >
 Create gateways and routing structures on Linux hosts
---

The EPIC gateway can be used with Linux hosts that are not running k8s.  The installation uses the same operating model of k8s clusters in that gateways, routes and endpoints can be created from the target linux host using the same resources as k8s clusters.

{{% alert title="Experimental" color="warning" %}}

This is an experimental feature with incomplete functionality.  You have been warned...

{{% /alert %}}


## Installation
The adhoc client is installed using a script downloaded from the (true ingress)[https://github.com/epic-gateway/true-ingress] repo. It is recommended that you check the release as this code is still changing.

```bash
wget wget https://github.com/epic-gateway/true-ingress/releases/download/v0.24.0-options1/install-true-ingress
sudo -i
bash install-true-ingress root
```
The only required parameter is the name of the gateway user-namespace.

The installation adds a process that runs a local version of the manager that is used to connect to the control plane on the EPIC cluster, attaches the eBPF programs and starts a process sending control messages in the forwarding path to EPIC.

The client needs access to the gateway k8s control plane therefore a kubeconfig file is required for the gateway cluster where the gateway will be created.  In this case we are using the *admin.conf* but it is recommended at a specific role/rolebinding be created.  


## Create a Gateway
The following creates a gateway called adhoc listening on port 80.  By default the Service Group Template ```lbsg``` called *gatewayhttp* will be used.  This can be changed by adding a *--service-group* to the create command

```bash
/opt/acnodal/bin/epicctl --kubeconfig /etc/kubernetes/admin.conf create ad-hoc-gateway adhoc 80

```
The allocated IP address and DNS name will be returned.  This information is also available on the gateway cluster in the user-namespace.


As there is no k8s control plane, the endpoint for the hosted application needs to be configured.  In this case the application is listening on 192.168.254.110:8000

```bash
/opt/acnodal/bin/epicctl --kubeconfig /etc/kubernetes/admin.conf create ad-hoc-endpoint 192.168.254.110 8000
```


The gateway create command also creates a http route in the gateway cluster with a PathPrefix / Currently there is not a client command to modify the route from the adhoc client, however the route can be modified by changing the ```gwroute``` resource in the gateway

```yaml
k get gwroutes adhoc -o yaml
apiVersion: epic.acnodal.io/v1
kind: GWRoute
metadata:
  creationTimestamp: "2023-12-07T18:58:15Z"
  finalizers:
  - epic-root.rt.eds.epic.acnodal.io
  - epic.acnodal.io/controller
  generation: 1
  labels:
    epic.acnodal.io/owning-account: root
  name: adhoc
  namespace: epic-root
  resourceVersion: "30990"
  uid: 783ab7ab-d017-4fa0-a529-e9a8cedbd3cf
spec:
  clientRef: {}
  http:
    parentRefs:
    - group: gateway.networking.k8s.io
      kind: Gateway
      name: adhoc
    rules:
    - backendRefs:
      - group: ""
        kind: Service
        name: linux-nodes
        port: 80
        weight: 1
      matches:
      - path:
          type: PathPrefix
          value: /
```



