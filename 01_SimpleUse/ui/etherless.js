const conf = {
	ourContract: '0x23Cd0E36bB4727550bc01Cd3A1E8931b6d7CC796',
	notOurs:     '0x6969Bc71C8f631f6ECE03CE16FdaBE51ae4d66B1',
	paymaster:   '0x0572dc46eb6edc950aa37c12fa9c862d4165cbc5',
	relayhub:    '0x2E0d94754b348D208D64d52d78BcD443aFA9fa52',
	stakemgr:    '0x0ecf783407C5C80D71CFEa37938C0b60BD255FF8',
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



const flagAddr = conf.ourContract;

// Copied from build/contracts/CaptureTheFlag.json
const flagAbi = [
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
          "name": "",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "FlagCaptured",
      "type": "event"
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
    },
    {
      "inputs": [],
      "name": "captureFlag",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];    // flagAbi


const gsnContractCall = async () => {
	await window.ethereum.enable();

	if (provider._network.chainId != 42) {
		alert("I only know the addresses for Kovan");
		raise("Unknown network");
	}

	const contract = await new ethers.Contract(
		flagAddr, flagAbi, provider.getSigner() );
	const transaction = await contract.captureFlag();
	const hash = transaction.hash;
	console.log(`Transaction ${hash} sent`);
	const receipt = await provider.waitForTransaction(hash);
	console.log(`Mined in block: ${receipt.blockNumber}`);
};   // gsnContractCall


const gsnPaymasterRejection = async () => {
	await window.ethereum.enable();

	console.log('Trying to trick the paymaster');

	if (provider._network.chainId != 42) {
		alert("I only know the addresses for Kovan");
		raise("Unknown network");
	}

	const contract = await new ethers.Contract(
		conf.notOurs, flagAbi, provider.getSigner() );
	const transaction = await contract.captureFlag();
	const hash = transaction.hash;
	console.log(`Transaction ${hash} sent`);
	const receipt = await provider.waitForTransaction(hash);
	console.log(`Mined in block: ${receipt.blockNumber}`);
};   // gsPaymasterRejection









const listenToEvents = async () => {
	// provider is good enough for a read 
	// only, which doesn't cost anything
	const contract = await new ethers.Contract(
		flagAddr, flagAbi, provider);

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
	addr: flagAddr,
	abi: flagAbi
};


