# Aave Versioning, Events & Data Architecture

## Table of Contents
1. [Aave Version History](#aave-version-history)
2. [Smart Contract Events](#smart-contract-events)
3. [Data Architecture Per Version](#data-architecture-per-version)
4. [User Data Model](#user-data-model)
5. [Querying User Positions](#querying-user-positions)

---

## Aave Version History

### Version Comparison

| Feature | Aave V1 | Aave V2 | Aave V3 |
|---------|---------|---------|---------|
| Launch | Jan 2020 | Dec 2020 | Mar 2022 |
| Chains | Ethereum | Ethereum | Multi-chain |
| Debt Tokens | No | Yes | Yes |
| Flash Loans | Basic | Improved | Batch + Simple |
| Governance | Basic | AAVE Token | Enhanced |
| Capital Efficiency | Low | Medium | High |
| Interest Rates | Variable/Stable | Variable/Stable | Variable/Stable + GHO |
| Risk Management | Basic | Improved | Isolation + E-Mode |

---

### Aave V1 (Legacy)

**Key Contracts:**
- `LendingPool` - Main interaction point
- `LendingPoolCore` - Holds all assets
- `aTokens` - Interest-bearing tokens

**Architecture:**
```
User → LendingPool → LendingPoolCore → aToken
```

**Limitations:**
- Single chain (Ethereum only)
- Lower capital efficiency
- No debt tokenization
- No credit delegation

---

### Aave V2

**Key Improvements:**
1. **Debt Tokenization**: Debt represented as tokens (transferable)
2. **Credit Delegation**: Borrow on someone else's behalf
3. **Flash Loan Batching**: Borrow multiple assets in one flash loan
4. **Native Gas Optimization**: Cheaper transactions

**Key Contracts:**
- `Pool` (was `LendingPool`)
- `aTokens` - Supply tokens
- `VariableDebtToken` - Variable rate debt
- `StableDebtToken` - Stable rate debt
- `IncentivesController` - Rewards distribution

**Architecture:**
```
User
├── supply() ──► Pool ──► aToken (minted to user)
├── borrow() ──► Pool ──► DebtToken (minted to user)
├── repay()  ──► Pool ──► DebtToken (burned)
└── withdraw()──► Pool ──► aToken (burned)
```

---

### Aave V3 (Current)

**Major New Features:**

#### 1. Portal (Cross-Chain)
```
Ethereum Pool ◄──── Portal Bridge ────► Polygon Pool
     │                                      │
     └── Burn aTokens                       └── Mint aTokens

User moves position from Ethereum to Polygon seamlessly
```

#### 2. Efficiency Mode (E-Mode)
Categories of correlated assets with higher LTV:

```
E-Mode Category: Stablecoins
├── USDC (LTV: 97%, Liquidation Threshold: 97.5%)
├── USDT (LTV: 97%, Liquidation Threshold: 97.5%)
└── DAI  (LTV: 97%, Liquidation Threshold: 97.5%)

Normal Mode:
├── USDC (LTV: 80%, Liquidation Threshold: 85%)
```

#### 3. Isolation Mode
New risky assets can be listed with caps:

```
Isolation Mode Asset: NEW_TOKEN
├── Debt Ceiling: $10M (limits total borrowing)
├── Can only borrow: Stablecoins
└── Cannot be used with other collateral
```

#### 4. Supply & Borrow Caps
```
ETH:
├── Supply Cap: 1,000,000 ETH
└── Borrow Cap: 500,000 ETH
```

---

## Smart Contract Events

Events are the primary way to track what happens on-chain. Every key action emits an event.

### V3 Core Events

#### Supply Event
Emitted when a user deposits assets.

```solidity
event Supply(
    address indexed reserve,      // Asset address (e.g., USDC)
    address user,                 // Who initiated the supply
    address indexed onBehalfOf,   // Who receives the aTokens
    uint256 amount,               // Amount supplied
    uint16 indexed referralCode   // Referral tracking
);
```

**Example Log:**
```json
{
    "event": "Supply",
    "args": {
        "reserve": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        "user": "0x1234...5678",
        "onBehalfOf": "0x1234...5678",
        "amount": "1000000000",
        "referralCode": 0
    }
}
```

#### Withdraw Event
Emitted when a user withdraws assets.

```solidity
event Withdraw(
    address indexed reserve,   // Asset address
    address indexed user,      // Who initiated
    address indexed to,        // Who receives the tokens
    uint256 amount             // Amount withdrawn
);
```

#### Borrow Event
Emitted when a user borrows assets.

```solidity
event Borrow(
    address indexed reserve,        // Asset borrowed
    address user,                   // Who initiated
    address indexed onBehalfOf,     // Who receives the debt
    uint256 amount,                 // Amount borrowed
    uint8 interestRateMode,         // 1 = Stable, 2 = Variable
    uint256 borrowRate,             // Interest rate at time of borrow
    uint16 indexed referralCode
);
```

#### Repay Event
```solidity
event Repay(
    address indexed reserve,        // Asset repaid
    address indexed user,           // Whose debt is repaid
    address indexed repayer,        // Who paid
    uint256 amount,                 // Amount repaid
    bool useATokens                 // Repaid using aTokens?
);
```

#### LiquidationCall Event
```solidity
event LiquidationCall(
    address indexed collateralAsset,    // Collateral seized
    address indexed debtAsset,          // Debt repaid
    address indexed user,               // User liquidated
    uint256 debtToCover,                // Debt amount covered
    uint256 liquidatedCollateralAmount, // Collateral amount seized
    address liquidator,                 // Who performed liquidation
    bool receiveAToken                  // Liquidator receives aToken?
);
```

#### ReserveDataUpdated Event
Emitted on every interaction (shows current rates).

```solidity
event ReserveDataUpdated(
    address indexed reserve,
    uint256 liquidityRate,        // Current supply APY (ray)
    uint256 stableBorrowRate,     // Current stable borrow rate
    uint256 variableBorrowRate,   // Current variable borrow rate
    uint256 liquidityIndex,       // Cumulative supply index
    uint256 variableBorrowIndex   // Cumulative borrow index
);
```

### How Events Map to User Actions

```
User Action         → Event(s) Emitted
─────────────────────────────────────────────────
Deposit USDC        → Supply + ReserveDataUpdated
Withdraw USDC       → Withdraw + ReserveDataUpdated
Borrow ETH          → Borrow + ReserveDataUpdated
Repay ETH           → Repay + ReserveDataUpdated
Get Liquidated      → LiquidationCall + ReserveDataUpdated
Enable Collateral   → ReserveUsedAsCollateralEnabled
Disable Collateral  → ReserveUsedAsCollateralDisabled
Swap Rate Mode      → SwapBorrowRateMode + ReserveDataUpdated
Flash Loan          → FlashLoan + ReserveDataUpdated
```

---

## Data Architecture Per Version

### V2 vs V3 Contract Addresses

**Ethereum Mainnet - V2:**
```
Pool:                   0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9
PoolDataProvider:       0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d
Oracle:                 0xA50ba011c48153De246E5192C8f9258A2ba79Ca9
```

**Ethereum Mainnet - V3:**
```
Pool:                   0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2
PoolDataProvider:       0x7B4EB56E7CD4b454BA8ff71E4518426369a138a3
Oracle:                 0x54586bE62E3c3580375aE3723C145253060Ca0C2
PoolAddressesProvider:  0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e
```

**Multi-chain V3:**
```
Polygon:    0x794a61358D6845594F94dc1DB02A252b5b4814aD
Arbitrum:   0x794a61358D6845594F94dc1DB02A252b5b4814aD
Optimism:   0x794a61358D6845594F94dc1DB02A252b5b4814aD
Avalanche:  0x794a61358D6845594F94dc1DB02A252b5b4814aD
```

### Event Topic Hashes (For Direct Log Filtering)

```
Supply:             0x2b627736bca15cd5381dcf80b0bf11fd197d01a037c52b927a881a10fb73ba61
Withdraw:           0x3115d1449a7b732c986cba18244e897a145b9f0689daa82423a900c55b77a615
Borrow:             0xb3d084820fb1a9decffb176436bd02558d15fac9b0ddfed8c465bc7359d7dce0
Repay:              0xa534c8dbe71f871f9f3f77571e29eb68dd6fc07b1c2e31ebc018f7f00f56fde2
LiquidationCall:    0xe413a321e8681d831f4dbccbca790d2952b56f977908e45be37335533e005286
```

---

## User Data Model

### What Data Exists Per User

```
User Account (address)
│
├── Supplied Assets (for each reserve)
│   ├── aToken Balance (current supply + accrued interest)
│   ├── Scaled Balance (balance without interest)
│   ├── Is Using As Collateral (bool)
│   └── Supply History (from events)
│
├── Borrowed Assets (for each reserve)
│   ├── Variable Debt Balance
│   ├── Stable Debt Balance
│   ├── Borrow Rate
│   └── Borrow History (from events)
│
├── Account Summary
│   ├── Total Collateral (USD)
│   ├── Total Debt (USD)
│   ├── Available Borrows (USD)
│   ├── Current Liquidation Threshold
│   ├── LTV
│   └── Health Factor
│
└── E-Mode (V3 only)
    ├── Category ID
    └── Category Config
```

### On-Chain View Functions

**Get User Account Data:**
```solidity
function getUserAccountData(address user) external view returns (
    uint256 totalCollateralBase,       // Total collateral in base currency (USD, 8 decimals)
    uint256 totalDebtBase,             // Total debt in base currency
    uint256 availableBorrowsBase,      // Remaining borrow power
    uint256 currentLiquidationThreshold,
    uint256 ltv,
    uint256 healthFactor               // 1e18 = 1.0
);
```

**Get User Reserve Data:**
```solidity
function getUserReserveData(address asset, address user) external view returns (
    uint256 currentATokenBalance,       // Supply balance + interest
    uint256 currentStableDebt,          // Stable debt + interest
    uint256 currentVariableDebt,        // Variable debt + interest
    uint256 principalStableDebt,        // Original stable debt
    uint256 scaledVariableDebt,         // Scaled variable debt
    uint256 stableBorrowRate,           // User's stable rate
    uint256 liquidityRate,              // Current supply rate
    uint40 stableRateLastUpdated,       // Timestamp
    bool usageAsCollateralEnabled       // Is collateral enabled
);
```

---

## Querying User Positions

### Method 1: Direct RPC Calls

```typescript
import { ethers } from "ethers";

const DATA_PROVIDER_ABI = [
    "function getUserReserveData(address asset, address user) view returns (uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint40, bool)",
    "function getAllReservesTokens() view returns (tuple(string symbol, address tokenAddress)[])"
];

const POOL_ABI = [
    "function getUserAccountData(address user) view returns (uint256, uint256, uint256, uint256, uint256, uint256)"
];

async function getUserPositions(userAddress: string) {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const dataProvider = new ethers.Contract(DATA_PROVIDER_ADDRESS, DATA_PROVIDER_ABI, provider);
    const pool = new ethers.Contract(POOL_ADDRESS, POOL_ABI, provider);

    // Get all reserves
    const reserves = await dataProvider.getAllReservesTokens();

    // Get account summary
    const accountData = await pool.getUserAccountData(userAddress);

    // Get per-reserve data
    const positions = [];
    for (const reserve of reserves) {
        const data = await dataProvider.getUserReserveData(reserve.tokenAddress, userAddress);
        if (data[0] > 0 || data[1] > 0 || data[2] > 0) {
            positions.push({
                symbol: reserve.symbol,
                asset: reserve.tokenAddress,
                aTokenBalance: data[0].toString(),
                stableDebt: data[1].toString(),
                variableDebt: data[2].toString(),
                isCollateral: data[8]
            });
        }
    }

    return { accountData, positions };
}
```

### Method 2: Event Indexing

```typescript
// Get all Supply events for a user
const filter = pool.filters.Supply(null, null, userAddress);
const events = await pool.queryFilter(filter, fromBlock, toBlock);

// Parse events
const supplies = events.map(e => ({
    asset: e.args.reserve,
    amount: e.args.amount.toString(),
    block: e.blockNumber,
    txHash: e.transactionHash
}));
```

### Method 3: The Graph (Recommended for Historical Data)

```graphql
{
  user(id: "0x1234...5678") {
    id
    borrowHistory {
      amount
      reserve {
        symbol
        name
      }
      timestamp
    }
    supplyHistory {
      amount
      reserve {
        symbol
        name
      }
      timestamp
    }
    liquidationHistory {
      collateralAmount
      debtAmount
      timestamp
    }
  }
}
```

See the **Graph Protocol Guide** for detailed setup.

---

## Key Takeaways

1. **V3 is the current standard** - Use V3 for new integrations
2. **Events are your primary data source** - Every action emits detailed events
3. **Use The Graph for historical data** - Much more efficient than scanning blocks
4. **Use RPC calls for current state** - `getUserAccountData()` and `getUserReserveData()`
5. **Account for decimals** - Different assets have different decimal places (USDC = 6, ETH = 18)
6. **Ray units** - Interest rates use "ray" format (27 decimals, where 1e27 = 100%)
