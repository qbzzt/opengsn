pragma solidity ^0.6.2;

import "@opengsn/gsn/contracts/BaseRelayRecipient.sol";


contract LastCaller is BaseRelayRecipient {

	event LastCallerIs(address);

	address lastCaller = address(0);

	// To use the GSNv2 forwarder on Kovan, call with
	// 0x6453d37248ab2c16ebd1a8f782a2cbc65860e60b
	constructor(address _forwarder) public {
		trustedForwarder = _forwarder;
	}

	function getLastCaller() external {
		address previous = lastCaller;

		// The real sender, which may not be the same as 
		// msg.sender (if the transaction is sponsored by
		// somebody else)
		lastCaller = _msgSender();  

		emit LastCallerIs(previous); 
	}
} 

