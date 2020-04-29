const gsn = require('@opengsn/gsn')
const gsnHelpers = require('@opengsn/gsn/helpers')
const Web3 = require('web3')

const LastCaller = artifacts.require('../contracts/LastCaller.sol')
const NaivePaymaster = artifacts.require('NaivePaymaster')

contract("LastCaller", async accounts => {

	it ('text clause text', async () => {
		const lastcaller = await LastCaller.new('0x0000000000000000000000000000000000000000');

		const res = await lastcaller.getLastCaller();
		assert.equal(res.logs[0].event, "LastCallerIs", "Wrong event");
		assert.equal(res.logs[0].args["0"], 0, "Wrong initial last caller");

		const res2 = await lastcaller.getLastCaller();
		assert.equal(res2.logs[0].event, "LastCallerIs", "Wrong event");
		assert.equal(res2.logs[0].args["0"], accounts[0], "Wrong second last caller");

		const res3 = await lastcaller.getLastCaller();
		assert.equal(res.logs[0].event, "LastCallerIs", "Wrong event");
		assert.equal(res3.logs[0].args["0"], res2.logs[0].args["0"],
			"Wrong third last caller");

	});



  describe('same with GSNDevProvider', function () {
    let gaslessAccount
    let lastcaller
    let transactionDetails

    before(async function () {
      // GsnDevProvider cannot use Truffle's default 'web3.currentProvider', which is 'HttpProvider'
      // (because HttpProvider does not allow 'event subscriptions')
      const wssProvider = new Web3.providers.WebsocketProvider(web3.currentProvider.host)
      const {
        relayHubAddress,
        stakeManagerAddress,
        forwarderAddress
      } = await gsnHelpers.deployRelayHub(web3, { workdir: 'build/gsn' })
      // GsnDevProvider requires some configuration (should be simplified in the near future)
      const devConfig = {
        relayOwner: accounts[0],
        relayHubAddress,
        stakeManagerAddress,
        gasPriceFactor: 1,
        pctRelayFee: 0,
        baseRelayFee: 0
      }
      const gsnDevProvider = new gsn.GsnDevProvider(wssProvider, devConfig)

      // recipient must know what is the forwarder address
      lastcaller = await LastCaller.new(forwarderAddress)

      // paymaster must know both relay hub and target
      const naivePaymaster = await NaivePaymaster.new()
      await naivePaymaster.setRelayHub(relayHubAddress)
      await naivePaymaster.setTarget(lastcaller.address)

      // Paymaster will forward all incoming ether to the RelayHub
      // There is no 'balance' of the paymaster contract itself, only it's record in the Hub.
      await web3.eth.sendTransaction({
        from: accounts[0],
        to: naivePaymaster.address,
        value: 1e18
      })

      // Now, this line is magic. We know how does Truffle implements sending transactions internally, so we set the provider through one of the 'artifacts'
      // Outside the scope of test framework this will be done in the opposite order
      LastCaller.web3.setProvider(gsnDevProvider)
      gaslessAccount = gsnDevProvider.newAccount()

      // The last parameter of the contract call is 'details'. GSN calls have some extra fields that must be specified.
      transactionDetails = {
        from: gaslessAccount.address,
        paymaster: naivePaymaster.address,
        forwarder: forwarderAddress // This parameter is still debated. I will include it, but as of today, this is not the source of this information. 'forwarderAddress' today is read from the recipient
      }
    })

    // But after the long setup, the usage is exactly as it was before the GSN.
    it('should emit user address', async function () {
      await lastcaller.getLastCaller(transactionDetails)
      const res = await lastcaller.getLastCaller(transactionDetails)
      assert.equal(res.logs[0].event, 'LastCallerIs', 'Wrong event')
      assert.equal(res.logs[0].args['0'].toLowerCase(), gaslessAccount.address.toLowerCase(), 'Wrong last caller')
    })
  })

  
})

