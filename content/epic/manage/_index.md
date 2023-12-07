---
title: "Configuration & Management"
linkTitle: "Management"
weight: 20
description: >
 Operating a Gateway Cluster
---


Once operational, EPIC is managed using k8s objects.  These objects are located in the `epic` namespace and each of the user namespaces.


## Service Prefixes
The ```serviceprefix``` object contains the IP address ranges used to create gateways.  They are referenced using the label ```epic.acnodal.io/owning-serviceprefix``` in the ```lbsg``` object in the user namespace.  The IPAM address allocator will select an address from this range.  The ansible installation scripts create two ```serviceprefix`` objects, one for IPv4 and another for IPv6.  EPIC support allocating IPv6 addresses as public addresses.


```yaml
apiVersion: epic.acnodal.io/v1
kind: ServicePrefix
metadata:
  annotations:
    kubectl.kubernetes.io/last-applied-configuration: |
      {"apiVersion":"epic.acnodal.io/v1","kind":"ServicePrefix","metadata":{"annotations":{},"labels":{"app.kubernetes.io/component":"serviceprefix","app.kubernetes.io/part-of":"epic"},"name":"default","namespace":"epic"},"spec":{"public-pool":{"aggregation":"/32","pool":"192.168.77.2-192.168.77.77","subnet":"192.168.77.0/24"}}}
  creationTimestamp: "2023-11-29T13:41:44Z"
  finalizers:
  - epic.acnodal.io/controller
  generation: 1
  labels:
    app.kubernetes.io/component: serviceprefix
    app.kubernetes.io/part-of: epic
  name: default
  namespace: epic
  resourceVersion: "1243"
  uid: bf3ba212-60c0-422a-b5f0-3af048df3c95
spec:
  public-pool:
    aggregation: /32
    multus-bridge: multus0
    pool: 192.168.77.2-192.168.77.77
    subnet: 192.168.77.0/24
