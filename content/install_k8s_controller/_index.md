---
title: "Install and use the Gateway Controller for K8s"
linkTitle: "k8s Gateway Controller"
weight: 40
description: >
 Enable k8s cluster users to create gateways and routing structures 
---


To configure and communicate with the Gateway a controller is installed on the cluster.  The installation consists of support for a specific version of the standard GatewayAPI that supports features enabled by EPIC and the EPIC gateway controller (puregw).

The definition of Gateways is logically separated into activities: the creation of GatewayClassConfig & GatewayClass, and the creation of the gateway and its associated routes.

```mermaid
graph LR
    A1[gatewayClassConfig] --> B1
    B1[gatewayClass] --> C1
    C1[gateway] -->  D
    D[Route] --> E1[Service A]
    A2[gatewayClassConfig] --> B2
    B2[gatewayClass] --> C2
    C2[gateway] -->  D
    D[Route] --> E2[Service B]
    D --> E3[Service C]
    subgraph Administrator
    A1
    A2
    B1
    B2
    
    end
    subgraph Users & Developers
    C1
    C2
    D
    E1
    E2
    E3
    end
```

| Resource | Scope | Source | Description |
|----------|-------|--------|-------------|
| gatewayclassconfig | namespace | controller | Configuration specific to the target EPIC, namespace & template|
| gatewayclass | global | k8s Gateway API | Makes the gateway defined in the gateway class available to users |
| gateway | namespace | k8s Gateway API | A gateway created from the a gateway class |
| httproute | namespace | k8s Gateway API | Support http rules connecting gateways and services |
| tcproute | namespace | k8s Gateway API | Connects gateways and services |
| service | namespace | k8s API | Exposing POD protocols & ports |


## Prerequisites

