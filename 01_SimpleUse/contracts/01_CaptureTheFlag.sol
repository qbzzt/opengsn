pragma solidity ^0.6.2;

import "@opengsn/gsn/contracts/BaseRelayRecipient.sol";


contract CaptureTheFlag is BaseRelayRecipient {

	event FlagCaptured(address _from, address _to);

	address flagHolder = address(0);

        // Get the forwarder address for the network
        // you are using from
        // https://docs.opengsn.org/gsn-provider/networks.html
	constructor(address _forwarder) public {
		trustedForwarder = _forwarder;
	}

	function captureFlag() external {
		address previous = flagHolder;

                // The real sender. If you are using GSNv2, this
                // is not the same as msg.sender.
		flagHolder = _msgSender();  

		emit FlagCaptured(previous, flagHolder); 
	}
} 