```


The following fields configure the IPAM address allocator:


| Parameter | Type               | Description |
|-----------|--------------------|-------------|
| subnet    | IPv4 or IPv6 CIDR  | The subnet that contains all of the pool addresses. |
| pool      | IPv4 or IPv6 range | The specific range of addresses that will be allocated. Can be expressed as a CIDR or range of addresses.|
| aggregation | "default or subnet mask "/8"-"128" | The aggregator changes the address mask of the allocated address from the subnet’s mask to the specified mask.|



{{% alert title="Aggregation" color="info" %}}

The purpose of aggregation is to control how routes are advertized. This provides significant flexibility in most cases /32 for IPv4 and /128 for IPv6 are the correct values. This results in host routes being advertised to upstream routers by EPIC.  In a multinode EPIC cluster a route will be advertized from each node where a Envoy instance of a gateway is created.  When a /32 or /128 route is used, traffic is only distributed to hosts were gateways exist.  However more complex routing structures are possible with this feature. 

{{% /alert %}}


## User Namespaces
Gateways are created in user namespaces.  Each user namespace contains a number of pods and configuration files that enable the creation of gateways.  The ansible installation scripts create a user namespace called *epic-root* referred to as *root* buy the gateway controller on the k8s cluster or Linux host.

### Creating a User Namespace
A simple CLI tool is provided to add additional user namespaces that populates the namespace with the correct pods and configuration files.  The CLI also allows API users to be added for the specific user namespace.  

THe following creates a new user namespace called *frontend* with API users *devops1*


```bash
$ epicctl create user-namespace frontend nil nil
```

{{% alert title="Registry information" color="info" %}}

The registry information is not required.  The purpose of the registry information to to allow users to specify different Envoy images from private registry.  A default Envoy POD is used with this is not present.  This is configured in the ```epic``` object in the epic namespace

{{% /alert %}}

### Creating a API User Account
The CLI tool is also used to create API User accounts.  
```bash 
epicctl create api-user devops1 frontend
New Password:  
Retype New Password:  
api-user devops1 in user-namespace frontend created
```
An ```account``` object will be created in the user namespace.  There is one important configuration element in this object.  Each account is limited to creating two Gateways.  Edit the *proxyLimit* to increase the number of Gateways that can be created using the API User Account


## Gateway Templates
Gateway templates object called ```lbsg``` located in the user namespace are used to create gateways.  These gateway configuration ensure consistency for each gateway created, allow each user namespace to have unique and different gateway configurations. The ansible scripts create a sample definition on the ansible host and apply it in the epic-root namespace.  The files used to create this template are located in the ansible repo (/ansible-playbook/roles/epic/template) and provide a useful getting started for creating your templates.


### Gateway Template Structure

The template consists of the following sections.


```epic.acnodal.io/owning-serviceprefix```  This is the name of the IPAM Service Prefix Object

```can-be-shared```   A Gateway can be shared among multiple target k8s clusters or Linux hosts, this enables multicloud gateway sharing

```dnsName```  EPIC can use KubeDNS to distribute DNS names to DNS servers.  THis generates the DNS name for the gateway and can also be used to publish the DNS name.  KubeDNS is not installed by default but is available in the repo.  It is a modified version.

```envoy-replica-count```  This specifies the number of Envoy instances for this gateway.  It can be used in conjunction with an autoscaler to increase the number of Envoy pods based upon demand with the autoscaler updating this parameter is the ```gwp``` object for the desired gateway

```envoy-template```  This creates  the envoy configuration passed to the Envoy POD via Marin3r using XDS. There is signficant use of GOLANG templates.  In some cases the GOLANG templates implement the configuration derived from the Gateway API in the workload cluster.   Some of the fields are simply deriving information.  Refer to the (Envoy documentation)[https://www.envoyproxy.io/docs/envoy/v1.23.12/]  

{{% alert title="Tip" color="info" %}}
Create a gateway in the default epic-root namespace and inspect the ```gwp``` object and the associated ```ec``` object before making changes to the default template.  The ```ec``` object have the GOLANG template fields completed This way you can avoid making breaking changes to templates.
{{% /alert %}}

{{% alert title="endpoints section" color="warning" %}}
The endpoint section implements the routing section of the GatewayAPI.  If this section if modified incorrectly it will cause the gateway to operate incorrectly.
{{% /alert %}}



```yaml
apiVersion: epic.acnodal.io/v1
kind: LBServiceGroup
metadata:
  labels:
    app.kubernetes.io/component: lbservicegroup
    app.kubernetes.io/part-of: epic
    epic.acnodal.io/owning-account: root
    epic.acnodal.io/owning-serviceprefix: default
  name: gatewayhttp
  namespace: epic-root
