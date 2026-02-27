# Compound Protocol - Complete Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Core Concepts](#core-concepts)
3. [Protocol Versions](#protocol-versions)
4. [How It Works](#how-it-works)
5. [Interest Rates](#interest-rates)
6. [Liquidations](#liquidations)
7. [COMP Token & Governance](#comp-token--governance)
8. [Protocol Architecture (V3)](#protocol-architecture-v3)
9. [Integration Guide](#integration-guide)
10. [Building on Compound](#building-on-compound)
11. [Resources](#resources)

---

## Introduction

**Compound** is a decentralized, algorithmic lending and borrowing protocol built on Ethereum. It was one of the first DeFi protocols to achieve mainstream adoption and is credited with igniting **"DeFi Summer"** in 2020.

Users can:
- **Lend** crypto assets to earn interest automatically
- **Borrow** assets against over-collateralized positions
- **Govern** the protocol through COMP token voting

### Key Stats
- **TVL**: $8+ billion
- **Networks**: Ethereum, Polygon, Arbitrum, Base, Optimism, and more (9 chains)
- **Launched**: 2017 (by Robert Leshner & Geoffrey Hayes)
- **Governance**: COMP token holders

### What Makes Compound Unique
- **Pioneered cTokens**: Interest-bearing tokens representing your deposit
- **Algorithmic interest rates**: Supply & demand determine rates automatically
- **First to distribute governance tokens**: COMP distribution to users was a DeFi first
- **Battle-tested**: One of the longest-running and most audited DeFi protocols

---

## Core Concepts

### 1. **Liquidity Pools**

```
┌─────────────────────────────────────┐
│         USDC Market (V3)            │
├─────────────────────────────────────┤
│                                     │
│  Suppliers (Lenders)                │
│  └─► Deposit USDC (base asset)     │
│  └─► Receive cUSDCv3 tokens        │
│  └─► Earn interest                 │
│                                     │
│  Borrowers                          │
│  └─► Supply collateral (ETH, WBTC) │
│  └─► Borrow USDC                   │
│  └─► Pay interest                  │
│                                     │
└─────────────────────────────────────┘
```

### 2. **cTokens** (Interest-bearing Tokens)

When you supply assets, you receive **cTokens** in return:

**Compound V2 (exchange rate model):**
```
Deposit: 1,000 USDC
Receive: ~46,000 cUSDC (at exchange rate of ~0.0217)

Over time, exchange rate increases:
Your 46,000 cUSDC × 0.0220 = 1,012 USDC
Profit: $12 in interest
```

**Compound V3 (rebasing model):**
```
Deposit: 1,000 USDC
Receive: 1,000 cUSDCv3

After 1 year @ 5% APY:
Your cUSDCv3 balance automatically increases to: 1,050
Redeemable for: 1,050 USDC
```

**Key Properties:**
- ✅ **ERC-20 compatible** (transferable, composable)
- ✅ **Auto-accruing interest** (balance or exchange rate grows)
- ✅ **Redeemable** for underlying asset at any time
- ✅ **Usable in other DeFi protocols** (as collateral, in vaults, etc.)

### 3. **Over-Collateralization**

All borrows must be backed by collateral worth **more** than the loan:

```
Example:
Collateral Factor for ETH: 82%

Supply: 1 ETH @ $3,000
Max Borrow: $3,000 × 0.82 = $2,460

Borrow: $1,500 USDC ✅ (within limit)
Borrow: $2,500 USDC ❌ (exceeds collateral factor)
```

### 4. **Utilization Rate**

The key metric driving interest rates:

```
Utilization Rate = Total Borrows / Total Supply

Example:
Total USDC Supplied: $100M
Total USDC Borrowed: $80M
Utilization Rate: 80%
```

---

## Protocol Versions

### Compound V1 (2018)
- First version, basic lending pool
- Monolithic contract
- Limited asset support

### Compound V2 (2019)
- **Multi-asset model**: Each asset has its own cToken market
- **cTokens**: Exchange rate model (cUSDC, cETH, cDAI, etc.)
- **Comptroller**: Central contract managing all markets
- **COMP distribution**: Governance token rewards
- Supply and borrow rates are **codependent**

### Compound V3 / Compound III (2022) — Current
- **Single borrowable asset per market**: Each deployment focuses on one base asset (e.g., USDC or ETH)
- **Rebasing cToken**: Balance increases directly (no exchange rate math)
- **Separate interest rate curves**: Supply and borrow rates calculated independently
- **No interest on collateral**: Collateral earns nothing but gets better terms
- **Lower liquidation penalties**: More gradual liquidation process
- **Gas efficient**: Optimized storage and immutable configuration

### V2 vs V3 Comparison

| Feature | Compound V2 | Compound V3 |
|---------|-------------|-------------|
| Market Model | Multi-asset pools | Single base asset per market |
| cToken | Exchange rate based | Rebasing balance |
| Collateral Interest | Earns interest | No interest |
| Interest Rate Calc | Supply/borrow codependent | Calculated separately |
| Liquidation | Up to 50% at once | Gradual absorption |
| Gas Cost | Higher | Lower |
| Collateral Ownership | Protocol holds it | Borrower retains ownership |

---

## How It Works

### 1. **Supplying (Lending)**

**Process:**
```
1. User approves Comet contract to spend tokens
2. User calls supply(asset, amount)
3. Comet transfers tokens from user
4. If base asset → user earns interest (balance increases)
5. If collateral → no interest, but enables borrowing
```

**Smart Contract Call (V3):**
```solidity
// Approve Comet to spend your USDC
IERC20(usdc).approve(cometAddress, amount);

// Supply USDC (base asset) to earn interest
IComet(comet).supply(usdc, amount);

// Supply ETH (as collateral) to enable borrowing
IComet(comet).supply(weth, collateralAmount);
```

### 2. **Borrowing**

In V3, you can only borrow the **base asset** (e.g., USDC in the USDC market).

**Requirements:**
- ✅ Sufficient collateral supplied
- ✅ Borrow amount within collateral factor limits
- ✅ Liquidity available in the market

**Process:**
```
1. User supplies collateral (e.g., WETH, WBTC)
2. User calls withdraw() for the base asset
3. Comet checks collateral requirements
4. Comet transfers base asset to user
5. User's account now has a negative balance (debt)
6. Interest accrues on the debt
```

**Smart Contract Call (V3):**
```solidity
// First, supply collateral
IComet(comet).supply(weth, collateralAmount);

// Then borrow the base asset (withdraw creates a borrow)
IComet(comet).withdraw(usdc, borrowAmount);
```

**Example:**
```
Collateral: 1 WETH @ $3,000 (Collateral Factor: 82%)
Max Borrow: $3,000 × 0.82 = $2,460

Borrow: $1,500 USDC ✅
Account balance: -1,500 USDC (debt grows with interest)
```

### 3. **Repaying**

**Process:**
```
1. User approves Comet to spend tokens
2. User calls supply() with the base asset
3. If user has a negative balance, supply reduces the debt first
4. If supply exceeds debt, remainder becomes a lending position
```

**Smart Contract Call (V3):**
```solidity
// Approve and repay (supply the base asset to reduce debt)
IERC20(usdc).approve(cometAddress, repayAmount);
IComet(comet).supply(usdc, repayAmount);
```

### 4. **Withdrawing**

**Process:**
```
1. User calls withdraw(asset, amount)
2. If withdrawing base asset (positive balance) → reduces lending position
3. If withdrawing collateral → Comet checks that borrow limits are still met
4. Comet transfers asset to user
```

**Smart Contract Call (V3):**
```solidity
// Withdraw base asset (your supplied USDC + interest)
IComet(comet).withdraw(usdc, amount);

// Withdraw collateral (only if borrow limits are still satisfied)
IComet(comet).withdraw(weth, collateralAmount);
```

---

## Interest Rates

### Interest Rate Model

Compound uses a **kink-based interest rate model** driven by utilization:

```
Utilization Rate (U) = Total Borrows / Total Supply

Borrow Rate:
- If U ≤ U_kink: Rate = Base + U × BorrowPerSecondInterestRateSlopeLow
- If U > U_kink: Rate = Base + (U_kink × SlopeLow) + (U - U_kink) × SlopeHigh

Supply Rate (V3 - calculated independently):
- If U ≤ U_kink: Rate = U × SupplyPerSecondInterestRateSlopeLow
- If U > U_kink: Rate = (U_kink × SlopeLow) + (U - U_kink) × SlopeHigh
```

### Interest Rate Curve

```
Interest Rate Graph:
     |
 60% |                            ╱
     |                         ╱
     |                      ╱   ← Steep slope above kink
     |                   ╱
  4% |              ╱
     |          ╱       ← Gentle slope below kink
     |      ╱
  0% |__╱
     0%   30%   60%   80%   100%
          Utilization Rate
                   ↑
               U_kink (e.g., 80%)
```

**Key Insight**: The "kink" creates urgency. When utilization exceeds the optimal point, rates spike dramatically to:
- Encourage more suppliers (higher supply APY)
- Discourage borrowers (higher borrow APY)
- Bring utilization back to optimal range

### V3 vs V2 Interest Rate Difference

**V2**: Supply rate is derived from the borrow rate:
```
Supply Rate = Borrow Rate × Utilization × (1 - Reserve Factor)
```

**V3**: Supply and borrow rates are **independent functions** of utilization:
```
Supply Rate = f(Utilization)  ← own curve
Borrow Rate = g(Utilization)  ← own curve
```

This gives governance more flexibility to tune rates for each side independently.

---

## Liquidations

### When Liquidation Occurs

A position becomes liquidatable when borrowed value exceeds the **liquidation collateral factor**:

```
Borrow Collateral Factor: 82%  (max you can borrow)
Liquidation Collateral Factor: 85%  (when liquidation triggers)

The gap between these two provides a safety buffer.
```

**Example:**
```
Initial State:
Collateral: 1 WETH @ $3,000
Liquidation Collateral Factor: 85%
Borrowed: $2,400 USDC
Borrow Limit: $3,000 × 0.85 = $2,550  ✅ Safe

WETH drops to $2,800:
Borrow Limit: $2,800 × 0.85 = $2,380  ❌ $2,400 > $2,380 → LIQUIDATABLE
```

### V3 Liquidation Process (Absorption)

V3 uses an **absorption** model instead of V2's partial liquidation:

```
1. Anyone calls absorb(account) on the Comet contract
2. Comet seizes ALL collateral from the underwater account
3. Comet repays the account's debt from protocol reserves
4. Account's collateral value minus penalty is credited back
5. Seized collateral is sold via buyCollateral() at a discount
```

**Key Differences from V2:**
- **No close factor** — entire position is absorbed at once
- **Liquidators buy collateral** from the protocol at a discount (not directly from borrower)
- **Lower penalties** for borrowers
- **Protocol absorbs first** — liquidators buy later

### Smart Contract Call

```solidity
// Absorb an underwater account
address[] memory accounts = new address[](1);
accounts[0] = underwaterUser;
IComet(comet).absorb(msg.sender, accounts);

// Buy discounted collateral from the protocol
IComet(comet).buyCollateral(
    weth,           // collateral asset to buy
    minAmount,      // minimum collateral to receive
    baseAmount,     // base asset to pay
    recipient       // where to send collateral
);
```

### Protecting Against Liquidation

**Strategies:**
1. **Keep borrow well below limit**: Use only 50-60% of max borrow capacity
2. **Monitor collateral prices**: Set up alerts for price drops
3. **Add collateral early**: Top up when prices trend down
4. **Repay partial debt**: Reduce borrowed amount to improve health
5. **Use stablecoins as collateral**: Lower volatility = lower liquidation risk

---

## COMP Token & Governance

### COMP Token

**COMP** is Compound's governance token:

```
Total Supply: 10,000,000 COMP
Distribution:
├── Shareholders: 23.96%
├── Founders/Team: 22.26%
├── Future Team: 3.73%
├── Users (protocol distribution): 42.15%
└── Community / Governance: 7.90%
```

**COMP Distribution to Users:**
- COMP is distributed to lenders and borrowers proportionally
- Earned based on the amount of supply/borrow activity
- Distributed automatically every Ethereum block (~12 seconds)
- Creates an additional incentive layer on top of interest

### Governance Process

```
Compound Governance Flow:

1. PROPOSAL
   └─► Any address with ≥ 25,000 COMP can propose
   └─► Proposal includes executable code

2. VOTING PERIOD (3 days)
   └─► COMP holders vote For / Against / Abstain
   └─► Quorum: 400,000 COMP required

3. TIMELOCK (2 days)
   └─► Approved proposals wait in timelock
   └─► Community can review before execution

4. EXECUTION
   └─► Anyone can execute after timelock
   └─► Changes take effect on-chain
```

**What Governance Controls:**
- Adding/removing supported assets
- Adjusting collateral factors
- Changing interest rate models
- Upgrading protocol contracts
- Managing reserve funds
- Protocol parameter tuning

### Governance Smart Contract

```solidity
// Delegate votes
IComp(comp).delegate(delegatee);

// Create a proposal
IGovernorBravo(governor).propose(
    targets,        // contract addresses to call
    values,         // ETH values
    signatures,     // function signatures
    calldatas,      // encoded parameters
    description     // human-readable description
);

// Cast a vote
IGovernorBravo(governor).castVote(proposalId, support);
// support: 0 = Against, 1 = For, 2 = Abstain
```

---

## Protocol Architecture (V3)

### Smart Contract Structure

```
Compound V3 (Comet)
│
├── Comet.sol (Main Contract - behind proxy)
│   ├── supply()         — supply base asset or collateral
│   ├── withdraw()       — withdraw or borrow
│   ├── absorb()         — liquidate underwater accounts
│   ├── buyCollateral()  — purchase liquidated collateral
│   ├── getPrice()       — get asset price from oracle
│   └── accrueAccount()  — update interest for an account
│
├── CometStorage.sol
│   └── All storage variables defined here (single source of truth)
│
├── CometCore.sol
│   └── Interest accrual logic and accounting
│
├── CometExt.sol (Extension - handles 24KB limit)
│   └── ERC-20 functionality (transfer, approve, balanceOf)
│   └── Non-standard approve (only 0 or type(uint256).max)
│
├── CometConfiguration.sol
│   └── Immutable variables for rates, factors, etc.
│   └── Changing config = deploy new implementation
│
├── Configurator.sol
│   └── Governance-controlled configuration
│   └── Deploys new Comet implementations
│
├── CometProxyAdmin.sol
│   └── Manages proxy upgrades
│
├── CometRewards.sol
│   └── COMP token distribution to users
│
└── Price Feeds (Chainlink Oracles)
    └── Provides real-time asset prices
```

### Key Design Decisions

**1. Immutable Configuration:**
```
Interest rates, collateral factors, and liquidation parameters
are stored as immutable variables (not in storage).

To change parameters:
1. Governance approves new configuration
2. New Comet implementation is deployed with new immutables
3. Proxy is updated to point to new implementation

Why? Gas savings — reading immutable vars is cheaper than storage.
```

**2. Fallback Extension Pattern:**
```
Comet.sol exceeds 24KB Ethereum contract size limit.

Solution:
┌──────────┐     fallback()     ┌──────────────┐
│ Comet.sol │ ──────────��───── → │ CometExt.sol │
│  (proxy)  │   delegatecall     │  (ERC-20 +   │
│           │                    │   extras)     │
└──────────┘                     └──────────────┘

If a function isn't found in Comet, it delegates to CometExt.
```

**3. Single Storage Contract:**
```
CometStorage.sol defines ALL storage variables.
No other contract in the inheritance chain has storage.

This prevents storage collision bugs that plague upgradeable contracts.
```

### Asset Configuration

```solidity
// Each collateral asset has these parameters:
struct AssetConfig {
    address asset;                  // Token address
    address priceFeed;              // Chainlink oracle
    uint8 decimals;                 // Token decimals
    uint64 borrowCollateralFactor;  // Max borrow against this (e.g., 82%)
    uint64 liquidateCollateralFactor; // Liquidation trigger (e.g., 85%)
    uint64 liquidationFactor;       // Value returned after liquidation
    uint128 supplyCap;              // Maximum supply allowed
}
```

---

## Integration Guide

### Setup

**Install Dependencies:**
```bash
npm install @compound-finance/compound-js ethers
```

**Key Contract Addresses (Ethereum Mainnet):**
```javascript
// Compound V3 - USDC Market
const COMET_USDC = "0xc3d688B66703497DAA19211EEdff47f25384cdc3";

// Compound V3 - WETH Market
const COMET_WETH = "0xA17581A9E3356d9A858b789D68B4d866e593aE94";

// COMP Token
const COMP = "0xc00e94Cb662C3520282E6f5717214004A7f26888";

// Governance
const GOVERNOR_BRAVO = "0xc0Da02939E1441F497fd74F78cE7Decb17B66529";
const TIMELOCK = "0x6d903f6003cca6255D85CcA4D3B5E5146dC33925";
```

### Basic Integration (Ethers.js)

```typescript
import { ethers } from "ethers";

const COMET_ABI = [
    "function supply(address asset, uint amount)",
    "function withdraw(address asset, uint amount)",
    "function balanceOf(address account) view returns (uint256)",
    "function borrowBalanceOf(address account) view returns (uint256)",
    "function getSupplyRate(uint utilization) view returns (uint64)",
    "function getBorrowRate(uint utilization) view returns (uint64)",
    "function getUtilization() view returns (uint)",
    "function getPrice(address priceFeed) view returns (uint256)",
    "function collateralBalanceOf(address account, address asset) view returns (uint128)",
    "function isLiquidatable(address account) view returns (bool)",
    "function absorb(address absorber, address[] memory accounts)",
    "function buyCollateral(address asset, uint minAmount, uint baseAmount, address recipient)"
];

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);
const comet = new ethers.Contract(COMET_USDC, COMET_ABI, signer);

// Supply USDC to earn interest
async function supplyUSDC(amount: string) {
    const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, signer);
    await usdc.approve(COMET_USDC, amount);
    await comet.supply(USDC_ADDRESS, amount);
    console.log("Supplied USDC");
}

// Supply collateral (e.g., WETH) to enable borrowing
async function supplyCollateral(amount: string) {
    const weth = new ethers.Contract(WETH_ADDRESS, ERC20_ABI, signer);
    await weth.approve(COMET_USDC, amount);
    await comet.supply(WETH_ADDRESS, amount);
    console.log("Supplied WETH as collateral");
}

// Borrow USDC (withdraw creates a borrow if no base balance)
async function borrowUSDC(amount: string) {
    await comet.withdraw(USDC_ADDRESS, amount);
    console.log("Borrowed USDC");
}

// Repay borrow (supply base asset reduces debt)
async function repayUSDC(amount: string) {
    const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, signer);
    await usdc.approve(COMET_USDC, amount);
    await comet.supply(USDC_ADDRESS, amount);
    console.log("Repaid USDC");
}

// Check account status
async function getAccountInfo(address: string) {
    const balance = await comet.balanceOf(address);
    const borrowBalance = await comet.borrowBalanceOf(address);
    const utilization = await comet.getUtilization();
    const supplyRate = await comet.getSupplyRate(utilization);
    const borrowRate = await comet.getBorrowRate(utilization);
    const isLiquidatable = await comet.isLiquidatable(address);

    return {
        lendingBalance: ethers.utils.formatUnits(balance, 6),
        borrowBalance: ethers.utils.formatUnits(borrowBalance, 6),
        utilization: (utilization / 1e18 * 100).toFixed(2) + "%",
        supplyAPR: (supplyRate * 31536000 / 1e18 * 100).toFixed(2) + "%",
        borrowAPR: (borrowRate * 31536000 / 1e18 * 100).toFixed(2) + "%",
        isLiquidatable
    };
}
```

### Reading Protocol Data

```typescript
// Get collateral information for an account
async function getCollateralInfo(account: string, asset: string) {
    const collateralBalance = await comet.collateralBalanceOf(account, asset);
    console.log("Collateral:", ethers.utils.formatEther(collateralBalance));
}

// Get current market rates
async function getMarketRates() {
    const utilization = await comet.getUtilization();

    const supplyRate = await comet.getSupplyRate(utilization);
    const borrowRate = await comet.getBorrowRate(utilization);

    // Convert per-second rate to APR
    const secondsPerYear = 31536000;
    const supplyAPR = (supplyRate / 1e18) * secondsPerYear * 100;
    const borrowAPR = (borrowRate / 1e18) * secondsPerYear * 100;

    console.log(`Utilization: ${(utilization / 1e18 * 100).toFixed(2)}%`);
    console.log(`Supply APR: ${supplyAPR.toFixed(2)}%`);
    console.log(`Borrow APR: ${borrowAPR.toFixed(2)}%`);
}
```

---

## Building on Compound

### Example: Automated Lending Vault

```solidity
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IComet {
    function supply(address asset, uint amount) external;
    function withdraw(address asset, uint amount) external;
    function balanceOf(address account) external view returns (uint256);
}

contract CompoundVault {
    IComet public immutable comet;
    IERC20 public immutable baseAsset;

    mapping(address => uint256) public userDeposits;

    constructor(address _comet, address _baseAsset) {
        comet = IComet(_comet);
        baseAsset = IERC20(_baseAsset);
    }

    function deposit(uint256 amount) external {
        baseAsset.transferFrom(msg.sender, address(this), amount);
        baseAsset.approve(address(comet), amount);
        comet.supply(address(baseAsset), amount);
        userDeposits[msg.sender] += amount;
    }

    function withdraw(uint256 amount) external {
        require(userDeposits[msg.sender] >= amount, "Insufficient deposit");
        comet.withdraw(address(baseAsset), amount);
        baseAsset.transfer(msg.sender, amount);
        userDeposits[msg.sender] -= amount;
    }

    function getAccruedInterest() external view returns (uint256) {
        uint256 totalBalance = comet.balanceOf(address(this));
        uint256 totalDeposits = _getTotalDeposits();
        if (totalBalance > totalDeposits) {
            return totalBalance - totalDeposits;
        }
        return 0;
    }

    function _getTotalDeposits() internal view returns (uint256 total) {
        // In production, track this with a state variable
        return 0;
    }
}
```

### Example: Liquidation Bot Logic

```solidity
contract CompoundLiquidator {
    IComet public immutable comet;
    IERC20 public immutable baseAsset;

    constructor(address _comet, address _baseAsset) {
        comet = IComet(_comet);
        baseAsset = IERC20(_baseAsset);
    }

    function liquidate(address[] calldata accounts) external {
        // Step 1: Absorb underwater accounts
        comet.absorb(address(this), accounts);

        // Step 2: Buy discounted collateral from the protocol
        // The protocol now holds the seized collateral
        // Liquidators can buy it at a discount using buyCollateral()
    }

    function buyDiscountedCollateral(
        address collateralAsset,
        uint256 minCollateralAmount,
        uint256 baseAssetAmount
    ) external {
        baseAsset.approve(address(comet), baseAssetAmount);
        comet.buyCollateral(
            collateralAsset,
            minCollateralAmount,
            baseAssetAmount,
            msg.sender
        );
    }
}
```

### Compound V2 Quick Reference (Legacy)

If you encounter V2 integrations:

```solidity
// V2 uses individual cToken contracts per asset
interface ICToken {
    function mint(uint amount) external returns (uint);      // Supply
    function redeem(uint amount) external returns (uint);     // Withdraw cTokens
    function redeemUnderlying(uint amount) external returns (uint); // Withdraw underlying
    function borrow(uint amount) external returns (uint);     // Borrow
    function repayBorrow(uint amount) external returns (uint); // Repay
    function exchangeRateCurrent() external returns (uint);   // cToken → underlying rate
}

// Supply to V2
IERC20(usdc).approve(cUsdcAddress, amount);
ICToken(cUsdc).mint(amount);  // Returns 0 on success

// Borrow from V2 (must enter market first via Comptroller)
IComptroller(comptroller).enterMarkets([cEthAddress]);
ICToken(cUsdc).borrow(amount);
```

---

## Resources

### Official Documentation
- [Compound III Docs](https://docs.compound.finance/)
- [Compound Whitepaper](https://compound.finance/documents/Compound.Whitepaper.pdf)
- [Compound Governance](https://compound.finance/governance)

### Smart Contracts & Code
- [Comet (V3) GitHub](https://github.com/compound-finance/comet)
- [Compound Protocol (V2) GitHub](https://github.com/compound-finance/compound-protocol)
- [Developer FAQ & Examples](https://github.com/compound-developers/compound-3-developer-faq)
- [Supply Examples](https://github.com/compound-developers/compound-supply-examples)
- [Borrow Examples](https://github.com/compound-developers/compound-borrow-examples)

### Learning Resources
- [RareSkills - Compound V3 Architecture](https://rareskills.io/post/compound-v3-contracts-tutorial)
- [RareSkills - Compound V3 Book](https://rareskills.io/compound-v3-book)
- [RareSkills - cUSDCv3 as Rebasing Token](https://rareskills.io/post/cusdc-v3-compound)

### Tools & Interfaces
- [Compound App](https://app.compound.finance/)
- [Compound Markets Dashboard](https://compound.finance/markets)
- [Compound.js SDK](https://docs.compound.finance/compound-js/)

### Community
- [Discord](https://discord.com/invite/compound)
- [Forum](https://www.comp.xyz/)
- [Twitter/X](https://twitter.com/compaborrowund)
- [GitHub](https://github.com/compound-finance)

---

## Compound vs Aave - Quick Comparison

| Feature | Compound V3 | Aave V3 |
|---------|-------------|---------|
| Market Model | Single base asset per market | Multi-asset pools |
| Interest Tokens | cTokens (rebasing) | aTokens (rebasing) |
| Collateral Interest | No | Yes |
| Flash Loans | No (V3) | Yes |
| Liquidation | Absorption model | Partial liquidation |
| Rate Model | Independent supply/borrow curves | Supply derived from borrow |
| Governance Token | COMP | AAVE |
| Cross-chain | 9 chains | 10+ chains |

---

## Next Steps

### Beginner
1. ✅ Use the [Compound App](https://app.compound.finance/) to supply and borrow on testnet
2. ✅ Understand collateral factors and liquidation thresholds
3. ✅ Read the Compound III documentation
4. ✅ Compare Compound with Aave to understand DeFi lending design choices

### Intermediate
1. ✅ Integrate Compound V3 into a dApp using ethers.js
2. ✅ Build a simple vault contract on top of Comet
3. ✅ Explore the Comet.sol source code on GitHub
4. ✅ Monitor and analyze liquidation events

### Advanced
1. ✅ Build a liquidation bot with buyCollateral arbitrage
2. ✅ Create a yield optimizer that routes between Compound and Aave
3. ✅ Develop cross-chain lending strategies
4. ✅ Participate in Compound governance with proposals
5. ✅ Study the interest rate model math in depth

**Happy Building!**
