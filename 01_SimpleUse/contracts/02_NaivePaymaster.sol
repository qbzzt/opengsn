pragma solidity >=0.5.0 <0.6.0;
pragma experimental ABIEncoderV2;

import "@opengsn/gsn/contracts/BasePaymaster.sol";


contract NaivePaymaster is BasePaymaster {
	address public ourTarget;   // The target contract we are willing to pay for

	// emit a confirmation when you receive ether
	event Received(uint eth);
	function() external payable {
		emit Received(msg.value);
	}

	// GNSTypes.RelayRequest is defined in GNSTypes.sol.
	// The relevant fields for us are:
	// target - the address of the target contract
	// encodedFunction - bytes ?????
	// relayData.senderAddress - the sender's address
	function acceptRelayedCall(
		GSNTypes.RelayRequest calldata relayRequest   // ,

// We don't use approvalData and maxPossibleGas, so we don't need 
// them in this Paymaster
//
//		bytes calldata approvalData,
//		uint256 maxPossibleGas
	) external view returns (bytes memory context) {
		if (relayRequest.target != ourTarget)
			revert();
		
		// If we got here, we're successful. Return
		// a context to identify this request
		return abi.encode(relayRequest.relayData.senderAddress);
	}

// There are also preRelayedCall and postRelayedCall, which are called before
// and after the call, for example for accounting purposes. However, this
// naive paymaster does not need them.

} 



