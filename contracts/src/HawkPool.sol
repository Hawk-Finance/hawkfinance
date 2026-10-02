// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

interface IHawkToken {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

/// @notice One margin account across the listed Hawk markets.
contract HawkPool {
    uint256 internal constant BPS = 10_000;
    uint256 internal constant WAD = 1e18;

    struct Market {
        uint256 price;
        uint16 ltvBps;
        uint16 liqBps;
        uint16 penaltyBps;
        uint16 supplyAprBps;
        uint16 borrowAprBps;
        uint256 totalSupply;
        uint256 totalBorrow;
        bool listed;
    }

    address[] public tokens;
    mapping(address => Market) public markets;
    mapping(address => mapping(address => uint256)) public supplied;
    mapping(address => mapping(address => uint256)) public borrowed;
    mapping(address => mapping(address => bool)) public collateralOn;

    error MarketClosed();
    error AmountZero();
    error Insufficient();
    error Unhealthy();

    constructor(
        address[] memory tokenList,
        uint256[] memory prices,
        uint16[] memory ltvBps,
        uint16[] memory liqBps,
        uint16[] memory penaltyBps,
        uint16[] memory supplyAprBps,
        uint16[] memory borrowAprBps
    ) {
        uint256 count = tokenList.length;
        require(
            count > 0 && prices.length == count && ltvBps.length == count && liqBps.length == count
                && penaltyBps.length == count && supplyAprBps.length == count && borrowAprBps.length == count,
            "length"
        );
        for (uint256 i = 0; i < count; i++) {
            address token = tokenList[i];
            require(token != address(0) && !markets[token].listed, "token");
            require(liqBps[i] > ltvBps[i] && ltvBps[i] > 0 && liqBps[i] <= BPS, "risk");
            tokens.push(token);
            markets[token] = Market({
                price: prices[i],
                ltvBps: ltvBps[i],
                liqBps: liqBps[i],
                penaltyBps: penaltyBps[i],
                supplyAprBps: supplyAprBps[i],
                borrowAprBps: borrowAprBps[i],
                totalSupply: 0,
                totalBorrow: 0,
                listed: true
            });
        }
    }

    function marketCount() external view returns (uint256) {
        return tokens.length;
    }

    function tokenAt(uint256 index) external view returns (address) {
        return tokens[index];
    }

    function marketOf(address token)
        external
        view
        returns (
            uint256 price,
            uint16 ltvBps,
            uint16 liqBps,
            uint16 penaltyBps,
            uint16 supplyAprBps,
            uint16 borrowAprBps,
            uint256 totalSupply,
            uint256 totalBorrow
        )
    {
        Market storage market = markets[token];
        require(market.listed, "market");
        return (
            market.price,
            market.ltvBps,
            market.liqBps,
            market.penaltyBps,
            market.supplyAprBps,
            market.borrowAprBps,
            market.totalSupply,
            market.totalBorrow
        );
    }

    function positionOf(address account, address token)
        external
        view
        returns (uint256 suppliedAmount, uint256 borrowedAmount, bool enabled)
    {
        return (supplied[account][token], borrowed[account][token], collateralOn[account][token]);
    }

    function accountOf(address account)
        external
        view
        returns (uint256 collateralUsd, uint256 limitUsd, uint256 liqUsd, uint256 debtUsd)
    {
        return _account(account);
    }

    function supply(address token, uint256 amount) external {
        Market storage market = markets[token];
        if (!market.listed) revert MarketClosed();
        if (amount == 0) revert AmountZero();
        _pull(token, amount);
        supplied[msg.sender][token] += amount;
        market.totalSupply += amount;
        collateralOn[msg.sender][token] = true;
    }

    function withdraw(address token, uint256 amount) external {
        if (amount == 0) revert AmountZero();
        if (supplied[msg.sender][token] < amount) revert Insufficient();
        Market storage market = markets[token];
        supplied[msg.sender][token] -= amount;
        market.totalSupply -= amount;
        if (market.totalSupply < market.totalBorrow) revert Insufficient();
        _requireHealthy(msg.sender);
        _push(token, amount);
    }

    function borrow(address token, uint256 amount) external {
        Market storage market = markets[token];
        if (!market.listed) revert MarketClosed();
        if (amount == 0) revert AmountZero();
        if (market.totalSupply - market.totalBorrow < amount) revert Insufficient();
        borrowed[msg.sender][token] += amount;
        market.totalBorrow += amount;
        _requireHealthy(msg.sender);
        _push(token, amount);
    }

    function repay(address token, uint256 amount) external {
        uint256 debt = borrowed[msg.sender][token];
        if (amount > debt) amount = debt;
        if (amount == 0) revert AmountZero();
        _pull(token, amount);
        borrowed[msg.sender][token] = debt - amount;
        markets[token].totalBorrow -= amount;
    }

    function setCollateral(address token, bool enabled) external {
        if (!markets[token].listed) revert MarketClosed();
        collateralOn[msg.sender][token] = enabled;
        if (!enabled) _requireHealthy(msg.sender);
    }

    function _requireHealthy(address account) internal view {
        (,, uint256 liqUsd, uint256 debtUsd) = _account(account);
        if (debtUsd > 0 && liqUsd <= debtUsd) revert Unhealthy();
        (, uint256 limitUsd,, uint256 debt) = _account(account);
        if (debt > limitUsd) revert Unhealthy();
    }

    function _account(address account)
        internal
        view
        returns (uint256 collateralUsd, uint256 limitUsd, uint256 liqUsd, uint256 debtUsd)
    {
        uint256 count = tokens.length;
        for (uint256 i = 0; i < count; i++) {
            address token = tokens[i];
            Market storage market = markets[token];
            uint256 supplyAmount = supplied[account][token];
            if (supplyAmount > 0 && collateralOn[account][token]) {
                uint256 value = supplyAmount * market.price / WAD;
                collateralUsd += value;
                limitUsd += value * market.ltvBps / BPS;
                liqUsd += value * market.liqBps / BPS;
            }
            uint256 borrowAmount = borrowed[account][token];
            if (borrowAmount > 0) debtUsd += borrowAmount * market.price / WAD;
        }
    }

    function _pull(address token, uint256 amount) internal {
        require(IHawkToken(token).transferFrom(msg.sender, address(this), amount), "pull");
    }

    function _push(address token, uint256 amount) internal {
        require(IHawkToken(token).transfer(msg.sender, amount), "push");
    }
}
