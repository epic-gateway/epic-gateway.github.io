---
title: "Installing EPIC Clusters"
linkTitle: "Installation"
weight: 10
description: >
 Creating a stand alone EPIC cluster
---

## Setup

This setup guide assumes that you have already tried the Quick Start and therefore have installed the prerequisites necessary to install EPIC.  The primary prerequisite is Ansible.


Clone the ansible playbooks used to install EPIC

```bash
$ git clone https://github.com/epic-gateway/ansible-playbook.git

```

Ansible requires access to each host and sudo privileges to complete. Additional hosts specified in the need to be configured in ```/etc/hosts``` 


## Installation



```yaml
# Inventory for when we run Ansible directly (i.e., not via Vagrant)

epic:
  hosts:
    epic1: # the first epic host in an acndev cluster, usually 192.168.254.11
      k8s_cluster_vip: 192.168.254.11
      true_ingress_interface: eth1
      ws_hostname: acndev-ctl

epicnode:
  hosts:
    epic2:
      k8s_nodeaddr: 192.168.254.12
      join_script: join-epic-cluster
      admin_conf: epic-admin.conf
      ws_hostname: acndev-ctl
    epic3:
      k8s_nodeaddr: 192.168.254.13
      join_script: join-epic-cluster
      admin_conf: epic-admin.conf
      ws_hostname: acndev-ctl
client:
  hosts:
    mk8s1: # the first client host in a multinode cluster, usually 192.168.254.101,fd00:254::101
      k8s_cluster_vip: 192.168.254.101
      k8s_nodeaddr: 192.168.254.101,fd00:254::101
      ws_hostname: acndev-ctl
node:
  hosts:
    mk8s2:
      k8s_nodeaddr: 192.168.254.102,fd00:254::102
      ws_hostname: acndev-ctl
    mk8s3:
      k8s_nodeaddr: 192.168.254.103,fd00:254::103
      ws_hostname: acndev-ctl
```

The default hosts.yml is populated with configuration information that maps the the Vagrant Multinode setup.  These are the high level configuration options, specific component configurations are also contained in the component playbooks. There is a makefile wrapper for playbook execution.


### Install first EPIC Cluster Node
The first step is to install the primary EPIC node, this node will be used to bootstrap remaining cluster nodes.

```bash
$ make epic-playbook TARGET=epic

```


### Add Cluster Nodes
The default scripts add two additional nodes to the cluster.

```bash
$ make epic-playbook TARGET=epicnode
```


### Verify Installation
To verify that all components are installed, check that all of the pods are running on the cluster.  

```bash
$ ssh epic1
$ sudo kubectl get pods -A
NAMESPACE        NAME                                          READY   STATUS              RESTARTS   AGE
cert-manager     cert-manager-5b6d4f8d44-vh4cc                 1/1     Running             0          159m
cert-manager     cert-manager-cainjector-747cfdfd87-prmrp      1/1     Running             0          159m
cert-manager     cert-manager-webhook-67cb765ff6-lvr2z         1/1     Running             0          159m
epic-root        eds-server-79c5b4d7cd-k6bx7                   1/1     Running             0          158m
epic-root        marin3r-discoveryservice-7c5b6c78f8-pgrxf     1/1     Running             0          158m
epic             controller-manager-cc6bb4787-gwg77            1/1     Running             0          158m
epic             node-agent-gthjz                              1/1     Running             0          71m
epic             node-agent-qjb8n                              1/1     Running             0          71m
epic             node-agent-v4jqj                              1/1     Running             0          158m
epic             web-service-58dd75588c-bzvpj                  1/1     Running             0          158m
epicauth         epicauth-f8fb6c744-hszzl                      1/1     Running             0          157m
epicauth         epicauth-f8fb6c744-tgt65                      1/1     Running             0          157m
kube-system      coredns-64897985d-hr7q7                       1/1     Running             0          160m
kube-system      coredns-64897985d-l8f6d                       1/1     Running             0          160m
kube-system      etcd-epic1                                    1/1     Running             0          160m
kube-system      kube-apiserver-epic1                          1/1     Running             0          160m
kube-system      kube-controller-manager-epic1                 1/1     Running             0          160m
kube-system      kube-flannel-ds-4x29p                         1/1     Running             0          72m
kube-system      kube-flannel-ds-s9brb                         1/1     Running             0          72m
kube-system      kube-flannel-ds-zcvxh                         1/1     Running             0          160m
kube-system      kube-multus-ds-6dv5p                          1/1     Running             0          159m
kube-system      kube-multus-ds-qkvvz                          1/1     Running             0          72m
kube-system      kube-multus-ds-sch96                          1/1     Running             0          72m
kube-system      kube-proxy-rmkkf                              1/1     Running             0          72m
kube-system      kube-proxy-td566                              1/1     Running             0          72m
kube-system      kube-proxy-z5wb2                              1/1     Running             0          160m
kube-system      kube-scheduler-epic1                          1/1     Running             0          160m
marin3r-system   marin3r-controller-manager-77b7784998-f64w7   1/1     Running             0          158m
marin3r-system   marin3r-controller-webhook-7d5bcdfd6f-74gnj   1/1     Running             0          158m
marin3r-system   marin3r-controller-webhook-7d5bcdfd6f-r9p8k   1/1     Running             0          158m
projectcontour   contour-contour-559ccb786c-h6zrw              1/1     Running             0          157m
projectcontour   contour-envoy-dlbf7                           2/2     Running             0          157m
projectcontour   contour-envoy-h2g9c                           2/2     Running             0          71m
projectcontour   contour-envoy-tk245                           2/2     Running             0          71m
purelb           allocator-58685cdb9b-rcqnr                    1/1     Running             0          158m
purelb           lbnodeagent-6ddcm                             1/1     Running             0          158m
purelb           lbnodeagent-6sfsd                             1/1     Running             0          71m
purelb           lbnodeagent-qj4rp                             1/1     Running             0          71m
router           bird-epic-7gp9x                               1/1     Running             0          159m
router           bird-epic-9d5lc                               0/1     Running             0          71m
router           bird-epic-lc4fb                               0/1     Running             0          71m

```