spec:
  can-be-shared: true
  endpoint-template:
    dnsName: '{{.ClusterServiceName}}-{{.ClusterServiceNS}}-{{.Account}}.example.net'
    recordTTL: 180
  envoy-replica-count: 1
  envoy-template:
    envoyAPI: v3
    envoyResources:
      clusters:
      - name: SET_BY_EPIC
        value: |
          name: {{.ClusterName}}
          connect_timeout: 2s
          type: EDS
          eds_cluster_config:
            eds_config:
              resource_api_version: V3
              api_config_source:
                api_type: GRPC
                transport_api_version: V3
                grpc_services:
                - envoy_grpc:
                    cluster_name: eds-server
          lb_policy: ROUND_ROBIN
          health_checks:
          - interval: 5s
            timeout: 5s
            no_traffic_interval: 5s
            unhealthy_threshold: 3
            healthy_threshold: 3
            tcp_health_check: {}
      endpoints:
      - name: SET_BY_EPIC
        value: |
          cluster_name: {{.ClusterName}}
          {{- if .Endpoints}}
          endpoints:
          - lb_endpoints:
          {{- range .Endpoints}}
            - endpoint:
                address:
                  socket_address:
                    address: {{.Spec.Address}}
                    protocol: {{.Spec.Port.Protocol | ToUpper}}
                    port_value: {{.Spec.Port.Port}}
          {{- end}}
          {{- end}}
      listeners:
      - name: SET_BY_EPIC
        value: |
          name: {{.PortName}}
          address:
            socket_address:
              address: "::"
              ipv4_compat: yes
              port_value: {{.Port}}
              protocol: {{.Protocol | ToUpper}}
          filter_chains:
          - filters:

            {{- with (.Routes | TCPRoutes) }}
            - name: envoy.filters.network.tcp_proxy
              typed_config:
                "@type": type.googleapis.com/envoy.extensions.filters.network.tcp_proxy.v3.TcpProxy
                stat_prefix: destination
                weighted_clusters:
                  clusters:
                {{- range . }}
                {{- range .Rules }}
                  {{- range .BackendRefs}}
                  - name: {{ .Name }}
                    weight: {{ .Weight }}
                  {{- end }}
                {{- end }}
                {{- end }}
            {{- end }}{{- /* with */}}

            {{- with (.Routes | HTTPRoutes) }}
            - name: envoy.http_connection_manager
              typed_config:
                "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
                stat_prefix: {{ $.ServiceName }}
                server_name: epic-gateway
                add_user_agent: true
                use_remote_address: true
                via: epic-gateway
                route_config:
                  name: local_route
                  virtual_hosts:
                  {{- range $spec := . }}
                  {{- range .Hostnames | HostnameOrDefault }}
                  - name: "{{ . }}"
                    domains:
                    - "{{ . }}"
                    {{- if $spec.Rules}}
                    routes:
                    {{- range $spec.Rules }}
                    -
                      {{- if .Matches }}
                      match:
                        {{- $match := (index .Matches 0) }}
                        {{- if $match.Path.Type | PathTypePathPrefix }}
                        prefix: "{{ $match.Path.Value }}"
                        {{- end }}
                        {{- if $match.Path.Type | PathTypeExact }}
                        path: "{{ $match.Path.Value }}"
                        {{- end }}
                        {{- if $match.Headers }}
                        headers:
                        {{- range $match.Headers }}
                        - name: "{{ .Name }}"
                          string_match:
                          {{- if .Type | HeaderTypeRegex }}
                            safe_regex:
                              google_re2: {}
                              regex: "{{ .Value }}"
                          {{- else }}
                            exact: "{{ .Value }}"
                          {{- end }}
                        {{- end }}
                        {{- end }}
                      {{- end }}{{- /* if .Matches */}}

                      {{- if . | RuleRedirect }}
                      redirect:
                      {{- else }}
                      route:
                      {{- end }}

                      {{- if .BackendRefs}}
                        weighted_clusters:
                          clusters:
                          {{- range .BackendRefs}}
                          - name: {{ .Name }}
                            weight: {{ .Weight }}
                          {{- end }}
                          total_weight: {{ .BackendRefs | RefWeightsTotal }}
                      {{- end }}

                      {{- range .Filters }}
                        {{- if .URLRewrite }}
                        {{- if .URLRewrite.Hostname }}
                        host_rewrite_literal: "{{ .URLRewrite.Hostname }}"
                        {{- end }}
                        {{- if .URLRewrite.Path }}
                        {{- if .URLRewrite.Path.ReplacePrefixMatch }}
                        prefix_rewrite: "{{ .URLRewrite.Path.ReplacePrefixMatch }}"
                        {{- end }}
                        {{- if .URLRewrite.Path.ReplaceFullPath }}
                        regex_rewrite:
                          pattern:
                            google_re2: {}
                            regex: "^.*$"
                          substitution: "{{- .URLRewrite.Path.ReplaceFullPath }}"
                        {{- end }}{{- /* if .URLRewrite.Path.ReplaceFullPath */}}
                        {{- end }}{{- /* .URLRewrite.Path */}}
                        {{- end }}{{- /* .URLRewrite */}}

                        {{- if .RequestRedirect }}
                        {{- if .RequestRedirect.Path }}
                        {{- if .RequestRedirect.Path.ReplaceFullPath }}
                        path_redirect: {{ .RequestRedirect.Path.ReplaceFullPath }}
                        {{- end }}
                        {{- if .RequestRedirect.Path.ReplacePrefixMatch }}
                        prefix_rewrite: {{ .RequestRedirect.Path.ReplacePrefixMatch }}
                        {{- end }}
                        {{- end }}
                        {{- if .RequestRedirect.Scheme }}
                        scheme_redirect: {{ .RequestRedirect.Scheme }}
                        {{- end }}
                        {{- if .RequestRedirect.StatusCode }}
                        response_code: {{ .RequestRedirect.StatusCode | StatusToResponse }}
                        {{- end }}
                        {{- if .RequestRedirect.Port }}
                        port_redirect: {{ .RequestRedirect.Port }}
                        {{- end }}
                        {{- if .RequestRedirect.Hostname }}
                        host_redirect: {{ .RequestRedirect.Hostname }}
                        {{- end }}
                        {{- end }}

                        {{- if .RequestHeaderModifier }}
                        {{- if (or .RequestHeaderModifier.Set .RequestHeaderModifier.Add) }}
                      request_headers_to_add:
                        {{- range .RequestHeaderModifier.Set }}
                      - header:
                          key: {{ .Name }}
                          value: {{ .Value }}
                        append: no
                        {{- end }}
                        {{- end }}
                        {{- if .RequestHeaderModifier.Add }}
                        {{- range .RequestHeaderModifier.Add }}
                      - header:
                          key: {{ .Name }}
                          value: {{ .Value }}
                        append: yes
                        {{- end }}
                        {{- end }}
                        {{- if .RequestHeaderModifier.Remove }}
                      request_headers_to_remove:
                        {{- range .RequestHeaderModifier.Remove }}
                      - {{ . }}
                        {{- end }}
                        {{- end }}

                        {{- end }}{{- /* if .RequestHeaderModifier */}}
                      {{- end }}{{- /* range .Filters */}}

                    {{- end }}{{- /* range .Rules */}}
                    {{- end }}{{- /* if .Rules */}}
                  {{- end }}{{- /* range .Hostnames | HostnameOrDefault */}}
                  {{- end }}{{- /* range $httpRoutes */}}

                http_filters:
                - name: envoy.filters.http.bandwidth_limit
                  typed_config:
                    "@type": type.googleapis.com/envoy.extensions.filters.http.bandwidth_limit.v3.BandwidthLimit
                    stat_prefix: bandwidth_limiter_default
                    enable_mode: REQUEST_AND_RESPONSE
                    limit_kbps: 1000
                    fill_interval: 0.1s
                - name: envoy.filters.http.router
                  typed_config:
                    "@type": type.googleapis.com/envoy.extensions.filters.http.router.v3.Router
            {{ end }}{{- /* with */}}
    nodeID: SET_BY_EPIC
    serialization: yaml
