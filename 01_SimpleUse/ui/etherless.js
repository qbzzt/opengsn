var Web3 = require( 'web3')
const gsn = require('@opengsn/gsn')
const ethers = require("ethers")

//TODO: temporary struct, to run from command-line

if (typeof window == 'undefined' ) {
  function alert() {
    console.log( 'alert:',...Array.prototype.slice.call(arguments))
  }

  window = {
    ethereum:new Web3.providers.HttpProvider( 'https://kovan.infura.io/v3/f40be2b1a3914db682491dc62a19ad43')
  }
  window.ethereum.enable=()=>1
}

//TODO: temporary fix (gsn references global web3.eth.abi)
global.web3 = new Web3(window.ethereum)

const conf = {
	ourContract: '0x9576f163350b33Bb75CFB5A4E6B123E5c2AbdaD8',
	notOurs:     '0x6969Bc71C8f631f6ECE03CE16FdaBE51ae4d66B1',
	paymaster:   '0x9940c8e12Ca14Fe4f82646D6d00030f4fC3C7ad1',
	relayhub:    '0xcfcb6017e8ac4a063504b9d31b4AbD618565a276',
        forwarder:   '0x663946D7Ea17FEd07BF1420559F9FB73d85B5B03',
	gasPrice:  20000000000   // 20 Gwei
}


var provider = false
var userAddr   // The user's address


const startGsn = async () => {
	if (provider)
		return;

	await window.ethereum.enable()

	const gsnConfig =
		await gsn.resolveConfigurationGSN(window.ethereum, {
//			verbose: true,
			chainId: window.ethereum.chainId,
			paymasterAddress: conf.paymaster,
			forwarderAddress: conf.forwarder,
			methodSuffix: '_v4',
  			jsonStringifyRequest: true
		})
	window.app.gsnConfig = gsnConfig

	const gsnProvider = new gsn.RelayProvider(window.ethereum, gsnConfig)
        window.app.gsnProvider = gsnProvider

	provider = new ethers.providers.Web3Provider(gsnProvider)
//	userAddr = gsnProvider.newAccount().address
	userAddr = gsnProvider.origProvider.selectedAddress
	window.app.provider = provider
	window.app.userAddr = userAddr
}






data = {
  "abi": [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_forwarder",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "_from",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "_to",
          "type": "address"
        }
      ],
      "name": "FlagCaptured",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "forwarder",
          "type": "address"
        }
      ],
      "name": "isTrustedForwarder",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "captureFlag",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "versionRecipient",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getTrustedForwarder",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
}






const gsnContractCall = async () => {
	await startGsn()
	await provider.ready
	if (provider._network.chainId != 42) {
		alert("I only know the addresses for Kovan")
		raise("Unknown network")
	}
	const contract = await new ethers.Contract(
		conf.ourContract, data.abi, provider.getSigner(userAddr))

	const transaction = await contract.captureFlag()
	const hash = transaction.hash
	console.log(`Transaction ${hash} sent`)

	const receipt = await provider.waitForTransaction(hash)
	console.log(`Mined in block: ${receipt.blockNumber}`)
}   // gsnContractCall




const gsnPaymasterRejection = async () => {
	await startGsn()

	console.log('Trying to trick the paymaster')

	if (provider._network.chainId != 42) {
		alert("I only know the addresses for Kovan")
		raise("Unknown network")
	}

	const contract = await new ethers.Contract(
		conf.notOurs, data.abi, provider.getSigner(userAddr))
	const transaction = await contract.captureFlag()
	const hash = transaction.hash
	console.log(`Transaction ${hash} sent`)
	const receipt = await provider.waitForTransaction(hash)
	console.log(`Mined in block: ${receipt.blockNumber}`)
};   // gsPaymasterRejection









const listenToEvents = async () => {
	await startGsn()

	const contract = await new ethers.Contract(
		conf.ourContract, data.abi, provider);

	contract.on(contract.interface.events.FlagCaptured,
		evt => console.log(`Event: ${
			JSON.stringify(contract.interface.parseLog(evt))}`)
	);

};  // listenToEvents


window.app = {
	gsnContractCall: gsnContractCall,
	listenToEvents: listenToEvents,
	gsnPaymasterRejection: gsnPaymasterRejection,
	conf: conf,
	ethers: ethers,
	provider: provider,
	abi: data.abi,
	gsn: gsn
};
