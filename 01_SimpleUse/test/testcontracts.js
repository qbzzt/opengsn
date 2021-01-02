const { RelayProvider, resolveConfigurationGSN } = require('@opengsn/gsn')
const { GsnTestEnvironment } = require('@opengsn/gsn/dist/GsnTestEnvironment' )
const ethers = require('ethers')

const Web3HttpProvider = require( 'web3-providers-http')

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
		let env = await GsnTestEnvironment.startGsn('localhost')

		const { forwarderAddress } = env.contractsDeployment
		const web3provider = new Web3HttpProvider('http://localhost:8545')
		const deploymentProvider = new ethers.providers.Web3Provider(web3provider)

        	const factory = new ethers.ContractFactory(
			CaptureTheFlag.abi,
			CaptureTheFlag.bytecode,
			deploymentProvider.getSigner())


		const flag = await factory.deploy(forwarderAddress)
		await flag.deployed()

                const paymasterFactory = new ethers.ContractFactory(
			NaivePaymaster.abi,
			NaivePaymaster.bytecode,
			deploymentProvider.getSigner()
		)

                const paymaster = await paymasterFactory.deploy()
                await paymaster.deployed()
                await paymaster.setTarget(flag.address)
	        await paymaster.setRelayHub(env.contractsDeployment.relayHubAddress)
                await paymaster.setTrustedForwarder(forwarderAddress)

		web3.eth.sendTransaction({
			from:accounts[0],
			to:paymaster.address,
			value:1e18})

                let gsnProvider =
                       await RelayProvider.newProvider({
				provider: web3.currentProvider,
				config: { paymasterAddress: paymaster.address} }).init()

        	const provider = new ethers.providers.Web3Provider(gsnProvider)

		const acct = provider.provider.newAccount()
		const acct2 = provider.provider.newAccount()

		const contract = await new
			ethers.Contract(flag.address, flag.interface.abi,
				provider.getSigner(acct.address, acct.privateKey))
		const contract2 = await new
			ethers.Contract(flag.address, flag.interface.abi,
				provider.getSigner(acct2.address, acct2.privateKey))

		var result = await callThroughGsn(contract, provider);
		assert.equal(result, 0, "Wrong initial last caller");

		var result = await callThroughGsn(contract, provider);
		assert.equal(result.toLowerCase(), acct.address.toLowerCase(),
			"Wrong second last caller (should be acct)");

		var result = await callThroughGsn(contract2, provider);
		assert.equal(result.toLowerCase(), acct.address.toLowerCase(),
			"Wrong third last caller (should be acct)");

		var result = await callThroughGsn(contract, provider);
		assert.equal(result.toLowerCase(), acct2.address.toLowerCase(),
			"Wrong fourth last caller (should be acct2)");
	});   // it 'Runs with GSN'
});   // describe