```

## Managing Gateways

{{% alert title="Gateway Resource Structure" color="info" %}}
The logical structure of resources in the gateway is very similar to the structure in a k8s workload cluster.

| Gateway | Workload Cluster | Description |
|---------|------------------|-------------|
| gwp     | gtw              | Gateway Resource |
| gwr     | httpRoute/tcpRoute | Route Resource |
| gwes    | ep  | Endpoint Resource |

{{% /alert %}}

EPIC creates a number of component that result in the gateway creation.  A gateway consists of a ```deployment``` and a ```gwp``` gateway object.  The deployment is created dynamically and does not contain any user configurable objects.

The ```gwp``` object is created from the ```lbsg``` template and contains the gateway configuration.  The ```gwp``` object can be modified resulting in dynamic configuration of the gateway.  (the envoy configuration is verified and will not be applied if it fails, more on that later).


```yaml
$ kubectl get gwp
root@epic-gateway:~# k get gwp -o yaml
apiVersion: v1
items:
- apiVersion: epic.acnodal.io/v1
  kind: GWProxy
  metadata:
    annotations:
      nudge: 4d38a08610261432
    creationTimestamp: "2023-11-29T20:58:33Z"
    finalizers:
    - epic.acnodal.io/controller
    - epic-root.proxy.eds.epic.acnodal.io
    - epic-gateway.gwp.node-agent.epic.acnodal.io
    generation: 12
    labels:
      epic.acnodal.io/owning-account: root
      epic.acnodal.io/owning-lbservicegroup: gatewayhttp
      epic.acnodal.io/owning-serviceprefix: default
    name: 4a5fb5b6-b53d-4513-b7a3-44f8bd919cac
    namespace: epic-root
    resourceVersion: "394437"
    uid: 50744735-dd3d-4576-b55c-41151d38e3eb
  spec:
    clientRef:
      clusterID: gwdev
      name: devtest
      namespace: default
      uid: 4a5fb5b6-b53d-4513-b7a3-44f8bd919cac
    display-name: devtest
    endpoints:
    - dnsName: devtest-default-root.example.net
      recordTTL: 180
      recordType: A
      targets:
      - 192.168.77.2
    envoy-replica-count: 2
    envoy-template:
      envoyAPI: v3
      envoyResources:
        clusters:
        - name: SET_BY_EPIC
          value: "name: {{.ClusterName}}\nconnect_timeout: 2s\ntype: EDS\neds_cluster_config:\n
            \ eds_config:\n    resource_api_version: V3\n    api_config_source:\n
            \     api_type: GRPC\n      transport_api_version: V3\n      grpc_services:\n
            \     - envoy_grpc:\n          cluster_name: eds-server\nlb_policy: MAGLEV\nhealth_checks:\n-
            interval: 5s\n  timeout: 5s\n  no_traffic_interval: 3s \n  unhealthy_threshold:
            3\n  healthy_threshold: 3\n  tcp_health_check: {}\n"
        endpoints:
        - name: SET_BY_EPIC
          value: |
            cluster_name: {{.ClusterName}}
            {{- if .Endpoints}}
            endpoints:
            - lb_endpoints:
            {{- range .Endpoints}}
              - endpoint:
                  address:
                    socket_address:
                      address: {{.Spec.Address}}
                      protocol: {{.Spec.Port.Protocol | ToUpper}}
                      port_value: {{.Spec.Port.Port}}
            {{- end}}
            {{- end}}
        listeners:
        - name: SET_BY_EPIC
          value: |
            name: {{.PortName}}
            address:
              socket_address:
                address: "::"
                ipv4_compat: yes
                port_value: {{.Port}}
                protocol: {{.Protocol | ToUpper}}
            filter_chains:
            - filters:

              {{- with (.Routes | TCPRoutes) }}
              - name: envoy.filters.network.tcp_proxy
                typed_config:
                  "@type": type.googleapis.com/envoy.extensions.filters.network.tcp_proxy.v3.TcpProxy
                  stat_prefix: destination
                  weighted_clusters:
                    clusters:
                  {{- range . }}
                  {{- range .Rules }}
                    {{- range .BackendRefs}}
                    - name: {{ .Name }}
                      weight: {{ .Weight }}
                    {{- end }}
                  {{- end }}
                  {{- end }}
              {{- end }}{{- /* with */}}

              {{- with (.Routes | HTTPRoutes) }}
              - name: envoy.http_connection_manager
                typed_config:
                  "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
                  stat_prefix: {{ $.ServiceName }}
                  server_name: epic-gateway
                  add_user_agent: true
                  use_remote_address: true
                  via: my-epic-gateway
                  route_config:
                    name: local_route
                    virtual_hosts:
                    {{- range $spec := . }}
                    {{- range .Hostnames | HostnameOrDefault }}
                    - name: "{{ . }}"
                      domains:
                      - "{{ . }}"
                      {{- if $spec.Rules}}
                      routes:
                      {{- range $spec.Rules }}
                      -
                        {{- if .Matches }}
                        match:
                          {{- $match := (index .Matches 0) }}
                          {{- if $match.Path.Type | PathTypePathPrefix }}
                          prefix: "{{ $match.Path.Value }}"
                          {{- end }}
                          {{- if $match.Path.Type | PathTypeExact }}
                          path: "{{ $match.Path.Value }}"
                          {{- end }}
                          {{- if $match.Headers }}
                          headers:
                          {{- range $match.Headers }}
                          - name: "{{ .Name }}"
                            string_match:
                            {{- if .Type | HeaderTypeRegex }}
                              safe_regex:
                                google_re2: {}
                                regex: "{{ .Value }}"
                            {{- else }}
                              exact: "{{ .Value }}"
                            {{- end }}
                          {{- end }}
                          {{- end }}
                        {{- end }}{{- /* if .Matches */}}

                        {{- if . | RuleRedirect }}
                        redirect:
                        {{- else }}
                        route:
                        {{- end }}

                        {{- if .BackendRefs}}
                          weighted_clusters:
                            clusters:
                            {{- range .BackendRefs}}
                            - name: {{ .Name }}
                              weight: {{ .Weight }}
                            {{- end }}
                            total_weight: {{ .BackendRefs | RefWeightsTotal }}
                        {{- end }}

                        {{- range .Filters }}
                          {{- if .URLRewrite }}
                          {{- if .URLRewrite.Hostname }}
                          host_rewrite_literal: "{{ .URLRewrite.Hostname }}"
                          {{- end }}
                          {{- if .URLRewrite.Path }}
                          {{- if .URLRewrite.Path.ReplacePrefixMatch }}
                          prefix_rewrite: "{{ .URLRewrite.Path.ReplacePrefixMatch }}"
                          {{- end }}
                          {{- if .URLRewrite.Path.ReplaceFullPath }}
                          regex_rewrite:
                            pattern:
                              google_re2: {}
                              regex: "^.*$"
                            substitution: "{{- .URLRewrite.Path.ReplaceFullPath }}"
                          {{- end }}{{- /* if .URLRewrite.Path.ReplaceFullPath */}}
                          {{- end }}{{- /* .URLRewrite.Path */}}
                          {{- end }}{{- /* .URLRewrite */}}

                          {{- if .RequestRedirect }}
                          {{- if .RequestRedirect.Path }}
                          {{- if .RequestRedirect.Path.ReplaceFullPath }}
                          path_redirect: {{ .RequestRedirect.Path.ReplaceFullPath }}
                          {{- end }}
                          {{- if .RequestRedirect.Path.ReplacePrefixMatch }}
                          prefix_rewrite: {{ .RequestRedirect.Path.ReplacePrefixMatch }}
                          {{- end }}
                          {{- end }}
                          {{- if .RequestRedirect.Scheme }}
                          scheme_redirect: {{ .RequestRedirect.Scheme }}
                          {{- end }}
                          {{- if .RequestRedirect.StatusCode }}
                          response_code: {{ .RequestRedirect.StatusCode | StatusToResponse }}
                          {{- end }}
                          {{- if .RequestRedirect.Port }}
                          port_redirect: {{ .RequestRedirect.Port }}
                          {{- end }}
                          {{- if .RequestRedirect.Hostname }}
                          host_redirect: {{ .RequestRedirect.Hostname }}
                          {{- end }}
                          {{- end }}

                          {{- if .RequestHeaderModifier }}
                          {{- if (or .RequestHeaderModifier.Set .RequestHeaderModifier.Add) }}
                        request_headers_to_add:
                          {{- range .RequestHeaderModifier.Set }}
                        - header:
                            key: {{ .Name }}
                            value: {{ .Value }}
                          append: no
                          {{- end }}
                          {{- end }}
                          {{- if .RequestHeaderModifier.Add }}
                          {{- range .RequestHeaderModifier.Add }}
                        - header:
                            key: {{ .Name }}
                            value: {{ .Value }}
                          append: yes
                          {{- end }}
                          {{- end }}
                          {{- if .RequestHeaderModifier.Remove }}
                        request_headers_to_remove:
                          {{- range .RequestHeaderModifier.Remove }}
                        - {{ . }}
                          {{- end }}
                          {{- end }}

                          {{- end }}{{- /* if .RequestHeaderModifier */}}
                        {{- end }}{{- /* range .Filters */}}

                      {{- end }}{{- /* range .Rules */}}
                      {{- end }}{{- /* if .Rules */}}
                    {{- end }}{{- /* range .Hostnames | HostnameOrDefault */}}
                    {{- end }}{{- /* range $httpRoutes */}}

                  http_filters:
                  - name: envoy.filters.http.bandwidth_limit
                    typed_config:
                      "@type": type.googleapis.com/envoy.extensions.filters.http.bandwidth_limit.v3.BandwidthLimit
                      stat_prefix: bandwidth_limiter_default
                      enable_mode: REQUEST_AND_RESPONSE
                      limit_kbps: 1000
                      fill_interval: 0.1s
                  - name: envoy.filters.http.router
                    typed_config:
                      "@type": type.googleapis.com/envoy.extensions.filters.http.router.v3.Router
              {{ end }}{{- /* with */}}
      nodeID: SET_BY_EPIC
      serialization: yaml
    gateway:
      gatewayClassName: gwdev-http4
      listeners:
      - allowedRoutes:
          namespaces:
            from: Same
        name: gwdev-web
        port: 80
        protocol: HTTP
    gue-tunnel-endpoints:
      192.168.121.104:
        epic-endpoints:
          192.168.121.184:
            epic-address: 192.168.121.184
            epic-port:
              appProtocol: gue
              port: 6080
              protocol: UDP
            tunnel-id: 1
    proxy-if-info:
      marin3r-envoydeployment-4a5fb5b6-b53d-4513-b7a3-44f8bd919ck8gp6:
        epic-node-address: 192.168.121.184
        epic-port:
          appProtocol: gue
          port: 6080
          protocol: UDP
        index: 28
        name: veth8be647bc
      marin3r-envoydeployment-4a5fb5b6-b53d-4513-b7a3-44f8bd919cx7g8z:
        epic-node-address: 192.168.121.184
        epic-port:
          appProtocol: gue
          port: 6080
          protocol: UDP
        index: 26
        name: vethc3cf3503
    public-address: 192.168.77.2
    public-ports:
    - name: gwdev-web
      port: 80
      protocol: TCP
      targetPort: 0
    tunnel-key: UGlAVddTslVy0wZVqsM+JQ==
