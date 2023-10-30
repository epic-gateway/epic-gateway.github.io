---
title: "Migrate an Ingress to a Gateway"
linkTitle: "Migrate an Ingress to a Gateway"
date:  2022-06-06
description: "How to migration from an Ingress to a Gateway"
---

The GatewayAPI resource is an alternative and replacement to Ingress resource.  The Gateway resource provides functionality not available in the Ingress resource and offers the opportunity to simplify Kubernetes application access.  The GatewayAPI provides a number of key benefits over the legacy Ingress/LoadBalancer model.

1. Expands the Kubernetes API functionality to enable API Gateways.  The Ingress API has very basic request routing functionality but lacks the key capabilities necessary in API gateway implementations such are header matching, URL rewrite and many others.  Due to this limitations, most Ingress implementations use the proprietary configuration model created by the Ingress developer.  The GatewayAPI offer the opportunity to move to a standard configuration model and syntax
2. Includes functionality to Automate Networking.  The ingress API was designed to be paired with a the loadBalancer functionality in the Service API.  This separation makes an Ingress incomplete without a LoadBalancer and/or other manual configuration.  The Cloud providers didn't follow this model, making the Ingress a separate function further confusing users.
3. Role Orientated.  The API is composed of API resources which model organizational roles that use and configure Kubernetes service networking.  This enables infrastructure and security engineers to define gateways that can be dynamically created by cluster users as they create and manage their applications.


**This use-case does not cover the infrastructure design differences between an Ingress infrastructure and a Gateway infrastructure.  It assumes that an existing, operational Ingress infrastructure is present and illustrates how to migration the Ingress resource to a Gateway Resource.** 


### The Ingress Resource
The following Ingress resources is a simple fanout example taken directly from the Kubernetes documentation.  It includes a host rule creating an initial filter based upon the URL and two prefix based paths backed by two different services.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: simple-fanout-example
spec:
  rules:
  - host: foo.bar.com
    http:
      paths:
      - path: /foo
        pathType: Prefix
        backend:
          service:
            name: service1
            port:
              number: 4200
      - path: /bar
        pathType: Prefix
        backend:
          service:
            name: service2
            port:
              number: 8080

```

### The Gateway Resource

The Gateway resources are similar but has some important differences. 

An Ingress is a predefined shared resource. How the resource is created depends of the environment and the specific Ingress implementation selected.    A Gateway resource is defined differently.   Gateways are created on demand,  the reference used to create a gateway is defined using a *gatewayClass*.  There can be many gatewayClasses all specifying different gateway configurations.  How gateway infrastructure configuration are defined is implementation specific.  In the EPIC implementation, a *gatewayClass* references a *gatewayClassConfig* which includes information used to create a Gateway in EPIC, and the gateway template, a the infrastructure blueprint for the Gateway that will be created.  


Unlike an Ingress, a Gateway does not exist until its created with a *gateway* resources that references the *gatewayclass*.  In the case of EPIC and other external gateway implementations, gateways are created on demand, and its possible to create as many gateways as required by applications in the cluster.  By default gateways are not shared among namespaces.

In our example we assume that that their is a *gatewayClass* called *example-gateway-class*.  The following creates a *gateway* resource.  Note that the listeners are created on demand, this is different to the Ingress where the IP addresses and listeners are predefined during Ingress installation.

```yaml

apiVersion: gateway.networking.k8s.io/v1alpha2
kind: Gateway
metadata:
  name: example-gateway
spec:
  gatewayClassName: example-gateway-class
  listeners:
  - name: http
    protocol: HTTP
    port: 80
```
```bash
$ kubectl get gtw
NAME              CLASS                   ADDRESS       READY   AGE
example-gateway   example-gateway-class   72.52.101.1   True    47d
```
Creating the *gateway* object instantiates the gateway, configuring the downstream listener, allocating IP addresses and optionally DNS names.  The Gateway is now ready and routes can be added.  The Gateway object is seperate from the Route object because the persistency of gateways and routes are probably different.  A Gateway would be created so an application can be accessed, the structure of the application is defined in routes, these will probably change over time as new versions are tested and deployed.

The following example creates is the *httpRoute* object that provides the same functionality as the *ingress* object above.

```yaml
apiVersion: gateway.networking.k8s.io/v1alpha2
kind: HTTPRoute
metadata:
  name: simple-fanout-example
spec:
  parentRefs:
  - name: example-gateway
  hostnames:
  - "foo.bar.com"
  rules:
  - matches:
    - path:
        type: PathPrefix
        value: /foo
    backendRefs:
    - name: service1
      port: 4200
  - matches:
    - path:
      type: Prefix
      value: /bar
    backendRefs:
    - name: service2
      port: 8080

```

The *httpRoute* resource is very similar to the *ingress* resource in this example, however the value of the *httpRoute* resource is the ability to add additional functionality.  Extending the example above to add a test version of service2 at the same url route accessed via a custom header "test-match: dev1" match would result in the following configuration



```yaml
apiVersion: gateway.networking.k8s.io/v1alpha2
kind: HTTPRoute
metadata:
  name: simple-fanout-example
spec:
  parentRefs:
  - name: example-gateway
  hostnames:
  - "foo.bar.com"
  rules:
  - matches:
    - path:
        type: PathPrefix
        value: /foo
    backendRefs:
    - name: service1
      port: 4200
  - matches:
    - path:
      type: Prefix
      value: /bar
    backendRefs:
    - name: service2
      port: 8080
  - matches: 
    - path:
      type: Prefix
      value: /bar
    - name: test-match
      type: Exact
      value: dev1
    backendRefs:
    - name: service2-test
      port: 8080
```

### More Information
[Additional information on using EPIC and its Gateway Controller]({{< ref "/gateway_service/user_manual/gateway-controller/" >}})

[Information on the GatewayAPI httpRoute version used in this example](https://gateway-api.sigs.k8s.io/v1alpha2/api-types/httproute/)


