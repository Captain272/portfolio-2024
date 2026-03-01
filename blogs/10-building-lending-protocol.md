# Building a Lending Protocol from Scratch in Solidity

Lending is the backbone of DeFi. Protocols like AAVE and Compound manage billions in collateralized loans. After indexing these protocols and breaking them in CTFs, I built one from scratch to understand the mechanics at the deepest level.

---

## How Lending Protocols Actually Work

The core loop is simple:

1. **Suppliers** deposit assets into a pool and earn interest
2. **Borrowers** lock collateral and take loans from the pool
3. **Interest rates** adjust dynamically based on pool utilization
4. **Liquidators** close unhealthy positions to keep the protocol solvent

The complexity is in the math, the edge cases, and making sure nobody can drain the pool.

---

## Core Contract Architecture

```
┌────────────────────────────────────────────┐
│              LendingPool.sol                │
│  deposit() / withdraw()                    │
│  borrow() / repay()                        │
│  liquidate()                               │
└──────────────────┬─────────────────────────┘
                   │
      ┌────────────┼────────────┐
      │            │            │
┌─────▼─────┐ ┌───▼────┐ ┌────▼──────┐
│ aToken.sol │ │Oracle  │ │ Interest  │
│ (receipts) │ │(prices)│ │ Rate Model│
└────────────┘ └────────┘ └───────────┘
```

---

## The Interest Rate Model

Utilization rate drives everything:

```solidity
function getUtilizationRate(
    uint totalBorrows,
    uint totalDeposits
) public pure returns (uint) {
    if (totalDeposits == 0) return 0;
    return totalBorrows * 1e18 / totalDeposits;
}
```

Below optimal utilization (e.g., 80%), rates increase slowly to attract borrowers. Above it, rates spike to incentivize repayment and new deposits:

```solidity
function getBorrowRate(uint utilization) public view returns (uint) {
    if (utilization <= optimalUtilization) {
        // Linear increase: 0% → baseRate at optimal
        return baseRate * utilization / optimalUtilization;
    } else {
        // Sharp increase above optimal
        uint excessUtilization = utilization - optimalUtilization;
        uint maxExcess = 1e18 - optimalUtilization;
        return baseRate + (slopeRate * excessUtilization / maxExcess);
    }
}
```

This is the same "kink" model Compound uses. AAVE adds a second slope for even more aggressive rate increases at very high utilization.

---

## Collateral and Loan-to-Value

Not all assets are equal. ETH might have an 80% LTV, while a volatile token gets 50%:

```solidity
struct AssetConfig {
    uint ltv;                  // Max borrow power (e.g., 80%)
    uint liquidationThreshold; // When liquidation kicks in (e.g., 85%)
    uint liquidationBonus;     // Discount for liquidators (e.g., 5%)
    address oracle;            // Chainlink price feed
}
```

A user's max borrow amount:

```solidity
function getMaxBorrow(address user) public view returns (uint) {
    uint totalCollateralUSD = 0;

    for (uint i = 0; i < userAssets[user].length; i++) {
        address asset = userAssets[user][i];
        uint balance = deposits[user][asset];
        uint price = getAssetPrice(asset);
        uint ltv = assetConfigs[asset].ltv;

        totalCollateralUSD += balance * price * ltv / 1e18 / 1e18;
    }

    return totalCollateralUSD - getUserTotalDebt(user);
}
```

---

## Health Factor and Liquidations

The health factor tells you how safe a position is:

```
Health Factor = (Collateral × Liquidation Threshold) / Total Debt
```

- HF > 1.0: Position is safe
- HF = 1.0: At the liquidation boundary
- HF < 1.0: Position can be liquidated

```solidity
function liquidate(
    address borrower,
    address collateralAsset,
    address debtAsset,
    uint debtToCover
) external {
    uint healthFactor = getHealthFactor(borrower);
    require(healthFactor < 1e18, "Position is healthy");

    // Liquidator repays part of the debt
    IERC20(debtAsset).transferFrom(msg.sender, address(this), debtToCover);

    // Liquidator receives collateral + bonus
    uint collateralPrice = getAssetPrice(collateralAsset);
    uint debtPrice = getAssetPrice(debtAsset);
    uint bonus = assetConfigs[collateralAsset].liquidationBonus;

    uint collateralAmount = debtToCover * debtPrice * (1e18 + bonus)
                          / (collateralPrice * 1e18);

    deposits[borrower][collateralAsset] -= collateralAmount;
    IERC20(collateralAsset).transfer(msg.sender, collateralAmount);
}
```

The liquidation bonus (typically 5-10%) incentivizes liquidators to keep the protocol healthy. Too low and nobody liquidates. Too high and borrowers get punished excessively.

---

## Flash Loans

The most elegant DeFi primitive. Borrow any amount, do anything with it, repay in the same transaction:

```solidity
function flashLoan(
    address receiver,
    address asset,
    uint amount,
    bytes calldata data
) external {
    uint balanceBefore = IERC20(asset).balanceOf(address(this));

    IERC20(asset).transfer(receiver, amount);

    IFlashLoanReceiver(receiver).executeOperation(
        asset, amount, flashLoanFee, data
    );

    uint balanceAfter = IERC20(asset).balanceOf(address(this));
    require(
        balanceAfter >= balanceBefore + flashLoanFee,
        "Flash loan not repaid"
    );
}
```

If the receiver doesn't return the funds + fee, the entire transaction reverts. Zero risk for the protocol, unlimited capital access for the borrower — for exactly one transaction.

---

## Oracle Integration

Price feeds are the most critical external dependency. A wrong price means wrong liquidations, wrong borrow limits, and potential insolvency:

```solidity
function getAssetPrice(address asset) public view returns (uint) {
    AggregatorV3Interface feed = AggregatorV3Interface(
        assetConfigs[asset].oracle
    );

    (, int price, , uint updatedAt, ) = feed.latestRoundData();

    // Staleness check — reject prices older than 1 hour
    require(block.timestamp - updatedAt < 3600, "Stale oracle");
    require(price > 0, "Invalid price");

    return uint(price);
}
```

Never use DEX spot prices. Never skip the staleness check. These two rules would have prevented hundreds of millions in exploits.

---

## Security Considerations

Building this after doing Ethernaut and Neodym CTFs made me paranoid about the right things:

1. **Reentrancy**: Every external call (token transfers, oracle reads, callbacks) is a potential reentrancy vector. Use checks-effects-interactions everywhere.

2. **Oracle manipulation**: If someone can move the price feed, they can drain the protocol. Chainlink with staleness checks is the minimum.

3. **Flash loan attacks on governance**: If your governance token is the same as a pool asset, flash loans can be used for governance attacks.

4. **Precision loss**: Solidity has no floating point. Interest calculations must handle rounding carefully to avoid dust accumulation or loss.

5. **Liquidation cascades**: If one large liquidation crashes a token's price, it can trigger more liquidations. Circuit breakers and liquidation limits help.

---

## What Makes Production Protocols Different

My implementation covers the core mechanics, but production protocols add layers:

- **Interest-bearing tokens** (aTokens/cTokens) that represent deposits and accrue value over time
- **Variable vs stable rate borrowing** — users choose their risk profile
- **Isolation mode** — new assets are sandboxed to limit protocol-wide risk
- **E-mode** — correlated assets (ETH/stETH) get higher LTV
- **Governance-controlled parameters** — LTV, liquidation thresholds, and interest curves are updatable

Understanding these mechanics from the ground up — building, breaking, and indexing them — gives you a fundamentally different perspective than just reading the docs.
