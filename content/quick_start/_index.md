---
title: "Vagrant based Test & Development"
linkTitle: "Quick Start (Dev & Test)"
weight: 20
description: >
 Quick start using Vagrant to create EPIC & workload cluster
---


This [github project](https://github.com/epic-gateway/dev-test-environment) provides scripts to install and configure EPIC Gateway development/test environments. There are two environments:

* Single Node: a minimal environment with two single-VM Kubernetes clusters: one running EPIC, and one running a Gateway API client for testing. The two VMs use a network bridge to talk to one another. This environment is a good starting place if you'd like to learn about EPIC Gateway.
* [Multinode](multinode/): a more realistic (but much more complex) environment with two 3-node clusters, a private internal bridge, a private external bridge, and a router for access to the bridge. Multinode is only recommended if you know you need it.

## Prerequisites

[Vagrant](https://www.vagrantup.com/) and [libvirt](https://libvirt.org/) manage the virtual machines so you'll need to ensure that both are installed and configured for your operating system. Vagrant uses [Ansible](https://www.ansible.com/) to configure the virtual machines that it creates.

_Hint_: on a recent Debian or Ubuntu system this command will install the tools that you need:
```sh
# apt-get update && apt-get install -y git ansible bridge-utils vagrant-libvirt qemu-kvm
```

# Single Node
The Single Node vagrant install created a single node EPIC Gateway and Client k8s cluster. Both are connected to the Vagrant default so they can communicate between gateway and client, and have access to the internet.  However the environment is self contained and does not provide a mechanism to expose the allocated gateway addresses outside of the environment.  However it is very useful for quickly getting a working environment to test and understand the platform.  Also should you choose to try the more complex vagrant multinode or install EPIC on a physical cluster the single node environment can be valuaable as a working reference environment as your customize a production configuration for your needs.


## Setup

```sh
$ git clone --recurse-submodules https://github.com/epic-gateway/dev-test-environment.git
$ cd dev-test-environment
$ vagrant up          # create/configure the VMs
```

This clones the repo and submodules, creates two VMs called ```gateway``` and ```gwclient```, installs a Kubernetes cluster on each of them, installs the EPIC Gateway on ```gateway```, and installs our Kubernetes Gateway API implementation on ```gwclient```.

## Usage

### Gateway

The ```gateway``` VM runs the EPIC Gateway cluster. You can use ```vagrant ssh``` to access it. For example:

```sh
$ vagrant ssh gateway -- kubectl get nodes
NAME           STATUS   ROLES                  AGE   VERSION
epic-gateway   Ready    control-plane,master   31m   v1.23.5
```

Its worth checking that all of the pods are running on the gateway

```sh
$ vagrant ssh gateway -- kubectl get all -A

```

The gateway installation installs k8s and all of the components required by the EPIC gateway. 

In addition to installation, the ansible scripts create a gateway user-namespace called ```root``` and a service account called ```user1```.  The service account is used by the client to create gateways.  The ```root``` namespace contains the components, templates and objects necessary to create and configure gateways.  The user namespace is prefixed by ```epic-``` therefore inspecting namespaces will show the namespace ```epic-root``` has been created and is populated with required objects, templates and components.  A  CLI executable ```epicctl``` is installed as part of the gateway and provides a command that can be used to create user-namespaces that include all of the necessary components.

### Client

The installation scripts create the ```gatewayclassconfig``` and ```gatewayclass``` definitions necessary to enable users to create gateways using the gw-dev-http4 class. 



```gwclient``` runs the EPIC Gateway client. You can use ```vagrant ssh``` to access it.


Check the status of the client cluster
  
  ```sh
  $ vagrant ssh gwclient -- kubectl get nodes
  NAME          STATUS   ROLES                  AGE   VERSION
  epic-client   Ready    control-plane,master   16m   v1.23.5
```
The client should have the gateway components installed and running.

```sh
$ vagrant ssh gwclient -- kubectl get all -A
```

To check that the gwclient can reach the EPIC gateway check the status of the ```gatewayclassconfig``` object.

```sh
$ vagrant ssh gwclient -- kubectl get gatewayclassconfig gwdev-http4 -o yaml
apiVersion: puregw.epic-gateway.org/v1
kind: GatewayClassConfig

  ... etc etc ...

spec:
  epic:
    cluster-name: gwdev
    gateway-hostname: gwdev-ctl
    gateway-template: gatewayhttp
    service-account: user1
    service-key: BsbpQ9Uu65PvPTXo
    user-namespace: root
...

status:
  conditions:
  - lastTransitionTime: "2023-10-26T17:06:23Z"
    message: EPIC connection succeeded
    observedGeneration: 1
    reason: Valid
    status: "True"
    type: Accepted
```
The configuration object identifies the gateway's API service by hostname, gateway service account, user-namespace on the gateway and the name of the gateway template on EPIC that will be used to create a gateway.


The status from the previous command should contain a condition with the message ```EPIC connection succeeded```. This means that the Gateway client is able to communicate with the Gateway's API service.

### Creating a Gateway

A working gateway consists of a gateway object, route objects, service objects as well as the target container.  A simple example is located in the files directory.

```sh
$ vagrant ssh gwclient -- kubectl apply -f - < files/gateway_v1a2_gateway-devtest.yaml
deployment.apps/devtest created
service/devtest created
gateway.gateway.networking.k8s.io/devtest created
httproute.gateway.networking.k8s.io/devtest-1 created
```


**Gateway Status**

```sh
$ vagrant ssh gwclient -- kubectl get gateways devtest
NAME      CLASS         ADDRESS        READY   AGE
devtest   gwdev-http4   192.168.77.2   True    93s
```
A gateway has been created in the gateway cluster has been allocated an external IP address.

**HTTP Route**


```sh
$ vagrant ssh gwclient -- kubectl get httproute devtest-1 -o yaml
apiVersion: gateway.networking.k8s.io/v1beta1
kind: HTTPRoute
metadata:
  annotations:
   ...
  name: devtest-1
  namespace: default
  resourceVersion: "5480"
  uid: 73fde286-8948-42db-9027-ae2a977fe289
spec:
  parentRefs:
  - group: gateway.networking.k8s.io
    kind: Gateway
    name: devtest
  rules:
  - backendRefs:
    - group: ""
      kind: Service
      name: devtest
      port: 8080
      weight: 1
    matches:
    - path:
        type: PathPrefix
        value: /
status:
  parents:
  - conditions:
    - lastTransitionTime: "2023-11-13T16:56:46Z"
      message: Announced to EPIC
      observedGeneration: 1
      reason: Valid
      status: "True"
      type: Accepted
    controllerName: epic-gateway.org/puregw
    parentRef:
      group: gateway.networking.k8s.io
      kind: Gateway
      name: devtest
      namespace: default


```
The route shows the parentRef that points to the gateway and the backendRef that point to the Service. The route is a simple PathPrefix and the status shows that its been announced.


**Check the status on EPIC**

```sh
$ vagrant ssh gateway -- kubectl get -n epic-root gwp
NAME                                   CLIENT CLUSTER   CLIENT NS   CLIENT NAME   PUBLIC ADDRESS   SERVICE GROUP   SERVICE PREFIX
46f0b351-c031-4d40-90ba-56563a64320e   gwdev            default     devtest       192.168.77.2     gatewayhttp     default

```
The gateway is referenced using the ```gwp``` object.  The gateways name is dynamically created with a UUID and the client cluster information, allocated IP address, service group and service prefix are displayed.  The service group is the template that was used to create the gateway and the Service Prefix is the IPAM range used to allocate the address. Editing the ```gwp``` will dynamically reconfigure the gateway.

```sh
$ vagrant ssh gateway -- kubectl get -n epic-root pods
NAME                                                              READY   STATUS    RESTARTS   AGE
eds-server-79c5b4d7cd-7fszz                                       1/1     Running   0          61m
marin3r-discoveryservice-585d497cbf-bxd42                         1/1     Running   0          61m
marin3r-envoydeployment-46f0b351-c031-4d40-90ba-56563a64326c4d2   1/1     Running   0          19m
```
This gateway consists of a single envoy pod, shown above with the name envoydeployment embedded in the POD name.

The Envoy configuration created from the ```gwp``` object can be also be viewed.  The envoy configuration is validated prior to being applied, tainted configurations are not applied and the most likely source is a ```gwp``` or ```lbsg``` template error.

```sh
$ vagrant ssh gateway -- kubectl get -n epic-root ec
NAME                                   NODE ID                                          ENVOY API   DESIRED VERSION   PUBLISHED VERSION   CACHE STATE
46f0b351-c031-4d40-90ba-56563a64320e   epic-root.46f0b351-c031-4d40-90ba-56563a64320e   v3          6c44c9f84         6c44c9f84           InSync
```
Their is also object, ```gwes``` that represent the pod *endpoints*  The object includes node/pod information including names and ip addresses from the client node pods.

```sh
$ vagrant ssh gateway -- kubectl get -n epic-root gwes
NAME                                   CLIENT CLUSTER   CLIENT NS   CLIENT NAME
e705475d-2eff-46f1-bfd8-03eec8619618   gwdev            default     devtest-mxwz7

``` 

### Test the Gateway
As the Gateway is isolated by Vagrant and there is no routing structure to advertize the allocated address, the gateway can only be accessed via the gateway cluster.  (Multi-node includes the components to connect a gateway to the host networks in a representative manner).  

The following can be used to test the gateway.

```sh
 vagrant ssh gateway -- curl -s 192.168.77.2/get
{
  "args": {},
  "headers": {
    "Accept": [
      "*/*"
    ],
    "Host": [
      "192.168.77.2"
    ],
    "User-Agent": [
      "curl/7.68.0"
    ],
    "Via": [
      "epic-gateway"
    ],
    "X-Envoy-Downstream-Service-Cluster": [
      "epic-root.c7537bc6-e735-4350-998e-fe6c91004d18"
    ],
    "X-Envoy-Downstream-Service-Node": [
      "epic-root.c7537bc6-e735-4350-998e-fe6c91004d18"
    ],
    "X-Envoy-Expected-Rq-Timeout-Ms": [
      "15000"
    ],
    "X-Envoy-Internal": [
      "true"
    ],
    "X-Forwarded-For": [
      "192.168.121.142"
    ],
    "X-Forwarded-Proto": [
      "http"
    ],
    "X-Request-Id": [
      "178c73a0-5819-4ba1-a5aa-c92e43fc830f"
    ]
  },
  "method": "GET",
  "origin": "192.168.121.142",
  "url": "http://192.168.77.2/get"
}

```
Note the headers, these are configured in the ```lbsg``` and ```gwp``` objects.





## Multi-node
The multinode is more representative of a production environment.


```mermaid
graph LR

net2 --- R1[router] --- net1
net1 --- E1[EPIC Node 1]
net1 --- E2[EPIC Node 2] 
net1 --- E3[EPIC Node 3]
net1 --- K1[k8s node 1]
net1 --- K2[k8s node 2]
net1 --- K3[k8s node 3]
net2([net brext0])
net1([net user-epic0])

```

Scripts are provided to create a router vm using frr, 3 node EPIC cluster and 3 node workload cluster.  It requires an additional linux bridge to be configured to operate and this bridge is added to the local host so the router can be accessed and requests can be forwarded via the FRR route, EPIC gateways and to the client clusters.

The scripts and instructions are available in the [multinode directory](https://github.com/epic-gateway/dev-test-environment/tree/main/multinode)