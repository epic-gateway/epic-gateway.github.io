---
title: "EPIC Gateway Configuration Pattern"
linkTitle: "Configuration Design Pattern"
date:  2022-06-02
description: "The architecture of EPIC's Gateway configuration"
---




EPIC's proxy engine design pattern is different to that of in-cluster Ingresses or Service Mesh.  Most of these resources use Envoy but do not provide access to Envoy's native configuration.  They abstract Envoy's configuration into a their configuration model.  For a standard k8s ingress resource, this is probably fine as it has limited functionality.   However the Ingress resources is recognized as lacking the functionality required by an API Gateway, therefore each Ingress adopts its own "proprietary" configuration syntax.  The configuration model is the only way to configure the proxy engine, therefore the functionality exposed by these ingresses and service meshes is defined by the configuration abstraction, not the capabilities of Envoy.


**EPIC takes a different path combining the in-cluster GatewayAPI resource configuration with Envoy configuration.**   A Gateway is instantiated from a template/blueprint that contains an Envoy configuration.  The GatewayAPI controller in the cluster updates this configuration via EPIC controllers and maintains version controlled native Envoy configurations.  The current Envoy configuration of a Gateway can be dynamically updated from the Gateway Service Manager, GatewayAPI objects update appropriate resources in the Gateway and there will be a set of Policy objects in the GatewayAPI controller in the future for updating configuration elements appropriate to cluster users. 

This solution ensure that all of the features of Envoy and any version of Envoy can be used to create a Gateway.  It enables EPIC and the GatewayAPI controller to track the GatewayAPI and Envoy developments independently making it easier to provide the maximum level of functionality.  If Envoy is in use elsewhere or is the prefered proxy engine in your organization, this model also avoids the need to relearn how to configure Envoy via another API.  Its not necessary dig deep into the implementation to figure out what the controller abstraction is doing so that the configuration needed can be created.


The Envoy configuration resulting from the combination of the Gateway template and the cluster Gateway controller is visible in the Gateway Service Manager.  As an example, below is an Gateway configuration and its associated Envoy configuration


### Gateway Configuration Object

```yaml
clientRef:
  clusterID: upstream-private
  name: uswest-demows
  namespace: istiodemowebsrv
  uid: cd4459af-443a-4a63-89a2-e329a4d943a0
display-name: uswest-demows
endpoints:
  - dnsName: uswest-demows-istiodemowebsrv-epictest-uswest.epick8sgw.net
    recordTTL: 180
    recordType: A
    targets:
      - 72.52.101.4
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
            - name: envoy.http_connection_manager
              typed_config:
                "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
                stat_prefix: {{ .ServiceName }}
                server_name: epicuswest
                add_user_agent: true
                use_remote_address: true
                via: epicuswest
                route_config:
                  name: local_route
                  virtual_hosts:
                  {{- range .Routes }}
                  {{- $route := .Spec.HTTP }}
                  {{- range $route.Hostnames | HostnameOrDefault }}
                  - name: "{{ . }}"
                    domains:
                    - "{{ . }}"
                    {{- if $route.Rules}}
                    routes:
                    {{- range $route.Rules}}
                    {{- $rule := . }}
                    {{- if .Matches }}
                    {{- range .Matches }}
                    - route:
                        weighted_clusters:
                          clusters:
                          {{- range $rule.BackendRefs}}
                          - name: {{ .Name }}
                            weight: {{ .Weight }}
                          {{- end }}
                          total_weight: {{ $rule.BackendRefs | RefWeightsTotal }}
                      match:
                        {{- if .Path.Type | PathTypePathPrefix }}
                        prefix: "{{ .Path.Value }}"
                        {{- end }}
                        {{- if .Path.Type | PathTypeExact }}
                        path: "{{ .Path.Value }}"
                        {{- end }}
                        {{- if .Headers }}
                        headers:
                        {{- range .Headers }}
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
                    {{- end }}
                    {{- end }}
                    {{- end }}
                    {{- end }}
                  {{- end }}
                  {{- end }}
                http_filters:
                - name: envoy.filters.http.bandwidth_limit
                  typed_config:
                    "@type": type.googleapis.com/envoy.extensions.filters.http.bandwidth_limit.v3.BandwidthLimit
                    stat_prefix: bandwidth_limiter_default
                    enable_mode: REQUEST_AND_RESPONSE
                    limit_kbps: 1000
                    fill_interval: 0.1s
                - name: envoy.filters.http.router
  nodeID: SET_BY_EPIC
  serialization: yaml

  ```
### Envoy Configuration Object

```yaml
envoyAPI: v3
envoyResources:
  clusters:
    - name: 4c01dfd4-3387-4405-b2b8-249eaed46ca7
      value: |
        name: 4c01dfd4-3387-4405-b2b8-249eaed46ca7
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
  listeners:
    - name: TCP-80
      value: |
        name: TCP-80
        address:
          socket_address:
            address: "::"
            ipv4_compat: yes
            port_value: 80
            protocol: TCP
        filter_chains:
        - filters:
          - name: envoy.http_connection_manager
            typed_config:
              "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
              stat_prefix: cd4459af-443a-4a63-89a2-e329a4d943a0
              server_name: epicuswest
              add_user_agent: true
              use_remote_address: true
              via: epicuswest
              route_config:
                name: local_route
                virtual_hosts:
                - name: "*"
                  domains:
                  - "*"
                  routes:
                  - route:
                      weighted_clusters:
                        clusters:
                        - name: 4c01dfd4-3387-4405-b2b8-249eaed46ca7
                          weight: 1
                        total_weight: 1
                    match:
                      prefix: "/"
              http_filters:
              - name: envoy.filters.http.bandwidth_limit
                typed_config:
                  "@type": type.googleapis.com/envoy.extensions.filters.http.bandwidth_limit.v3.BandwidthLimit
                  stat_prefix: bandwidth_limiter_default
                  enable_mode: REQUEST_AND_RESPONSE
                  limit_kbps: 1000
                  fill_interval: 0.1s
              - name: envoy.filters.http.router
nodeID: epic-epictest.cd4459af-443a-4a63-89a2-e329a4d943a0
serialization: yaml
```