kind: List
metadata:
  resourceVersion: ""
  selfLink: ""

```

The name of the Gateway is dynamically generated and the summary information provides target cluster, ip address, template and IPAM information.

In addition to the configuration, the ```gwp``` object includes useful debugging information.  It includes information transferred from the client cluster and displays the nodes that are currently configured to receive traffic via the GUI tunnels.



The routes configured in the workload cluster are reflected in the gateway and can be inspected in the ```gwr``` resource.


```yaml
$ kubectl get gwr -o yaml
apiVersion: v1
items:
- apiVersion: epic.acnodal.io/v1
  kind: GWRoute
  metadata:
    creationTimestamp: "2023-11-29T20:58:34Z"
    finalizers:
    - epic.acnodal.io/controller
    - epic-root.rt.eds.epic.acnodal.io
    generation: 1
    labels:
      epic.acnodal.io/owning-account: root
    name: 49c334ac-db7b-41fc-8d32-1dd55c2d6ff8
    namespace: epic-root
    resourceVersion: "41243"
    uid: f9217deb-5d46-45ff-9097-5444313798fc
  spec:
    clientRef:
      clusterID: gwdev
      name: devtest-1
      namespace: default
      uid: 49c334ac-db7b-41fc-8d32-1dd55c2d6ff8
    http:
      parentRefs:
      - group: gateway.networking.k8s.io
        kind: Gateway
        name: 4a5fb5b6-b53d-4513-b7a3-44f8bd919cac
      rules:
      - backendRefs:
        - group: ""
          kind: Service
          name: 3dbc2265-3ec5-4bdf-82e1-86514d7f8321
          port: 8080
          weight: 1
        matches:
        - path:
            type: PathPrefix
            value: /
