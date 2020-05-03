const conf = {
	target:    '0x7f5437b27478791642AE95Ce38b123b0107e0cEc',
	paymaster: '0x0572dc46eb6edc950aa37c12fa9c862d4165cbc5',
	relayhub:  '0x2E0d94754b348D208D64d52d78BcD443aFA9fa52',
	stakemgr:  '0x0ecf783407C5C80D71CFEa37938C0b60BD255FF8',
	gasPrice:  20000000000   // 20 Gwei
}



const Gsn = require("@opengsn/gsn/dist/src/relayclient/")
const RelayProvider = Gsn.RelayProvider



const configureGSN = 
	require('@opengsn/gsn/dist/src/relayclient/GSNConfigurator').configureGSN

const ethers = require("ethers")


const gsnConfig = configureGSN({
	relayHubAddress: conf.relayhub,
	paymasterAddress: conf.paymaster,
	stakeManagerAddress: conf.stakemgr,
	gasPriceFactorPercent: 70,
	methodSuffix: '_v4',
	jsonStringifyRequest: true,
	chainId: 42,
	relayLookupWindowBlocks: 1e5
})    // gsnConfig




const origProvider = window.ethereum;
const gsnProvider = new RelayProvider(origProvider, gsnConfig);
const provider = new ethers.providers.Web3Provider(gsnProvider);



const lastCallerAddr = conf.target;

// Copied from build/contracts/LastCaller.json
const lastCallerAbi =  [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_forwarder",
          "type": "address"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "LastCallerIs",
      "type": "event"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "getTrustedForwarder",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [],
      "name": "getLastCaller",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];



const gsnContractCall = async () => {
	if (provider._network.chainId != 42) {
		alert("I only know the addresses for Kovan");
		raise("Unknown network");
	}

	const contract = await new ethers.Contract(
		lastCallerAddr, lastCallerAbi, provider.getSigner() );
	await window.ethereum.enable();
	const transaction = await contract.getLastCaller();
	const hash = transaction.hash;
	console.log(`Transaction ${hash} sent`);
	const receipt = await provider.waitForTransaction(hash);
	console.log(`Mined in block: ${receipt.blockNumber}`);
};   // gsnContractCall






const listenToEvents = async () => {
	// provider is good enough for a read 
	// only, which doesn't cost anything
	const contract = await new ethers.Contract(
		lastCallerAddr, lastCallerAbi, provider);

	contract.on(contract.interface.events.LastCallerIs, evt =>
		console.log(`Event: ${JSON.stringify(evt)}`)
	);

};  // listenToEvents


window.app = {
	gsnContractCall: gsnContractCall,
	listenToEvents: listenToEvents,
	target: conf.target,
	ethers: ethers,
	provider: provider,
	addr: lastCallerAddr,
	abi: lastCallerAbi
};

