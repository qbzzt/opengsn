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
		GSNTypes.RelayRequest calldata relayRequest  ,
		bytes calldata approvalData,
		uint256 maxPossibleGas
	) external view returns (bytes memory context) {
		(approvalData, maxPossibleGas);  // avoid a warning
		if (relayRequest.target != ourTarget)
			revert();
		
		// If we got here, we're successful. Return
		// a context to identify this request
		return abi.encode(relayRequest.relayData.senderAddress);
	}

	function preRelayedCall(
		bytes calldata context
	) external relayHubOnly returns(bytes32) {
		(context);
		return bytes32(0);
	}

	function postRelayedCall(
		bytes calldata context,
		bool success,
		bytes32 preRetVal,
		uint256 gasUseExceptUs,
		GSNTypes.GasData calldata gasData
	) external relayHubOnly {
		(context, success, preRetVal, gasUseExceptUs, gasData);
	}

} 



