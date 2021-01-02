var Web3 = require( 'web3')
const gsn = require('@opengsn/gsn')
const ethers = require("ethers")



const conf = {
	ourContract: '0x10A51A94d096e746E1Aec1027A0F8deCEC43FF63',
	notOurs:     '0x6969Bc71C8f631f6ECE03CE16FdaBE51ae4d66B1',
	paymaster:   '0x3f84367c25dC11A7aBE4B9ef97AB78d5D5498bF5',
	gasPrice:  20000000000   // 20 Gwei
}


var provider
var userAddr   // The user's address


const connect2Gsn = async () => {
	await window.ethereum.enable()

	if (provider != undefined)
		return;

  	let gsnProvider = await gsn.RelayProvider.newProvider({
		provider: window.web3.currentProvider,
		config: { paymasterAddress: conf.paymaster } }).init()

	provider = new ethers.providers.Web3Provider(gsnProvider)
	userAddr = gsnProvider.origProvider.selectedAddress

	window.app.gsnProvider = gsnProvider
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
	await connect2Gsn()
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
	await connect2Gsn()

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
};   // gsnPaymasterRejection









const listenToEvents = async () => {
	await connect2Gsn()

	const contract = await new ethers.Contract(
		conf.ourContract, data.abi, provider);

        window.app.listenContract = contract

	contract.on("FlagCaptured",
		(captureFrom, captureTo, evt) =>
			alert(`Capture: ${captureFrom} -> ${captureTo}`)
	)

}  // listenToEvents


window.app = {
	gsnContractCall: gsnContractCall,
	listenToEvents: listenToEvents,
	gsnPaymasterRejection: gsnPaymasterRejection,
	conf: conf,
	ethers: ethers,
	provider: provider,
	abi: data.abi,
	gsn: gsn
}
