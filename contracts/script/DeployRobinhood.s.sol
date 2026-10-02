// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {HawkPool} from "../src/HawkPool.sol";

/// @notice Deploys HawkPool against the live Robinhood Chain tokens.
///         The Hawk wallet pays gas. It does not mint tokens.
contract DeployRobinhood is Script {
    address internal constant PONS = 0x39dBED3a2bd333467115dE45665cC57F813C4571;
    address internal constant HARMONIC = 0xdEe52F2ab639b6942B0d0F0565400b93b7a0fbe5;
    address internal constant LONGBOW = 0x451b42A15100C340CA12F7c66DE06fac5EA2D751;
    address internal constant ROUTE = 0x4A72B9702f991b790788f8AFA9e7112541f4E8f8;
    address internal constant CASHCAT = 0x020bfC650A365f8BB26819deAAbF3E21291018b4;

    function run() external {
        uint256 hawkKey = vm.envUint("HAWK_WALLET_PRIVATE_KEY");

        vm.startBroadcast(hawkKey);

        address[] memory tokens = new address[](5);
        tokens[0] = PONS;
        tokens[1] = HARMONIC;
        tokens[2] = LONGBOW;
        tokens[3] = ROUTE;
        tokens[4] = CASHCAT;

        uint256[] memory prices = new uint256[](5);
        prices[0] = 0.53 ether;
        prices[1] = 0.0068 ether;
        prices[2] = 0.0063 ether;
        prices[3] = 0.002 ether;
        prices[4] = 0.176 ether;

        uint16[] memory ltv = new uint16[](5);
        ltv[0] = 3800;
        ltv[1] = 3200;
        ltv[2] = 3400;
        ltv[3] = 2800;
        ltv[4] = 4200;
        uint16[] memory liq = new uint16[](5);
        liq[0] = 4800;
        liq[1] = 4200;
        liq[2] = 4400;
        liq[3] = 3800;
        liq[4] = 5200;
        uint16[] memory penalty = new uint16[](5);
        penalty[0] = 800;
        penalty[1] = 900;
        penalty[2] = 900;
        penalty[3] = 1000;
        penalty[4] = 800;
        uint16[] memory supplyApr = new uint16[](5);
        supplyApr[0] = 860;
        supplyApr[1] = 1040;
        supplyApr[2] = 910;
        supplyApr[3] = 1180;
        supplyApr[4] = 740;
        uint16[] memory borrowApr = new uint16[](5);
        borrowApr[0] = 1640;
        borrowApr[1] = 1960;
        borrowApr[2] = 1720;
        borrowApr[3] = 2240;
        borrowApr[4] = 1380;

        HawkPool pool = new HawkPool(tokens, prices, ltv, liq, penalty, supplyApr, borrowApr);
        vm.stopBroadcast();

        console.log("POOL", address(pool));
        console.log("DEPLOYER", vm.addr(hawkKey));
    }
}