Before installing PureGW you need to install the [Gateway-SIG](https://gateway-api.sigs.k8s.io/) custom resource definitions manually. Eventually they'll be bundled into Kubernetes but they aren't yet.

```bash
$ kubectl apply -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v0.5.1/experimental-install.yaml
```

## Installation

To install PureGW, apply `pure-gateway.yaml` from the most recent release on GitHub:
https://github.com/epic-gateway/puregw/releases

For example, if the most recent release is v0.26.0, then you can install PureGW by running:

```bash
$ kubectl apply -f https://github.com/epic-gateway/puregw/releases/download/v0.26.0/pure-gateway.yaml
```

You should see one instance of the manager pod running, and one instance of the agent pod running on each node in the cluster.

{{% alert title="Multinode Development Environment" color="info" %}}
If you're using the vagrant multinode development environment the ansible scripts install the GatewayAPI and Gateway controller as well as adding a ```gatewayclassconfig``` and ```gatewayclass``` that matches the multinode EPIC configuration.
{{% /alert %}}


## Configuration

For each class of gateway created a ```gatewayclassconfig``` resource is created.  This resource provides the configuration necessary to create a gateway from a referenced gateway class.  There are components in the configuration.  

```yaml
apiVersion: puregw.acnodal.io/v1
kind: GatewayClassConfig
metadata:
  name: gatewayhttp
  namespace: epic-gateway
spec:
  epic:
    user-namespace: root
    service-account: user1
    service-key: yourservicekey

    gateway-hostname: uswest.epick8sgw.io
    gateway-template: gatewayhttp
    cluster-name: mycluster
  trueIngress:
    decapAttachment:
      direction: ingress
      interface: default
      flags: 1
      qid: 0
    encapAttachment:
      direction: egress
      interface: default
      flags: 16
      qid: 1
```


| Object |Description|
|--------|------------|
| user-namespace | The user namespace create on the gateway using *epicctl* (without the epic- prefix) |
| service-account |  The API User account  created in the user namespace on the gateway using *epicctl* |
| service-key | The password created when the API User Account was created on the gateway using *epicctl* |
| gateway-hostname | the hostname for the EPIC gateway's API Service. |
| gateway-template | template (lbsg) located in the user namespace that will be used to create the gateway |
| cluster-name | a name for this cluster that will be displayed in the EPIC Gateway |

{{% alert title="trueIngress Configuration" color="info" %}}
The trueIngress section is required but should not require changes.  The specifics of how this is configured are beyond the scope of this documentation.  In short, this is the configuration used to attach the eBPF program that provide Generic UDP encapsulation used by EPIC.  Assuming traffic between cluster and gateway follows the default route, this configuration will work correctly.  If there are multiple interfaces with complex routing, some configuration may be necessary, most likely the specification of the interface that traffic will transit between cluster and gateway in the ```interface``` object.
{{% /alert %}}


The ```gatewayclass``` object binds the ```gatewayclassconfig``` object and is referenced when creating a gateway.  

```yaml
apiVersion: gateway.networking.k8s.io/v1alpha2
kind: GatewayClass
metadata:
  name: gatewayhttp
spec:
  controllerName: acnodal.io/epic
  parametersRef:
    name: gatewayhttp
    namespace: epic-gateway
    group: puregw.acnodal.io
    kind: GatewayClassConfig

```

The creation of a ```gatewayclassconfig``` and ```gatewayclass``` tests communications to the EPIC cluster.  The status section of these resources will indicate success or failure to connect to the defined EPIC cluster.

Assuming EPIC connection has succeeded, users of the k8s workload cluster can now create gateways.


## Creating a Gateway & Routes
Users create gateways in their namespaces along with routes. By default gateways are only accessable by routes in the same namespace however the ```gateway``` resource can be configured to allow access from other namespaces sharing the gateway within the cluster.  EPIC also provides a mechanism to share gateways across multiple customers and Linux hosts. 



```yaml
apiVersion: gateway.networking.k8s.io/v1alpha2
kind: Gateway
metadata:
  name: sample-gateway
  namespace: default
spec:
  gatewayClassName: gatewayhttp
  listeners:
  - protocol: HTTP
    port: 80
    name: gwdev-web
```
This will create a gateway called *sample-gateway* based upon the ```gatewayclassconfig``` referenced by the configured ```gatewayclass```

```bash
$ kubectl get gtw
NAME             CLASS         ADDRESS        READY   AGE
sample-gateway   gatewayhttp   192.168.77.2   True    1h
```
The gateway is a separate resource from routes.  This is because the gateway is a slow changing resource while routes can change as the application is developed.  The controller implements status information including generated hostname that can be passed to a DNS server using kubeDNS on either the Gateway or the Workload cluster.  When routes are attached, they are also displayed in the status of the ```gateway``` resource.


Routes bind gateways to services.  In the case of HTTP routes they can also undertake traffic splitting, host matches, path matches and header matches.  Samples of each of these is documented in the (Gateway-as-a-Service User Guide)[/gateway_service/user_usecase/httproutes/]


```yaml
apiVersion: gateway.networking.k8s.io/v1alpha2
kind: HTTPRoute
metadata:
  name: sample-route
  namespace: gtw-test
spec:
  parentRefs:
  - name: sample-gateway
    namespace: default
  rules:
  - backendRefs:
    - name: demows
      namespace: default
      port: 8080
```
The example above is a simple route referencing the *sample-gateway* as the parentRef and the backendRef refer to the service *demows* that exposes port 8080.

Inspecting the httpRoute resource will provide status information including confirmation that the route has been announced to EPIC.

{{% alert title="Endpoint Debugging" color="warn" %}}
The controller updates EPIC when Endpoints are created, not when services are created.  This is where EPIC gets the POD addresses used to distribute requires to each node/pod combination.  Its good first step in workload cluster debugging is checking that endpoints are present using *kubectl get ep*
{{% /alert %}}


## Multi-cluster
The Gateway and workload controllers supports multi-cloud, multi-cluster.  A Gateway can be shared among multiple clusters.  The routes created in each cluster are merged by EPIC.  A route can be used to direct request to a backend in a specific cluster or used to load balance request across clusters.  To enable Gateway sharing *can-be-shared* must be enabled in the ```gwp``` resource or the ```lbsg``` template user to great it.

<p align="center">
<img src="multiroute-diagram.png" style="width:600px">
</p>

The diagram below shows the relationship between the resources in the EPIC and the clusters.  The structure of objects in EPIC logically mirrors the structure in the cluster so that the relationship between resources can be easily identified.

```mermaid
flowchart TB
    Z[Gateway] --- A1
    Z --- A2
    Z --- Z1[Routes]
    Z1 --- Z2[EndPoints]
    


    D1 -.-> Z1
    D2 -.-> Z1
    E1 -.-> Z2
    E2 -.-> Z2



    A1[gatewayClassConfig] --- B1
    B1[gatewayClass] --- C1
    C1[gateway] --- D1
    D1[route] --- E1
    E1[Service A]

    A2[gatewayClassConfig] --- B2
    B2[gatewayClass] --- C2
    C2[gateway] --- D2
    D2[route] --- E2
    E2[Service B]
    subgraph Cluster A
    A1
    B1
    C1
    D1
    E1
    end
    subgraph Cluster B
    A2
    B2
    C2
    D2
    E2
    end
    subgraph EPIC
        Z
        Z1
        Z2
    end

```
### Configuration
Both clusters create a *GatewayClassConfig* that references the same EPIC gateway template, and create a *GatewayClass*


The initial gateway is created and the sharing key used to attached to that gateway is contained in the status of the original gateway.  Any number of cluster gateways can be attached to the EPIC gateway using the sharing key


```yaml
- apiVersion: gateway.networking.k8s.io/v1alpha2
  kind: Gateway
  metadata:
    annotations:
      acnodal.io/epic-config: epic-gateway/uswest-gtwapi
      acnodal.io/epic-link: /api/epic/accounts/epictest/proxies/ff2ac5e8-beed-4181-96cb-244dbd104ae9
      kubectl.kubernetes.io/last-applied-configuration: |
        {"apiVersion":"gateway.networking.k8s.io/v1alpha2","kind":"Gateway","metadata":{"annotations":{},"name":"uswest-gtwapi","namespace":"demoapi"},"spec":{"gatewayClassName":"uswest-gtwapi","listeners":[{"allowedRoutes":{"namespaces":{"from":"All"}},"name":"gwapi","port":443,"protocol":"HTTPS"}]}}
    creationTimestamp: "2022-04-19T18:16:17Z"
    finalizers:
    - epic.acnodal.io/controller
    generation: 1
    name: uswest-gtwapi
    namespace: demoapi
    resourceVersion: "2543805"
    uid: ff2ac5e8-beed-4181-96cb-244dbd104ae9  <-- sharing key
  spec:
    gatewayClassName: uswest-gtwapi
    listeners:
    - allowedRoutes:
        namespaces:
          from: All
      name: gwapi
      port: 443
      protocol: HTTPS
  status:
    addresses:
    - type: IPAddress
      value: 72.52.101.1
    - type: Hostname
      value: uswest-gtwapi-demoapi-epictest-uswest.epick8sgw.net
    conditions:
    - lastTransitionTime: "2022-04-19T18:16:17Z"
      message: Announced to EPIC
      observedGeneration: 1
      reason: Valid
      status: "True"
      type: Ready
```


Above is the initial gateway to be shared, the sharing key is contained in  *metadata.uuid*

The uuid is added to the metadata annotation *acnodal.io/epic-sharing-key*
as per below.

```yaml
- apiVersion: gateway.networking.k8s.io/v1alpha2
  kind: Gateway
  metadata:
    annotations:
      acnodal.io/epic-config: epic-gateway/uswest-gtwapi
      acnodal.io/epic-link: /api/epic/accounts/epictest/proxies/ff2ac5e8-beed-4181-96cb-244dbd104ae9
      acnodal.io/epic-sharing-key: ff2ac5e8-beed-4181-96cb-244dbd104ae9
      kubectl.kubernetes.io/last-applied-configuration: |
        {"apiVersion":"gateway.networking.k8s.io/v1alpha2","kind":"Gateway","metadata":{"annotations":{"acnodal.io/epic-sharing-key":"ff2ac5e8-beed-4181-96cb-244dbd104ae9"},"name":"uswest-gtwapi","namespace":"demoapi"},"spec":{"gatewayClassName":"uswest-gtwapi","listeners":[{"allowedRoutes":{"namespaces":{"from":"All"}},"name":"gwapi","port":443,"protocol":"HTTPS"}]}}
    creationTimestamp: "2022-04-19T18:23:15Z"
    finalizers:
    - epic.acnodal.io/controller
    generation: 1
    name: uswest-gtwapi
    namespace: demoapi
    resourceVersion: "5256593"
    uid: afef5e7a-10c4-4659-b94d-69ff0d3460e0
  spec:
    gatewayClassName: uswest-gtwapi
    listeners:
    - allowedRoutes:
        namespaces:
          from: All
      name: gwapi
      port: 443
      protocol: HTTPS
  status:
    addresses:
    - type: IPAddress
      value: 72.52.101.1
    - type: Hostname
      value: uswest-gtwapi-demoapi-epictest-uswest.epick8sgw.net
    conditions:
    - lastTransitionTime: "2022-04-19T18:23:16Z"
      message: Announced to EPIC
      observedGeneration: 1
      reason: Valid
      status: "True"
      type: Ready
```

Both Gateways will share the same EPIC gateway configuration including IP Address and FQDN.  httpRoutes added to the gateway object in each cluster are merged by EPIC into a single route configuration.


The ```gwr``` resource will show the routes to both workload clusters.  The ```ec``` resource will also show the merged configuration.


## Getting more Information


Here's a more complex route that includes header matches and path matches:

```yaml
apiVersion: gateway.networking.k8s.io/v1alpha2
kind: HTTPRoute
metadata:
  name: apidevdemo
  namespace: demodevapi
spec:
  parentRefs:
  - group: gateway.networking.k8s.io
    kind: Gateway
    name: uswest-gtwapi
    namespace: demoapi
  rules:
  - backendRefs:
    - group: ""
      kind: Service
      name: epic-apisrv-v2
      port: 8080
      weight: 1
    matches:
    - headers:
      - name: mycustomheader
        type: Exact
        value: dev-v2

      path:
        type: PathPrefix
        value: /api
```

The syntax of Gateway Resources is defined in the k8s GatewayAPI. EPIC and the Gateway Controller are an implementation of this API. Further information can be found in the [official k8s documentation](https://gateway-api.sigs.k8s.io/).  Note that tcpRoute as well as a number of other capabilities supported are experimental alpha features.

