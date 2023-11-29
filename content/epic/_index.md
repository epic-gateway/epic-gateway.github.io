---
title: "EPIC Gateway Cluster"
linkTitle: "EPIC Clusters"
weight: 30
description: >
 Creating and managing a Gateway Cluster for development or production
---

An EPIC cluster consists of k8s nodes, the cluster is installed using Ansible playbooks.  Node installation consists of operating system components, Kubernetes and Kubernetes components.

The installation scripts have been developed for installation on Ubuntu (or debian).  There is no reason that they could not run on a Redhat family OS however some modification is probably required.

K8s is installed using *kubeadm* from upstream k8s again there is no reason a downstream distribution could not be used but some modification is probably required.

In addition to installing k8s components, the installation scripts also add components to the host operating system on EPIC clusters.  These components include the eBPF *true ingress* transport and configuration files for the Bird router pods.  This could be changed so that all components are added using k8s mechanisms however again would require modification.

In the case of k8s and many other components, the versions are *pinned*.  K8s and its components can be described as *fast changing* and considering the number of components and their need to work together to create gateways, *pinning* simplifies and insures that installation will work the first time.  Some of the components in EPIC have been developed by us, some are forks with specific modifications and others are unchanged components. We have tested using these versions, care should be taken removing version *pinning*

The Ansible scripts provided can also install k8s workload nodes.  These is in place because these scripts provide a number of functions.  The are used by the *Quick Start* and can be used in conjunction with the Multinode Vagrant setup.  In fact, the defaults in the scripts reflect the structure of the Multinode Vagrant setup and have been tested to install correctly in this environment.  This combination provides a further reference design that can be used when EPIC is installed on dedicated hosts.  Installing on dedicated hosts requires that the configuration is changed to reflect your environment, however we have used these scripts to implement decided systems by simply using the playbooks necessary for EPIC.


{{% alert title="Tip" color="info" %}}
I good way to become familiar with the installation and configuration options is to install a Vagrant Multinode test environment and run the scripts against that environment before attempting your dedicated hardware installation.
{{% /alert %}}