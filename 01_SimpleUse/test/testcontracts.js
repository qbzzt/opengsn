const blockchain = "localhost"

const gsn = require('@opengsn/gsn')

const RelayProvider = require("@opengsn/gsn/dist/src/relayclient/").RelayProvider

const gsnTestEnv = require('@opengsn/gsn/dist/GsnTestEnvironment').default
const configureGSN = require('@opengsn/gsn/dist/src/relayclient/GSNConfigurator').configureGSN


const Web3 = require('web3')
const ethers = require("ethers")
const CaptureTheFlag = artifacts.require('CaptureTheFlag')
const NaivePaymaster = artifacts.require('NaivePaymaster')


const callThroughGsn = async (contract, provider) => {
		const transaction = await contract.captureFlag()
		const receipt = await provider.waitForTransaction(transaction.hash)

		const result = receipt.logs.
			map(entry => contract.interface.parseLog(entry)).
			filter(entry => entry != null)[0];

		return result.values['0']

};  // callThroughGsn



contract("CaptureTheFlag", async accounts => {

	it ('Runs without GSN', async () => {
		const flag = await CaptureTheFlag.new('0x0000000000000000000000000000000000000000');

		const res = await flag.captureFlag();
		assert.equal(res.logs[0].event, "FlagCaptured", "Wrong event");
		assert.equal(res.logs[0].args["0"], 0, "Wrong initial last caller");

		const res2 = await flag.captureFlag();
		assert.equal(res2.logs[0].event, "FlagCaptured", "Wrong event");
		assert.equal(res2.logs[0].args["0"], accounts[0], "Wrong second last caller");

		const res3 = await flag.captureFlag();
		assert.equal(res3.logs[0].event, "FlagCaptured", "Wrong event");
		assert.equal(res3.logs[0].args["0"], res2.logs[0].args["0"],
			"Wrong third last caller");

	});   // it 'Runs without GSN'


	it ('Runs with GSN', async () => {
		const gsnInstance = await gsnTestEnv.startGsn(blockchain);

		const flag = await
			CaptureTheFlag.new(gsnInstance.deploymentResult.forwarderAddress)

		const paymaster = await NaivePaymaster.new()
		await paymaster.setRelayHub(gsnInstance.deploymentResult.relayHubAddress)
		await paymaster.send(1e17)
		await paymaster.setTarget(flag.address)


		const gsnConfigParams = {
			gasPriceFactorPercent: 70,
			methodSuffix: '_v4',
			jsonStringifyRequest: true,
			chainId: '*',
			relayLookupWindowBlocks: 1e5,
			preferredRelays: [ gsnInstance.relayUrl ],
			relayHubAddress: gsnInstance.deploymentResult.relayHubAddress,
			stakeManagerAddress: gsnInstance.deploymentResult.stakeManagerAddress,
			paymasterAddress: paymaster.address
		}

		const gsnConfig = configureGSN(gsnConfigParams)

		const provider = new ethers.providers.Web3Provider(
			new RelayProvider(web3.currentProvider, gsnConfig)) 


		const acct = provider.provider.newAccount()
		const contract = await new ethers.Contract(flag.address, flag.abi,
			provider.getSigner(acct.address, acct.privateKey))

		var result = await callThroughGsn(contract, provider);
		assert.equal(result, 0, "Wrong initial last caller");

		var result = await callThroughGsn(contract, provider);
		assert.equal(result.toLowerCase(), acct.address.toLowerCase(), 
			"Wrong second last caller (should be acct)");


		const acct2 = provider.provider.newAccount()
		const contract2 = await new ethers.Contract(flag.address, flag.abi,
			provider.getSigner(acct2.address, acct2.privateKey))


		var result = await callThroughGsn(contract2, provider);
		assert.equal(result.toLowerCase(), acct.address.toLowerCase(), 
			"Wrong third last caller (should be acct)");


		var result = await callThroughGsn(contract, provider);
		assert.equal(result.toLowerCase(), acct2.address.toLowerCase(),
			"Wrong fourth last caller (should be acct2)");


	});   // it 'Runs with GSN'



});   // describe

