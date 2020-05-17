const ethers = require('ethers')



const contractArtifact = require('../build/contracts/CaptureTheFlag.json')
const contractAddress = contractArtifact.networks[window.ethereum.networkVersion].address
const contractAbi = contractArtifact.abi

let provider
let network

async function identifyNetwork () {
  provider = new ethers.providers.Web3Provider(window.ethereum)
  network = await provider.ready
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

