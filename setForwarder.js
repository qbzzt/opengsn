const fs = require('fs')

async function main () {
  let forwarderGsnArtifact = fs.readFileSync('./build/gsn/Forwarder.json').toString()
  let forwarderAddress = JSON.parse(forwarderGsnArtifact).address
  let walletArtifact = artifacts.require('CaptureTheFlag')
  let walletInstance = await walletArtifact.deployed()
  await walletInstance.setTrustedForwarder(forwarderAddress)
  console.log(`Successfully set Trusted Forwarder (${forwarderAddress}) on Recipient (${walletInstance.address})`)
}

const promise = main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })

module.exports = (callback) => {
  promise.then(callback)
}
