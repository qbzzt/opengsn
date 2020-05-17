const CaptureTheFlag = artifacts.require('CaptureTheFlag')

module.exports = async function (deployer) {
  await deployer.deploy(CaptureTheFlag)

  const instance = await CaptureTheFlag.deployed()
  const forwarderAddress = require('../build/gsn/Forwarder.json').address
  await instance.setTrustedForwarder(forwarderAddress)
  console.log(`Successfully set Trusted Forwarder (${forwarderAddress}) on Recipient (${instance.address})`)
}
