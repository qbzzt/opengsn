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


	// allow the owner to set ourTarget
	event TargetSet(address target);
	function setTarget(address target) external onlyOwner {
		ourTarget = target;
		emit TargetSet(target);
	}


	// GNSTypes.RelayRequest is defined in GNSTypes.sol.
	// The relevant fields for us are:
	// target - the address of the target contract
	// encodedFunction - the called function's name and parameters
	// relayData.senderAddress - the sender's address
	function acceptRelayedCall(
		GSNTypes.RelayRequest calldata relayRequest  ,
		bytes calldata approvalData,
		uint256 maxPossibleGas
	) external view returns (bytes memory context) {
		(approvalData, maxPossibleGas);  // avoid a warning

		bytes memory myContext;

		require(relayRequest.target == ourTarget);

		myContext = abi.encode(relayRequest.relayData.senderAddress);

		// If we got here, we're successful. Return
		// a context to identify this request
		return myContext;
	}

	event PreRelayed(bytes);
	event PostRelayed(bytes);

	function preRelayedCall(
		bytes calldata context
	) external relayHubOnly returns(bytes32) {
		(context);
		emit PreRelayed(context);
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
		emit PostRelayed(context);
	}

} 