kind: List
metadata:
  resourceVersion: ""
  selfLink: ""

```



The workload cluster creates endpoints for each pod that is exposed, these endpoints are transferred to EPIC to populate the Envoy configuration with endpoint addresses.  These endpoints are sorted in the ```gwes``` object.  In addition to providing Envoy with the endpoint information, EPIC also stores target cluster information to make operation visible and easily correlatable.  (there is a graphical display in the Gateway-as-Service system)

```yaml
apiVersion: epic.acnodal.io/v1
kind: GWEndpointSlice
metadata:
  annotations:
    nudge: 3a36fc49d4ffd9b6
  creationTimestamp: "2023-11-29T20:58:33Z"
  finalizers:
  - epic-root.slice.eds.epic.acnodal.io
  - epic.acnodal.io/controller
  generation: 2
  labels:
    epic.acnodal.io/owning-account: root
  name: 1558c353-17fa-4aae-ba60-04914c5d0c3a
  namespace: epic-root
  resourceVersion: "41285"
  uid: be6a4264-a0f3-45b4-b7b1-e4a4947eb83c
spec:
  addressType: IPv4
  apiVersion: discovery.k8s.io/v1
  clientRef:
    clusterID: gwdev
    name: devtest-5bs4w
    namespace: default
    uid: 1558c353-17fa-4aae-ba60-04914c5d0c3a
  endpoints:
  - addresses:
    - 172.24.0.9
    conditions:
      ready: true
      serving: true
      terminating: false
    nodeName: epic-client
    targetRef:
      kind: Pod
      name: devtest-67f584c8c5-mj6cd
      namespace: default
      resourceVersion: "28262"
      uid: 04e37ba5-2196-465b-a44f-8967af2e0d87
  kind: EndpointSlice
  metadata: {}
  nodeAddresses:
    epic-client: 192.168.121.104
  parentRef:
    name: devtest
    namespace: default
    uid: 3dbc2265-3ec5-4bdf-82e1-86514d7f8321
  ports:
  - name: http
    port: 8080
    protocol: TCP
