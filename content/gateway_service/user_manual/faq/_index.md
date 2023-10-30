---
title: "Frequently Asked Questions"
linkTitle: "Frequently Asked Questions"
weight: 50
description: >
 
---


Q.  What's the difference between Gateways, Ingresses and LoadBalancers?

A.  Gateways are an alternative to the Ingress and Loadbalancer combination.  Although Cloud providers have mapped Ingresses to ALB's and LoadBalancers to NLB's this was not the original intent of the Kubernetes developers.  These two resources were supposed to be used together: Loadbalancer controlling the access from outside the cluster and Ingress providing request distribution functionality inside the cluster where capabilities that are not provided by cluster networking do not have sufficent functionality.  Gateways provide the combined functionality and address limitations (and violations) of the LoadBalancer/Ingress model.

Q. Does the Gateway API and EPIC implement an API Gateway?

A.  Yes.  A Gateway created by the Gateway API can provide API gateway functionality, distributing traffic based upon complex routing rules.

Q. If I have a Gateway do I need an Ingress?

A.  No.  A Gateway can replace an Ingress.  Where the Gateway is outside of the cluster, the vendor needs to provide a mechanism that provides connectivity directly to each of the PODs so that complete functionality can be retained.

Q. Can in use a Gateway with a Service Mesh instead of the Service Mesh Ingress?

A.  Yes.  A Gateway can replace the Ingress in most service mesh.  In the case of Istio, follow the instructions to use the built-in istio-gateway's GatewayAPI implementation but apply it to EPIC.  There is a template specifically for this configuration.  The current template supports tracing but does not use TLS between the Gateway and sidecars, this will be resolved in the near future.  Also, the popular tool Kaili does not recognize a Gateway therefore the source is shown as unknown in the topology map. This Kiali limitation is not unique to EPIC.  A template for LinkerD is also under development.  Using EPIC you can make service mesh access multi-cloud.

Q. Does EPIC use kubeproxy or any other in-cluster Loadbalancer?

A.  No.  In combination with the Controller, EPIC Gateways direct request to the POD endpoints.  Our eBPF GUE transport encapsulates traffic so the node can send the traffic directly to the POD endpoint over the CNI network.

Q.  How does EPIC get traffic to the Service Endpoints in the Cluster?

A.  The eBPF transport encapsulates traffic and the control plane creates state so traffic is sent to POD exactly the same way that an incluster Ingress uses.

Q. What is the architecture of the EPIC Gateway-as-a-Service System?

A.  EPIC is a built on a purpose-built Kubernetes Cluster.  Microservice applications require microservice gateways to provide isolation, flexibility and scale.

Q. Where can I learn more about the Gateway API?

A.  It's in active development by the Kubernetes Network SIG.  Take a look at [Kubernetes Gateway API](https://gateway-api.sigs.k8s.io/).

Q. Are there standards or conformance tests for Gateways?

A. The Gateway API is controlled by Kubernetes and Kubernetes API's have conformance tests. The k8s Gateway Controller  API passes all conformance tests.
