---
title: "Http Routes"
linkTitle: "Configuring httpRoute"
date:  2022-06-02
description: "Quick tips on configuring HTTP Routes with the Gateway"
---

### Creating httpRoutes

Routes and in this case httpRoutes are the key k8s resource that connect services to gateways.  They are used to construct the application or application backend and are where the common API gateway functionality is configured.


### Simple httpRoute

The Getting started guide uses the simplest possible httpRoute.

```yaml
apiVersion: gateway.networking.k8s.io/v1alpha2
kind: HTTPRoute
metadata:
  name: uswest-demows
  namespace: gtw-test
spec:
  parentRefs:
  - name: uswest-demows
    namespace: gtw-test
  rules:
  - backendRefs:
    - name: epic-demows
      namespace: gtw-test
      port: 8080
```


The parentRefs define the gateway *uswest-demows* to be used.  The backendRefs define the name of the service *epic-demows* and the port exposed by the service.  If there are multiple POD replica referenced by the service, EPIC will load balancer over the pod replica.


### Traffic Splitting
The traffic distribution between different backends can be controlled by specifying weights.  This is a useful for splitting traffic during rollouts, canarying changes or for emergences.


```yaml
apiVersion: gateway.networking.k8s.io/v1alpha2
kind: HTTPRoute
metadata:
  name: uswest-demows
  namespace: gtw-test
spec:
  parentRefs:
  - name: uswest-demows
    namespace: gtw-test
  rules:
  - backendRefs:
    - name: epic-demows
      namespace: gtw-test
      port: 8080
      weight: 90
    - name: epic-demows-v2
      port: 8080
      weight: 10
```

In the example above, there is an additional service named epic-demows-v2 added to the backendRefs.  Weights are added to both backendRefs so the original service *epic-demows* receives 90% of the requests and the 10%.  Weights can be set to 0 resulting in no traffic being distributed to that service, useful after migrating to a new version as leaving the configuration in place makes backing out as simple as changing weights


### Host Matches

Multiple applications can share a single gateway. Each application has a *httpRoute* resource that includes *hostname* 


```yaml
apiVersion: gateway.networking.k8s.io/v1alpha2
kind: HTTPRoute
metadata:
  name: uswest-demows
  namespace: gtw-test
spec:
  parentRefs:
  - name: uswest-demows
    namespace: gtw-test
  hostname:
  - "epicv2.acnodal.io"
  rules:
  - backendRefs:
    - name: epic-demows
      namespace: gtw-test
      port: 8080
```

In this case the hostname *epicv2.acnodal.io" will be matched before any other matching within the httpRoute takes place. Creating a new DNS hostname pointing to the gateway IP address is combined with another httpRoute to enable multiple applications to share a single gateway.


### Path Matches

URL paths are often used as a selector to backends, generally referred to as URL routes or routing.  


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
      name: epic-apisrv
      port: 8080
      weight: 1
    matches:
      path:
        type: PathPrefix
        value: /api
```

The match added to rules will forward any request that is prefixed with */api* to the service *epic-apisrv*  Its important to remember than the URL must be present in the target POD, this is not URL rewriting, simply matching so the request is passed through as it is received.  Other match types include Exact and RegularExpression (RegularExpression is not currently supported)


### Header Matches
Another way to direct requests is to match http headers.  Headers can be added by browsers or clients, a simple use is testing.  You can add an addon module to your browser and set custom http headers to match in httpRoutes

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

The header match added exactly matches the http header *mycustomheader* with a value of *dev-v2*.  Requests to the path /api with this custom header will be forwarded to the Service *epic-apisrv-v2*  Header matches can also be RegularExpression (supported)


### More Information

Configuring the Gateway Controller is covered in detail in the [Gateway Controller]({{< ref "/gateway_service/user_manual/gateway-controller" >}}) and [GatewayAPI](https://gateway-api.sigs.k8s.io/) documentation.  

