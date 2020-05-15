/**
 * SPDX-License-Identifier:MIT
 */
pragma solidity >=0.4.25 <0.7.0;
pragma experimental ABIEncoderV2;

import "@opengsn/gsn/contracts/BasePaymaster.sol";

contract WhitelistPaymaster is BasePaymaster {

    mapping(address => bool) public whitelist;

    function addToWhitelist(address _address) onlyOwner external {
        whitelist[_address] = true;
    }

    function acceptRelayedCall(
        GSNTypes.RelayRequest calldata relayRequest,
        bytes calldata,
        uint256
    )
    override
    external
    view
    returns (bytes memory){
        require(whitelist[relayRequest.relayData.senderAddress], "not whitelisted");
        return "";
    }

    function preRelayedCall(bytes calldata) override external returns (bytes32){
        return 0;
    }

    function postRelayedCall(
        bytes calldata,
        bool,
        bytes32,
        uint256,
        GSNTypes.GasData calldata
    )
    override
    external {

    }

}
