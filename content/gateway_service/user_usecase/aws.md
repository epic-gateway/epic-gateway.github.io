---
title: "AWS EKS"
linkTitle: "AWS EKS & EPIC"
date:  2022-06-01
description: "Installing the Gateway Controller & using EPIC with AWS EKS"
---

EPIC can be used with AWS EKS, it just requires the installation of the Gateway Controller as per the getting [Started Guide]({{< ref "/gateway_service/user_manual/getting-started" >}}).

***The Gateway Controller operates in a mode specific to EKS, if your reporting a problem make sure you let us know your on EKS***

### Tested Versions:

Kubernetes 1.21 with latest AWS CNI and Kubeproxy selected.


### Notes:

The Gateway Controller supports EC2 nodes.  Fargate nodes are not supported

The Gateway Controller recognizes that its running on EKS by checking the node information at startup. This avoids the need for EKS specific configuration. [EKS has a unique CNI implementation](https://github.com/aws/amazon-vpc-cni-k8s).  Depending on the EC2 node type, there is a limit to the number of network interfaces and network addresses.  [IP address per network per instance type.](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-eni.html#AvailableIpPerENI)  Each EC2 node will add an additional ENI and when the number of addresses allocated to POD's exceeds the number supported by that instance, PODs are allocated addresses that are routed via another ENI using ip rules.  When this occurs another ENI is hotplugged on the node should it be needed.  When the EC2 instance runs out of ENI's and ip addresses POD creation fails.  Its important to note that these addresses are not present on the ENI NIC they are the POD veth-pair addresses, however the count as addresses according to EC2 instance types.  We can only assume that AWS decided to reuse their IPAM system from EC2 instead of running a seperate IPAM as other CNI's for POD CIDR.