```

In general gateways, routes and endpoints are deleted by the workload cluster, but should it be necessary they can be deleted in the EPIC gateway



### Envoy Configuration Synchronization

The Envoy configuration is generated from the ```gwp``` object and passed to Marin3r.  This subsystem verifies the configuration, keeps the last recent versions (configurable) and then updates the all of the gateways Envoy pods using the Envoy XDS configuration mechanism.  

```bash 
$ kubectl get ec
NAME                                   NODE ID                                          ENVOY API   DESIRED VERSION   PUBLISHED VERSION   CACHE STATE
4a5fb5b6-b53d-4513-b7a3-44f8bd919cac   epic-root.4a5fb5b6-b53d-4513-b7a3-44f8bd919cac   v3          69d9bb7946        69d9bb7946          InSync
```

An applied configuration will be shown as *InSync*.  Should the ```gwp``` object be incorrectly updated,  it will be rejected during verification.  To verify if a configuration has is correct and applied check the ```ecr``` envoyconfigrevisions objects.  Below shows four configurations with the *PUBLISHED true* representing the active configuration. A configuration that fails verification will be marked as TAINTED and will not be applied.  In this case, the previous Envoy configuration would remain and its very likely that operation will continue with the old configuration.  Correcting the configuration error in the ```gwp``` object will result in the configuration being applied

```bash 

