// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {HawkPool} from "../src/HawkPool.sol";
import {HawkToken} from "../src/HawkToken.sol";

contract HawkPoolTest is Test {
    HawkToken internal pons;
    HawkToken internal cash;
    HawkToken internal route;
    HawkPool internal pool;
    address internal hawk = address(0xB0B);

    function setUp() public {
        pons = new HawkToken("Pons", "PONS");
        cash = new HawkToken("Cash Cat", "CASHCAT");
        route = new HawkToken("Route", "ROUTE");

        address[] memory tokens = new address[](3);
        tokens[0] = address(pons);
        tokens[1] = address(cash);
        tokens[2] = address(route);
        uint256[] memory prices = new uint256[](3);
        prices[0] = 0.53 ether;
        prices[1] = 0.176 ether;
        prices[2] = 0.002 ether;
        uint16[] memory ltv = new uint16[](3);
        ltv[0] = 3800;
        ltv[1] = 4200;
        ltv[2] = 2800;
        uint16[] memory liq = new uint16[](3);
        liq[0] = 4800;
        liq[1] = 5200;
        liq[2] = 3800;
        uint16[] memory penalty = new uint16[](3);
        penalty[0] = 800;
        penalty[1] = 800;
        penalty[2] = 1000;
        uint16[] memory supplyApr = new uint16[](3);
        supplyApr[0] = 860;
        supplyApr[1] = 740;
        supplyApr[2] = 1180;
        uint16[] memory borrowApr = new uint16[](3);
        borrowApr[0] = 1640;
        borrowApr[1] = 1380;
        borrowApr[2] = 2240;

        pool = new HawkPool(tokens, prices, ltv, liq, penalty, supplyApr, borrowApr);

        pons.mint(address(this), 8_000_000 ether);
        cash.mint(address(this), 22_000_000 ether);
        route.mint(address(this), 800_000_000 ether);
        pons.approve(address(pool), type(uint256).max);
        cash.approve(address(pool), type(uint256).max);
        route.approve(address(pool), type(uint256).max);
        pool.supply(address(pons), 8_000_000 ether);
        pool.supply(address(cash), 22_000_000 ether);
        pool.supply(address(route), 800_000_000 ether);

        pons.mint(hawk, 46_000 ether);
        cash.mint(hawk, 30_000 ether);
        route.mint(hawk, 240_000 ether);
        vm.startPrank(hawk);
        pons.approve(address(pool), type(uint256).max);
        cash.approve(address(pool), type(uint256).max);
        route.approve(address(pool), type(uint256).max);
        pool.supply(address(pons), 4_000 ether);
        pool.supply(address(cash), 12_000 ether);
        pool.borrow(address(route), 450_000 ether);
        vm.stopPrank();
    }

    function testHawkPositionIsHealthy() public view {
        (uint256 collateral, uint256 limit, uint256 liq, uint256 debt) = pool.accountOf(hawk);
        assertEq(collateral, 4232 ether);
        assertEq(debt, 900 ether);
        assertGt(limit, debt);
        assertEq(liq * 1e18 / debt, 2.350933333333333333 ether);
    }

    function testBorrowAboveLimitReverts() public {
        vm.startPrank(hawk);
        vm.expectRevert(HawkPool.Unhealthy.selector);
        pool.borrow(address(route), 2_000_000 ether);
        vm.stopPrank();
    }

    function testWithdrawThatBreaksHealthReverts() public {
        vm.startPrank(hawk);
        vm.expectRevert(HawkPool.Unhealthy.selector);
        pool.withdraw(address(cash), 12_000 ether);
        vm.stopPrank();
    }

    function testRepayReducesDebt() public {
        vm.startPrank(hawk);
        pool.repay(address(route), 100_000 ether);
        vm.stopPrank();
        (,,, uint256 debt) = pool.accountOf(hawk);
        assertEq(debt, 700 ether);
    }
}
