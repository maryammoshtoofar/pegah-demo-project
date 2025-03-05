//How To run:
// 1. Install Azure CLI https://docs.microsoft.com/en-us/cli/azure/install-azure-cli
// 2. az login
// 3. az account set -s <<your subscription id>>
// 5. az deployment sub what-if --resource-group pegah-framework-rg --template-file azure-main-live-test.bicep
// 6. az deployment sub create --resource-group pegah-framework-rg --template-file azure-main-live-test.bicep

targetScope = 'subscription'

param location string
param brodcastSecret string
param firewallMyIP string
param dbAdminPassword string

resource liveRG 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: 'pegah-framework-live'
  location: location
}

module containerReg 'azure-container-registry.bicep' = {
  name: 'containerregistry'
  scope: liveRG
  params: {
    location: location
  }
}

module liveEnvironment 'azure-environment.bicep' = {
  name: 'live'
  params: {
    suffix: 'live'
    dbAdminUser: 'sa-pegah-framework'
    dbFirewallMyIp: firewallMyIP
    dbAdminPassword: dbAdminPassword
    usePostgressDatabase: false
    location: location
    containerRegistryName: containerReg.outputs.containerRegistryName
    containerRegistryId: containerReg.outputs.containerRegistryId
    imageName: 'pegah-framework-live'
    withSlot: true
    brodcastSecret: brodcastSecret
  }
  scope: liveRG
}

resource testRG 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: 'pegah-framework-test'
  location: location
}

module testEnvironment 'azure-environment.bicep' = {
  name: 'test'
  params: {
    suffix:'test'
    dbAdminUser: 'sa-pegah-framework'
    dbFirewallMyIp: firewallMyIP
    dbAdminPassword: dbAdminPassword
    usePostgressDatabase: false
    location: location
    containerRegistryName: containerReg.outputs.containerRegistryName
    containerRegistryId: containerReg.outputs.containerRegistryId
    imageName: 'pegah-framework-test'
    withSlot: false
    brodcastSecret: brodcastSecret
  }
  scope: testRG
}




output containerRegistryName string = containerReg.outputs.containerRegistryName 
