const ethers = require('ethers')
const { RelayProvider } = require("@opengsn/gsn")
const relayHubAddress = require('../build/gsn/RelayHub.json').address
const stakeManagerAddress = require('../build/gsn/StakeManager.json').address
const paymasterAddress = require('../build/gsn/Paymaster.json').address



const contractArtifact = require('../build/contracts/CaptureTheFlag.json')
const contractAddress = contractArtifact.networks[window.ethereum.networkVersion].address
const contractAbi = contractArtifact.abi

let provider
let network

async function identifyNetwork () {
  const tmpProvider = new ethers.providers.Web3Provider(window.ethereum);
  network = await tmpProvider.ready
  const gsnConfig = {
    relayHubAddress,
    paymasterAddress,
    stakeManagerAddress,
    methodSuffix: '_v4',
    jsonStringifyRequest: true,
    // TODO: this is actually a reported bug in MetaMask. Should be:
    // chainId: network.chainId
    // but chainID == networkId on top ethereum networks. See https://chainid.network/
    chainId: window.ethereum.networkVersion
  }
  const gsnProvider = new RelayProvider(window.ethereum, gsnConfig);
  provider = new ethers.providers.Web3Provider(gsnProvider)
  return network
}

async function contractCall () {
  await window.ethereum.enable()

  const contract = new ethers.Contract(
    contractAddress, contractAbi, provider.getSigner())
  const transaction = await contract.captureTheFlag()
  const hash = transaction.hash
  console.log(`Transaction ${hash} sent`)
  const receipt = await provider.waitForTransaction(hash)
  console.log(`Mined in block: ${receipt.blockNumber}`)
}

async function listenToEvents () {
  const contract = new ethers.Contract(
    contractAddress, contractAbi, provider)

  contract.on('FlagCaptured', (previousHolder, currentHolder, rawEvent) =>
    console.log(`Flag Captured from ${previousHolder} by ${currentHolder}`)
  )
}

window.app = {
  contractCall,
  listenToEvents,
  identifyNetwork
}

