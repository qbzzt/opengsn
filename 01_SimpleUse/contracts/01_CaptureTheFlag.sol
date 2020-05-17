pragma solidity ^0.6.2;

import "@opengsn/gsn/contracts/BaseRelayRecipient.sol";


contract CaptureTheFlag is BaseRelayRecipient {

	event FlagCaptured(address _from, address _to);

	address flagHolder = address(0);

	// To use the GSNv2 forwarder on Kovan, call with
	// 0x6453d37248ab2c16ebd1a8f782a2cbc65860e60b
	constructor(address _forwarder) public {
		trustedForwarder = _forwarder;
	}

	function captureFlag() external {
		address previous = flagHolder;

		// The real sender, which may not be the same as 
		// msg.sender (if the transaction is sponsored by
		// somebody else)
		flagHolder = _msgSender();  

		emit FlagCaptured(previous, flagHolder); 
	}
} 

