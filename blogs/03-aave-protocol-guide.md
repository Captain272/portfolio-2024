# Aave Protocol - Complete Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Core Concepts](#core-concepts)
3. [Protocol Architecture](#protocol-architecture)
4. [How It Works](#how-it-works)
5. [Interest Rates](#interest-rates)
6. [Liquidations](#liquidations)
7. [Flash Loans](#flash-loans)
8. [Integration Guide](#integration-guide)
9. [Building on Aave](#building-on-aave)
10. [Resources](#resources)

---

## Introduction

**Aave** is a decentralized, non-custodial liquidity protocol where users can:
- **Lend** crypto assets and earn interest
- **Borrow** assets against collateral
- **Execute flash loans** (uncollateralized loans within a single transaction)

### Key Stats
- **TVL**: $10+ billion (peak)
- **Networks**: Ethereum, Polygon, Avalanche, Arbitrum, Optimism, etc.
- **Assets**: 20+ supported tokens
- **Governance**: AAVE token holders

### Protocol Versions
- **Aave V1** (2020): Initial launch
- **Aave V2** (2020): Improved capital efficiency
- **Aave V3** (2022): Current version with portal, e-mode, isolation mode

---

## Core Concepts

### 1. **Liquidity Pools**

```
┌─────────────────────────────────┐
│      ETH Liquidity Pool         │
├─────────────────────────────────┤
│                                 │
│  Depositors (Suppliers)         │
│  └─► Provide ETH                │
│  └─► Receive aETH (aTokens)     │
│  └─► Earn interest              │
│                                 │
│  Borrowers                      │
│  └─► Provide collateral         │
│  └─► Borrow ETH                 │
│  └─► Pay interest               │
│                                 │
└─────────────────────────────────┘
```

Each asset has its own pool with:
- **Supply**: Total amount deposited
- **Borrows**: Total amount borrowed
- **Utilization Rate**: Borrowed / Supply
- **Interest Rates**: Dynamic based on utilization

### 2. **aTokens** (Interest-bearing Tokens)

When you deposit assets, you receive **aTokens** in return:

```
Deposit: 100 USDC
Receive: 100 aUSDC

After 1 year @ 5% APY:
Your aUSDC balance: 105 aUSDC
Redeemable for: 105 USDC
```

**Key Properties:**
- ✅ **1:1 peg** with underlying asset
- ✅ **Auto-compounding** (balance increases over time)
- ✅ **Transferable** (can send to other addresses)
- ✅ **Composable** (can use in other DeFi protocols)

### 3. **Debt Tokens**

When you borrow, you receive **debt tokens** representing your loan:

- **Variable Debt Tokens**: Interest rate fluctuates
- **Stable Debt Tokens**: Interest rate is relatively stable (algorithmically pegged)

```
Borrow: 50 USDC
Receive: 50 variableDebtUSDC

Your debt grows over time based on the interest rate
```

### 4. **Health Factor**

Your **Health Factor** determines if your position is safe:

```
Health Factor = (Collateral Value × Liquidation Threshold) / Borrowed Value

Example:
Collateral: 1 ETH @ $3,000 (LT = 80%)
Borrowed: $1,500 USDC

Health Factor = ($3,000 × 0.80) / $1,500 = 1.6
```

**Status:**
- **HF > 1**: ✅ Safe position
- **HF = 1**: ⚠️ At liquidation threshold
- **HF < 1**: ❌ Subject to liquidation

---

## Protocol Architecture

### Smart Contract Structure

```
Aave V3 Protocol
│
├── Pool (Main Entry Point)
│   ├── supply()
│   ├── withdraw()
│   ├── borrow()
│   ├── repay()
│   └── liquidationCall()
│
├── PoolAddressesProvider
│   └── Registry of all protocol contracts
│
├── AToken (Interest-bearing token)
│   ├── mint() - when users supply
│   └── burn() - when users withdraw
│
├── Debt Tokens
│   ├── VariableDebtToken
│   └── StableDebtToken
│
├── InterestRateStrategy
│   └── Calculates interest rates
│
├── PriceOracle
│   └── Provides asset prices (via Chainlink)
│
└── PoolConfigurator
    └── Admin functions (only governance)
```

### Asset Configuration

Each asset has specific parameters:

```solidity
struct ReserveConfiguration {
    uint256 LTV;                    // Loan-to-Value (e.g., 80%)
    uint256 liquidationThreshold;   // When liquidation occurs (e.g., 85%)
    uint256 liquidationBonus;       // Liquidator reward (e.g., 5%)
    uint256 reserveFactor;          // Protocol fee (e.g., 10%)
    bool usageAsCollateralEnabled;  // Can be used as collateral
    bool borrowingEnabled;          // Can be borrowed
    bool stableBorrowRateEnabled;   // Stable rate available
}
```

**Example: ETH Configuration**
```
LTV: 80%
Liquidation Threshold: 82.5%
Liquidation Penalty: 5%
Reserve Factor: 15%
```

---

## How It Works

### 1. **Supplying (Lending)**

**Process:**
```
1. User approves Pool to spend tokens
2. User calls supply(asset, amount, onBehalfOf, referralCode)
3. Pool transfers tokens from user
4. Pool mints aTokens to user
5. User earns interest (aToken balance increases)
```

**Smart Contract Call:**
```solidity
// Approve
IERC20(asset).approve(poolAddress, amount);

// Supply
IPool(pool).supply(
    asset,        // e.g., USDC address
    amount,       // e.g., 1000 * 1e6 (1000 USDC)
    msg.sender,   // receiver of aTokens
    0             // referral code
);
```

**What Happens:**
- Your tokens go into the liquidity pool
- You receive aTokens (e.g., aUSDC)
- Your aToken balance grows as interest accrues
- Interest is paid by borrowers

### 2. **Withdrawing**

**Process:**
```
1. User calls withdraw(asset, amount, to)
2. Pool burns aTokens from user
3. Pool transfers underlying tokens to user
```

**Smart Contract Call:**
```solidity
IPool(pool).withdraw(
    asset,          // e.g., USDC address
    amount,         // Amount to withdraw (or type(uint256).max for all)
    msg.sender      // Recipient address
);
```

### 3. **Borrowing**

**Requirements:**
- ✅ Sufficient collateral deposited
- ✅ Health factor remains > 1 after borrow
- ✅ Asset has liquidity available

**Process:**
```
1. User must have supplied collateral first
2. User calls borrow(asset, amount, interestRateMode, referralCode, onBehalfOf)
3. Pool checks collateral and health factor
4. Pool transfers borrowed asset to user
5. Pool mints debt tokens to user
6. Interest accrues on debt over time
```

**Smart Contract Call:**
```solidity
IPool(pool).borrow(
    asset,              // Asset to borrow (e.g., USDC)
    amount,             // Amount to borrow
    2,                  // Interest rate mode: 1 = Stable, 2 = Variable
    0,                  // Referral code
    msg.sender          // On behalf of
);
```

**Example:**
```
Deposited: 1 ETH @ $3,000 (LTV = 80%)
Max Borrow: $3,000 × 0.80 = $2,400

Borrow: $1,500 USDC
Health Factor: ($3,000 × 0.825) / $1,500 = 1.65 ✅
```

### 4. **Repaying**

**Process:**
```
1. User approves Pool to spend tokens
2. User calls repay(asset, amount, interestRateMode, onBehalfOf)
3. Pool transfers tokens from user
4. Pool burns debt tokens
5. Health factor improves
```

**Smart Contract Call:**
```solidity
// Approve repayment
IERC20(asset).approve(poolAddress, amount);

// Repay
IPool(pool).repay(
    asset,          // Asset to repay
    amount,         // Amount to repay (or type(uint256).max for all)
    2,              // Interest rate mode
    msg.sender      // On behalf of
);
```

---

## Interest Rates

### Interest Rate Model

Aave uses a **dynamic interest rate model** based on utilization:

```
Utilization Rate (U) = Total Borrowed / Total Supply

Variable Interest Rate:
- If U < U_optimal: Rate increases linearly
- If U > U_optimal: Rate increases sharply

Formula:
if U ≤ U_optimal:
    Rate = Base + (U / U_optimal) × Slope1
else:
    Rate = Base + Slope1 + ((U - U_optimal) / (1 - U_optimal)) × Slope2
```

### Example: USDC Interest Rate Curve

```
Parameters:
- Base Rate: 0%
- U_optimal: 90%
- Slope1: 4%
- Slope2: 60%

Interest Rate Graph:
    |
60% |                          ╱
    |                      ╱
    |                  ╱
 4% |              ╱
    |          ╱
 0% |______╱
    0%   50%   90%   100%
         Utilization Rate

At 50% utilization: ~2% APR
At 90% utilization: 4% APR
At 95% utilization: 34% APR (encourages repayment!)
```

### Supply vs Borrow APY

**Supply APY** (what lenders earn):
```
Supply APY = Borrow APY × Utilization Rate × (1 - Reserve Factor)

Example:
Borrow APY: 5%
Utilization: 80%
Reserve Factor: 10%

Supply APY = 5% × 0.80 × 0.90 = 3.6%
```

**Borrow APY** (what borrowers pay):
- Determined by the interest rate model
- Variable rate changes with utilization
- Stable rate is relatively fixed but can be rebalanced

---

## Liquidations

### When Liquidation Occurs

Liquidation happens when:
```
Health Factor < 1
```

**Example:**
```
Initial State:
Collateral: 1 ETH @ $3,000 (Liquidation Threshold = 82.5%)
Borrowed: $2,000 USDC
Health Factor: ($3,000 × 0.825) / $2,000 = 1.24 ✅

ETH price drops to $2,500:
Health Factor: ($2,500 × 0.825) / $2,000 = 1.03 ✅

ETH price drops to $2,400:
Health Factor: ($2,400 × 0.825) / $2,000 = 0.99 ❌ LIQUIDATION!
```

### Liquidation Process

```
1. Liquidator identifies underwater position (HF < 1)
2. Liquidator calls liquidationCall()
3. Liquidator repays part of the debt
4. Liquidator receives collateral + liquidation bonus
5. Borrower's position is healthier (or fully closed)
```

### Liquidation Parameters

**Close Factor**: Maximum % of debt that can be liquidated at once
- Usually 50% for most assets
- Can vary based on risk parameters

**Liquidation Bonus**: Discount liquidator gets
```
Liquidation Bonus = 5% (typical)

Liquidator repays: $1,000 debt
Liquidator receives: $1,050 worth of collateral
Profit: $50 (minus gas fees)
```

### Smart Contract Call

```solidity
IPool(pool).liquidationCall(
    collateralAsset,    // Asset to receive (e.g., ETH)
    debtAsset,          // Asset to repay (e.g., USDC)
    user,               // Address being liquidated
    debtToCover,        // Amount of debt to repay
    receiveAToken       // Receive aToken instead of underlying
);
```

### Protecting Against Liquidation

**Strategies:**
1. **Maintain High Health Factor**: Keep HF > 1.5 as buffer
2. **Monitor Prices**: Watch collateral asset prices
3. **Repay Debt**: Reduce borrowed amount
4. **Add Collateral**: Increase collateral value
5. **Use Automation**: Services like DeFi Saver for auto-management

---

## Flash Loans

### What Are Flash Loans?

**Flash loans** are uncollateralized loans that must be borrowed and repaid **within the same transaction**.

```
Single Transaction:
1. Borrow 1,000 ETH (no collateral!)
2. Use the ETH (arbitrage, liquidation, etc.)
3. Repay 1,000 ETH + 0.09% fee
4. Keep the profit

If step 3 fails, entire transaction reverts (like it never happened)
```

### Use Cases

**1. Arbitrage:**
```
1. Borrow 1,000 ETH from Aave
2. Buy DAI on Uniswap at $1.00
3. Sell DAI on Curve at $1.01
4. Profit: $10 - fees
5. Repay flash loan
```

**2. Collateral Swap:**
```
1. Borrow DAI from Aave
2. Repay your DAI debt on Aave
3. Withdraw your ETH collateral
4. Swap ETH to USDC
5. Deposit USDC as new collateral
6. Borrow DAI to repay flash loan
Result: Changed collateral from ETH to USDC
```

**3. Self-Liquidation:**
```
1. Flash loan to repay your own debt
2. Withdraw collateral
3. Swap collateral for debt asset
4. Repay flash loan
Result: Avoided liquidation penalty
```

### Implementation

```solidity
pragma solidity ^0.8.0;

import "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract FlashLoanExample is FlashLoanSimpleReceiverBase {
    constructor(address _addressProvider)
        FlashLoanSimpleReceiverBase(IPoolAddressesProvider(_addressProvider))
    {}

    /**
     * Execute flash loan
     */
    function executeFlashLoan(address asset, uint256 amount) external {
        address receiverAddress = address(this);
        bytes memory params = "";
        uint16 referralCode = 0;

        POOL.flashLoanSimple(
            receiverAddress,
            asset,
            amount,
            params,
            referralCode
        );
    }

    /**
     * This function is called after your contract has received the flash loaned amount
     */
    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {

        // Your custom logic here
        // e.g., arbitrage, liquidation, collateral swap

        // At the end, approve Pool to pull the debt + premium
        uint256 totalDebt = amount + premium;
        IERC20(asset).approve(address(POOL), totalDebt);

        return true;
    }
}
```

**Calling the Flash Loan:**
```javascript
const flashLoanContract = await ethers.getContractAt("FlashLoanExample", contractAddress);

await flashLoanContract.executeFlashLoan(
    "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI address
    ethers.utils.parseUnits("10000", 18)           // 10,000 DAI
);
```

---

## Integration Guide

### Setup

**Install Dependencies:**
```bash
npm install @aave/core-v3 @aave/periphery-v3
```

**Contract Addresses:**
```javascript
// Ethereum Mainnet
const POOL = "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2";
const POOL_ADDRESSES_PROVIDER = "0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e";

// Polygon
const POOL = "0x794a61358D6845594F94dc1DB02A252b5b4814aD";
```

### Basic Integration (Ethers.js)

```typescript
import { ethers } from "ethers";

const POOL_ABI = [
    "function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)",
    "function withdraw(address asset, uint256 amount, address to) returns (uint256)",
    "function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf)",
    "function repay(address asset, uint256 amount, uint256 interestRateMode, address onBehalfOf) returns (uint256)",
    "function getUserAccountData(address user) view returns (uint256 totalCollateralBase, uint256 totalDebtBase, uint256 availableBorrowsBase, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)"
];

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);
const pool = new ethers.Contract(POOL_ADDRESS, POOL_ABI, signer);

// Supply
async function supply(asset: string, amount: string) {
    const token = new ethers.Contract(asset, ERC20_ABI, signer);
    await token.approve(POOL_ADDRESS, amount);
    await pool.supply(asset, amount, signer.address, 0);
}

// Borrow
async function borrow(asset: string, amount: string) {
    await pool.borrow(asset, amount, 2, 0, signer.address); // 2 = variable rate
}

// Get user data
async function getUserData(userAddress: string) {
    const data = await pool.getUserAccountData(userAddress);
    return {
        totalCollateral: ethers.utils.formatEther(data.totalCollateralBase),
        totalDebt: ethers.utils.formatEther(data.totalDebtBase),
        availableBorrows: ethers.utils.formatEther(data.availableBorrowsBase),
        healthFactor: ethers.utils.formatEther(data.healthFactor)
    };
}
```

### Reading Protocol Data

**Get Reserve Data:**
```typescript
const POOL_DATA_PROVIDER = "0x7B4EB56E7CD4b454BA8ff71E4518426369a138a3";

const dataProvider = new ethers.Contract(
    POOL_DATA_PROVIDER,
    [
        "function getReserveData(address asset) view returns (uint256 availableLiquidity, uint256 totalStableDebt, uint256 totalVariableDebt, uint256 liquidityRate, uint256 variableBorrowRate, uint256 stableBorrowRate, uint256 averageStableBorrowRate, uint256 liquidityIndex, uint256 variableBorrowIndex, uint40 lastUpdateTimestamp)"
    ],
    provider
);

const reserveData = await dataProvider.getReserveData(USDC_ADDRESS);
console.log("Supply APY:", ethers.utils.formatUnits(reserveData.liquidityRate, 27));
console.log("Borrow APY:", ethers.utils.formatUnits(reserveData.variableBorrowRate, 27));
```

---

## Building on Aave

### Example: Savings Account

```solidity
pragma solidity ^0.8.0;

import "@aave/core-v3/contracts/interfaces/IPool.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SimpleSavings {
    IPool public immutable pool;
    address public immutable asset;

    mapping(address => uint256) public deposits;

    constructor(address _pool, address _asset) {
        pool = IPool(_pool);
        asset = _asset;
    }

    function deposit(uint256 amount) external {
        IERC20(asset).transferFrom(msg.sender, address(this), amount);
        IERC20(asset).approve(address(pool), amount);

        pool.supply(asset, amount, address(this), 0);
        deposits[msg.sender] += amount;
    }

    function withdraw(uint256 amount) external {
        require(deposits[msg.sender] >= amount, "Insufficient balance");

        pool.withdraw(asset, amount, msg.sender);
        deposits[msg.sender] -= amount;
    }
}
```

### Example: Automated Vault

```solidity
contract YieldVault {
    IPool public pool;
    address public asset;

    function autoCompound() external {
        // 1. Check accrued interest (aToken balance increase)
        uint256 interest = aToken.balanceOf(address(this)) - totalDeposits;

        // 2. Withdraw interest
        if (interest > 0) {
            pool.withdraw(asset, interest, address(this));

            // 3. Re-supply to compound
            IERC20(asset).approve(address(pool), interest);
            pool.supply(asset, interest, address(this), 0);

            totalDeposits += interest;
        }
    }
}
```

---

## Resources

### Official Documentation
- [Aave Docs](https://docs.aave.com/)
- [Developer Docs](https://docs.aave.com/developers/)
- [Aave V3 Whitepaper](https://github.com/aave/aave-v3-core/blob/master/techpaper/Aave_V3_Technical_Paper.pdf)

### Smart Contracts
- [Aave V3 Core](https://github.com/aave/aave-v3-core)
- [Aave V3 Periphery](https://github.com/aave/aave-v3-periphery)
- [Deployed Addresses](https://docs.aave.com/developers/deployed-contracts/v3-mainnet)

### Tools & SDKs
- [Aave Utilities (JS)](https://github.com/aave/aave-utilities)
- [Aave Protocol JS](https://github.com/aave/aave-js)
- [Aave Subgraph](https://thegraph.com/hosted-service/subgraph/aave/protocol-v3)

### Interfaces & Apps
- [Aave App](https://app.aave.com/)
- [Aave Analytics](https://governance.aave.com/)
- [Risk Dashboard](https://risk.aave.com/)

### Community
- [Discord](https://discord.gg/aave)
- [Forum](https://governance.aave.com/)
- [Twitter](https://twitter.com/aave)
- [GitHub](https://github.com/aave)

---

## Next Steps

### Beginner
1. ✅ Use Aave app to supply and borrow on testnet
2. ✅ Understand health factor and liquidation
3. ✅ Read smart contract documentation
4. ✅ Experiment with aTokens

### Intermediate
1. ✅ Integrate Aave into your dApp
2. ✅ Build a simple savings contract
3. ✅ Execute a flash loan
4. ✅ Monitor liquidation opportunities

### Advanced
1. ✅ Build a yield aggregator
2. ✅ Create automated liquidation bots
3. ✅ Develop complex flash loan strategies
4. ✅ Build cross-chain lending solutions
5. ✅ Contribute to Aave governance

**Happy Building! 🚀**