Above show that all components are installed and running

## Completing the installation
### Gateways External API Address.
EPIC has an API Service used by target clusters to configure gateways based upon OpenAPI.  Its access via a k8s Service Load Balancer (purelb) and an ingress controller (contour).

The ansible installs both components and configures purelb with an address range that will be advertized when by routing.  

```bash 
$ kubectl get service -n projectcontour contour-envoy
NAME            TYPE           CLUSTER-IP    EXTERNAL-IP       PORT(S)                      AGE
contour-envoy   LoadBalancer   172.21.62.6   192.168.254.200   80:30509/TCP,443:32558/TCP   30h
```
This is the address that is used for the *gateway-hostname* by the Gateway Controller (not the host IP address).

To change this address modify the PureLB Service Group information in the purelb namespace and cycle the service.  [Detailed documentation on purelb is here](https://github.com/purelb/purelb)

### Configure Routing
The final step is to configure routing for your environment.  The router PODS in EPIC use the Bird routing software.  The Bird Configuration consists of a *configmap* that references a set of configuration files.  These files are installed on the host operating system and are mounted into the Bird containers. This method was chosen because it separates routing configuration from k8s configuration, enables dynamic configuration of routing and enables nodes to have different routing configuration if necessary.  However it does require that configuration files be updated on each node independently.

```bash
# ls /opt/acnodal/bird
bfd.conf  bgp_peers.conf  bgp_policies.conf  envvar.conf  logging.conf  proto_host.conf  routes_static.conf

```

The configuration of these files will vary based upon your environment.  The vagrant Multinode environment contains a router VM configured to dynamically accept eBPF peers.  The only configuration file requiring modification in this environment is *bpg_peers.conf*.  Below is a working example.  Edit this file on each EPIC node.

```
root@epic1:~# cat /opt/acnodal/bird/bgp_peers.conf
# Configure bgp peers
# include "/usr/local/include/bird/bgp_peers.conf"

protocol bgp uplink1 {
        description "My BGP uplink";
        local as 4200000003;
        neighbor 192.168.254.1 external;
#       multihop 2;
#       hold time 90;           # Default is 240
#       password "secret";      # Password used for MD5 authentication
#
        ipv4 {                  # regular IPv4 unicast (1/1)
       export filter no_export_dhcp;
                export filter epic_export;
                import filter bgp_accept;
        };

        ipv6 {                  # regular IPv6 unicast (2/1)
       export filter no_export_dhcp;
                export filter epic_export;
                import filter bgp_accept;
        };
}

```

If your using the Vagrant Multinode, check the state of the router BGP connections.

```bash
$ vagrant ssh router
$ sudo vtysh -c 'show ip bgp summary'
IPv4 Unicast Summary:
BGP router identifier 192.168.254.1, local AS number 4211111111 vrf-id 0
BGP table version 16
RIB entries 7, using 1288 bytes of memory
Peers 3, using 2181 KiB of memory
Peer groups 1, using 64 bytes of memory

Neighbor        V         AS   MsgRcvd   MsgSent   TblVer  InQ OutQ  Up/Down State/PfxRcd   PfxSnt Desc
*192.168.254.11 4 4200000003        11        10        0    0    0 00:07:32            0 (Policy) N/A
*192.168.254.12 4 4200000003         7         7        0    0    0 00:04:24            0 (Policy) N/A
*192.168.254.13 4 4200000003         6         6        0    0    0 00:03:21            0 (Policy) N/A

Total number of neighbors 3
* - dynamic neighbor
3 dynamic neighbor(s), limit 100
```


## Using the Vagrant Multinode Workload Clusters.
If your using the Vagrant multinode environment, the ansible scripts include scripts to create the 3 node workload cluster.  

Create the first node and when its complete, join the additional nodes using the second script.

```bash
$ make epic-playbook TARGET=client
```
```bash
$ make epic-playbook TARGET=node
```

Configuring the Gateway Controller on k8s clusters is covered in the [Gateway Controller](/install_k8s_controller) section of the documentation.