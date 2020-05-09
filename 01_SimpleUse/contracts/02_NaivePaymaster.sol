pragma solidity ^0.6.2;
pragma experimental ABIEncoderV2;

import "@opengsn/gsn/contracts/BasePaymaster.sol";



contract NaivePaymaster is BasePaymaster {
	address public ourTarget;   // The target contract we are willing to pay for

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
	) external view override returns (bytes memory context) {
		(approvalData, maxPossibleGas);  // avoid a warning

		require(relayRequest.target == ourTarget);

		// If we got here, we're successful. Return the time
		// to be able to match PreRelayed and PostRelayed events
		return abi.encode(now);
	}

	event PreRelayed(uint);
	event PostRelayed(uint);

	function preRelayedCall(
		bytes calldata context
	) external relayHubOnly override returns(bytes32) {
		emit PreRelayed(abi.decode(context, (uint)));
		return bytes32(0);
	}

	function postRelayedCall(
		bytes calldata context,
		bool success,
		bytes32 preRetVal,
		uint256 gasUse,
		GSNTypes.GasData calldata gasData
	) external relayHubOnly override {
		(success, preRetVal, gasUse, gasData);
		emit PostRelayed(abi.decode(context, (uint)));
	}

} 



