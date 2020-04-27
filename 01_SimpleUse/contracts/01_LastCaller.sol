pragma solidity >=0.5.0 <0.6.0;

import "@opengsn/gsn/contracts/BaseRelayRecipient.sol";


contract LastCaller is BaseRelayRecipient {

	event LastCallerIs(address);

	address lastCaller = address(0);

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