$ k get ecr
NAME                                                           NODE ID                                          ENVOY API   VERSION      PUBLISHED   CREATED AT             LAST PUBLISHED AT      TAINTED
epic-root.4a5fb5b6-b53d-4513-b7a3-44f8bd919cac-v3-688b558f78   epic-root.4a5fb5b6-b53d-4513-b7a3-44f8bd919cac   v3          688b558f78   false       2023-11-29T21:43:37Z   2023-11-29T21:43:37Z   
epic-root.4a5fb5b6-b53d-4513-b7a3-44f8bd919cac-v3-69d9bb7946   epic-root.4a5fb5b6-b53d-4513-b7a3-44f8bd919cac   v3          69d9bb7946   false       2023-11-29T20:58:34Z   2023-11-29T20:58:34Z   
epic-root.4a5fb5b6-b53d-4513-b7a3-44f8bd919cac-v3-6c84b66459   epic-root.4a5fb5b6-b53d-4513-b7a3-44f8bd919cac   v3          6c84b66459   false       2023-11-29T20:58:33Z   2023-11-29T20:58:33Z   
epic-root.4a5fb5b6-b53d-4513-b7a3-44f8bd919cac-v3-8566f5b885   epic-root.4a5fb5b6-b53d-4513-b7a3-44f8bd919cac   v3          8566f5b885   true        2023-11-29T21:46:12Z   2023-11-29T21:46:12Z   
```