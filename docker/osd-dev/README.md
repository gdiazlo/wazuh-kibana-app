# Wazuh development with Wazuh Stack

## Usage

Use always the provided script to bring up or down the development
environment. For example:

```bash
./dev.sh 1.2.4 1.2.0 $WZ_HOME up
```

The script will ask you all the required parameters to bring up the
environment, including the version of the elastic stack you want to
develop for, and the source code folder where the wazuh-kibana-app is
located.

**The script will not select the appropriate version of the
wazuh-kibana-app to use, so be sure to check out the appropriate version
before bringing up the environment!**

###  UI Credentials

The default user and password to access the UI at https://0.0.0.0:5601/ are:

```
admin:admin
```

## Notes

`wazuh-indexer` and `wazuh-dashboard` are both a redistribution of a
version of the OpenSearch Stack. We will only create environments for
the versions of OpenSearch which will be included into a Wazuh
version.

`opensearch` supported versions:
- 1.2.4
- 2.0.0

`opensearch-dashboard` supported versions:
- 1.2.0
- 2.0.0

We must use official `wazuh-indexer` and `wazuh-dashboard` images for
testing!

This environment will start a working deployment with:
  - Imposter - a mock server
  - Elasticsearch-exporter - Elasticsearch metrics to Prometheus adapter
  - OpenSearch single-node cluster
  - OpenSearch-Dashboards development environment

The OpenSearch-Dashboards development environment includes an already
bootstrapped Kibana, with all the node modules precompiled and ready to
use in a development session.