// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {HawkPool} from "../src/HawkPool.sol";
import {HawkToken} from "../src/HawkToken.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        uint256 hawkKey = vm.envUint("HAWK_WALLET_PRIVATE_KEY");
        address hawk = vm.addr(hawkKey);
        address deployer = vm.addr(deployerKey);

        vm.startBroadcast(deployerKey);

        HawkToken pons = new HawkToken("Pons", "PONS");
        HawkToken harmonic = new HawkToken("Harmonic", "HARMONIC");
        HawkToken longbow = new HawkToken("Longbow", "LONGBOW");
        HawkToken route = new HawkToken("Route", "ROUTE");
        HawkToken cash = new HawkToken("Cash Cat", "CASHCAT");

        address[] memory tokens = new address[](5);
        tokens[0] = address(pons);
        tokens[1] = address(harmonic);
        tokens[2] = address(longbow);
        tokens[3] = address(route);
        tokens[4] = address(cash);

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

        _seed(deployer, pons, pool, 8_000_000 ether);
        _seed(deployer, harmonic, pool, 250_000_000 ether);
        _seed(deployer, longbow, pool, 350_000_000 ether);
        _seed(deployer, route, pool, 800_000_000 ether);
        _seed(deployer, cash, pool, 22_000_000 ether);

        pons.mint(hawk, 46_000 ether);
        harmonic.mint(hawk, 180_000 ether);
        longbow.mint(hawk, 95_000 ether);
        route.mint(hawk, 240_000 ether);
        cash.mint(hawk, 30_000 ether);
        (bool funded,) = hawk.call{value: 50 ether}("");
        require(funded, "fund");

        vm.stopBroadcast();

        vm.startBroadcast(hawkKey);
        pons.approve(address(pool), type(uint256).max);
        cash.approve(address(pool), type(uint256).max);
        route.approve(address(pool), type(uint256).max);
        harmonic.approve(address(pool), type(uint256).max);
        longbow.approve(address(pool), type(uint256).max);
        pool.supply(address(pons), 4_000 ether);
        pool.supply(address(cash), 12_000 ether);
        pool.borrow(address(route), 450_000 ether);
        vm.stopBroadcast();

        console.log("POOL", address(pool));
        console.log("WALLET", hawk);
        console.log("PONS", address(pons));
        console.log("HARMONIC", address(harmonic));
        console.log("LONGBOW", address(longbow));
        console.log("ROUTE", address(route));
        console.log("CASHCAT", address(cash));
    }

    function _seed(address deployer, HawkToken token, HawkPool pool, uint256 amount) internal {
        token.mint(deployer, amount);
        token.approve(address(pool), amount);
        pool.supply(address(token), amount);
    }
}
