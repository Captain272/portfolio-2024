# The Graph Protocol - Complete Guide

## Table of Contents
1. [Introduction](#introduction)
2. [How The Graph Works](#how-the-graph-works)
3. [Core Concepts](#core-concepts)
4. [Querying Aave Data](#querying-aave-data)
5. [Building a Subgraph](#building-a-subgraph)
6. [GraphQL Query Reference](#graphql-query-reference)
7. [Integration with Code](#integration-with-code)
8. [Resources](#resources)

---

## Introduction

**The Graph** is a decentralized indexing protocol for querying blockchain data. Instead of scanning millions of blocks to find events, The Graph indexes them and serves data via **GraphQL APIs**.

### The Problem It Solves

```
WITHOUT The Graph:
1. Connect to Ethereum node
2. Scan blocks 1 → 19,000,000
3. Filter for specific events
4. Decode event data
5. Build your own database
⏱️  Takes hours/days, expensive, unreliable

WITH The Graph:
1. Write a GraphQL query
2. Get structured data instantly
⏱️  Takes milliseconds
```

### Key Terms
- **Subgraph**: A project that defines how to index specific blockchain data
- **Schema**: Defines the data structure (entities/tables)
- **Mappings**: Code that transforms blockchain events into entities
- **Indexer**: Node operators that process and serve subgraph data
- **Curator**: Signal which subgraphs are valuable
- **Delegator**: Stake GRT tokens to indexers

---

## How The Graph Works

### Architecture

```
Blockchain (Events/Calls)
        │
        ▼
┌─────────────────┐
│   Graph Node     │ ← Listens to new blocks
│  (Indexer)       │
├─────────────────┤
│ 1. Detect events │
│ 2. Run mappings  │
│ 3. Store in DB   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   PostgreSQL     │ ← Indexed data stored here
│   Database       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  GraphQL API     │ ← Your queries go here
│  Endpoint        │
└─────────────────┘
```

### Data Flow

```
1. Smart contract emits event:
   Supply(reserve=USDC, user=0x123, amount=1000)

2. Graph Node detects the event

3. Mapping function runs:
   handleSupply(event) {
     let supply = new SupplyEvent(event.id)
     supply.user = event.params.user
     supply.amount = event.params.amount
     supply.save()
   }

4. Data stored as entity in PostgreSQL

5. Query via GraphQL:
   { supplyEvents(where: {user: "0x123"}) { amount } }

6. Result:
   { "data": { "supplyEvents": [{ "amount": "1000" }] } }
```

---

## Core Concepts

### 1. Subgraph Manifest (`subgraph.yaml`)

Defines what to index:

```yaml
specVersion: 0.0.5
schema:
  file: ./schema.graphql
dataSources:
  - kind: ethereum
    name: AaveV3Pool
    network: mainnet
    source:
      address: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2"
      abi: Pool
      startBlock: 16291127
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.7
      language: wasm/assemblyscript
      entities:
        - User
        - SupplyEvent
        - BorrowEvent
      abis:
        - name: Pool
          file: ./abis/Pool.json
      eventHandlers:
        - event: Supply(indexed address,address,indexed address,uint256,indexed uint16)
          handler: handleSupply
        - event: Borrow(indexed address,address,indexed address,uint256,uint8,uint256,indexed uint16)
          handler: handleBorrow
        - event: Withdraw(indexed address,indexed address,indexed address,uint256)
          handler: handleWithdraw
        - event: Repay(indexed address,indexed address,indexed address,uint256,bool)
          handler: handleRepay
        - event: LiquidationCall(indexed address,indexed address,indexed address,uint256,uint256,address,bool)
          handler: handleLiquidation
      file: ./src/mapping.ts
```

### 2. Schema (`schema.graphql`)

Defines entities (like database tables):

```graphql
type User @entity {
  id: ID!                              # User address
  supplies: [SupplyEvent!]! @derivedFrom(field: "user")
  borrows: [BorrowEvent!]! @derivedFrom(field: "user")
  repays: [RepayEvent!]! @derivedFrom(field: "user")
  withdrawals: [WithdrawEvent!]! @derivedFrom(field: "user")
  liquidations: [LiquidationEvent!]! @derivedFrom(field: "user")
  totalSupplied: BigDecimal!
  totalBorrowed: BigDecimal!
  lastActivity: BigInt!
}

type SupplyEvent @entity {
  id: ID!                              # txHash-logIndex
  user: User!                          # Reference to User
  reserve: Reserve!                    # Which asset
  amount: BigInt!                      # Amount supplied
  timestamp: BigInt!                   # Block timestamp
  blockNumber: BigInt!                 # Block number
  txHash: Bytes!                       # Transaction hash
}

type BorrowEvent @entity {
  id: ID!
  user: User!
  reserve: Reserve!
  amount: BigInt!
  borrowRateMode: Int!                 # 1=Stable, 2=Variable
  borrowRate: BigInt!                  # Rate at time of borrow
  timestamp: BigInt!
  blockNumber: BigInt!
  txHash: Bytes!
}

type WithdrawEvent @entity {
  id: ID!
  user: User!
  reserve: Reserve!
  amount: BigInt!
  to: Bytes!                           # Recipient
  timestamp: BigInt!
  blockNumber: BigInt!
  txHash: Bytes!
}

type RepayEvent @entity {
  id: ID!
  user: User!
  reserve: Reserve!
  repayer: Bytes!
  amount: BigInt!
  useATokens: Boolean!
  timestamp: BigInt!
  blockNumber: BigInt!
  txHash: Bytes!
}

type LiquidationEvent @entity {
  id: ID!
  user: User!                          # User being liquidated
  collateralReserve: Reserve!
  debtReserve: Reserve!
  debtToCover: BigInt!
  liquidatedCollateral: BigInt!
  liquidator: Bytes!
  timestamp: BigInt!
  blockNumber: BigInt!
  txHash: Bytes!
}

type Reserve @entity {
  id: ID!                              # Asset address
  symbol: String!
  name: String!
  decimals: Int!
  totalSupply: BigInt!
  totalBorrow: BigInt!
  supplyEvents: [SupplyEvent!]! @derivedFrom(field: "reserve")
  borrowEvents: [BorrowEvent!]! @derivedFrom(field: "reserve")
}
```

### 3. Mappings (`src/mapping.ts`)

AssemblyScript code that processes events:

```typescript
import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import {
  Supply as SupplyEvent_,
  Borrow as BorrowEvent_,
  Withdraw as WithdrawEvent_,
  Repay as RepayEvent_,
  LiquidationCall as LiquidationEvent_
} from "../generated/AaveV3Pool/Pool"
import {
  User,
  SupplyEvent,
  BorrowEvent,
  WithdrawEvent,
  RepayEvent,
  LiquidationEvent,
  Reserve
} from "../generated/schema"

// Helper: Get or create user
function getOrCreateUser(address: Address): User {
  let id = address.toHexString()
  let user = User.load(id)
  if (user == null) {
    user = new User(id)
    user.totalSupplied = BigInt.zero().toBigDecimal()
    user.totalBorrowed = BigInt.zero().toBigDecimal()
    user.lastActivity = BigInt.zero()
    user.save()
  }
  return user
}

// Handle Supply event
export function handleSupply(event: SupplyEvent_): void {
  let id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()

  let supplyEvent = new SupplyEvent(id)
  supplyEvent.user = getOrCreateUser(event.params.onBehalfOf).id
  supplyEvent.reserve = event.params.reserve.toHexString()
  supplyEvent.amount = event.params.amount
  supplyEvent.timestamp = event.block.timestamp
  supplyEvent.blockNumber = event.block.number
  supplyEvent.txHash = event.transaction.hash
  supplyEvent.save()

  // Update user
  let user = getOrCreateUser(event.params.onBehalfOf)
  user.lastActivity = event.block.timestamp
  user.save()
}

// Handle Borrow event
export function handleBorrow(event: BorrowEvent_): void {
  let id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()

  let borrowEvent = new BorrowEvent(id)
  borrowEvent.user = getOrCreateUser(event.params.onBehalfOf).id
  borrowEvent.reserve = event.params.reserve.toHexString()
  borrowEvent.amount = event.params.amount
  borrowEvent.borrowRateMode = event.params.interestRateMode
  borrowEvent.borrowRate = event.params.borrowRate
  borrowEvent.timestamp = event.block.timestamp
  borrowEvent.blockNumber = event.block.number
  borrowEvent.txHash = event.transaction.hash
  borrowEvent.save()
}

// Handle Withdraw event
export function handleWithdraw(event: WithdrawEvent_): void {
  let id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()

  let withdrawEvent = new WithdrawEvent(id)
  withdrawEvent.user = getOrCreateUser(event.params.user).id
  withdrawEvent.reserve = event.params.reserve.toHexString()
  withdrawEvent.amount = event.params.amount
  withdrawEvent.to = event.params.to
  withdrawEvent.timestamp = event.block.timestamp
  withdrawEvent.blockNumber = event.block.number
  withdrawEvent.txHash = event.transaction.hash
  withdrawEvent.save()
}

// Handle Repay event
export function handleRepay(event: RepayEvent_): void {
  let id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()

  let repayEvent = new RepayEvent(id)
  repayEvent.user = getOrCreateUser(event.params.user).id
  repayEvent.reserve = event.params.reserve.toHexString()
  repayEvent.repayer = event.params.repayer
  repayEvent.amount = event.params.amount
  repayEvent.useATokens = event.params.useATokens
  repayEvent.timestamp = event.block.timestamp
  repayEvent.blockNumber = event.block.number
  repayEvent.txHash = event.transaction.hash
  repayEvent.save()
}

// Handle Liquidation event
export function handleLiquidation(event: LiquidationEvent_): void {
  let id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()

  let liqEvent = new LiquidationEvent(id)
  liqEvent.user = getOrCreateUser(event.params.user).id
  liqEvent.collateralReserve = event.params.collateralAsset.toHexString()
  liqEvent.debtReserve = event.params.debtAsset.toHexString()
  liqEvent.debtToCover = event.params.debtToCover
  liqEvent.liquidatedCollateral = event.params.liquidatedCollateralAmount
  liqEvent.liquidator = event.params.liquidator
  liqEvent.timestamp = event.block.timestamp
  liqEvent.blockNumber = event.block.number
  liqEvent.txHash = event.transaction.hash
  liqEvent.save()
}
```

---

## Querying Aave Data

### Aave's Official Subgraphs

**Aave V3 Subgraphs:**
```
Ethereum:  https://api.thegraph.com/subgraphs/name/aave/protocol-v3
Polygon:   https://api.thegraph.com/subgraphs/name/aave/protocol-v3-polygon
Arbitrum:  https://api.thegraph.com/subgraphs/name/aave/protocol-v3-arbitrum
Optimism:  https://api.thegraph.com/subgraphs/name/aave/protocol-v3-optimism
Avalanche: https://api.thegraph.com/subgraphs/name/aave/protocol-v3-avalanche
```

**Aave V2 Subgraph:**
```
Ethereum:  https://api.thegraph.com/subgraphs/name/aave/protocol-v2
```

### GraphQL Playground

Visit the subgraph URL in your browser to get an interactive GraphQL explorer.

---

## GraphQL Query Reference

### 1. Get User Overview

```graphql
{
  user(id: "0x1234567890abcdef1234567890abcdef12345678") {
    id
    reserves {
      currentATokenBalance
      currentVariableDebt
      currentStableDebt
      reserve {
        symbol
        name
        decimals
        price {
          priceInEth
        }
      }
      usageAsCollateralEnabledOnUser
    }
  }
}
```

### 2. Get All Users with Active Positions

```graphql
{
  users(
    first: 100
    where: {
      borrowedReservesCount_gt: 0
    }
    orderBy: id
    orderDirection: asc
  ) {
    id
    borrowedReservesCount
    reserves {
      currentVariableDebt
      currentStableDebt
      reserve {
        symbol
      }
    }
  }
}
```

### 3. Get User's Supply History

```graphql
{
  supplies(
    where: { user: "0x1234..." }
    orderBy: timestamp
    orderDirection: desc
    first: 50
  ) {
    id
    amount
    reserve {
      symbol
      decimals
    }
    timestamp
  }
}
```

### 4. Get User's Borrow History

```graphql
{
  borrows(
    where: { user: "0x1234..." }
    orderBy: timestamp
    orderDirection: desc
    first: 50
  ) {
    id
    amount
    borrowRate
    borrowRateMode
    reserve {
      symbol
      decimals
    }
    timestamp
  }
}
```

### 5. Get Liquidation Events

```graphql
{
  liquidationCalls(
    where: { user: "0x1234..." }
    orderBy: timestamp
    orderDirection: desc
  ) {
    id
    collateralAmount
    collateralReserve {
      symbol
    }
    principalAmount
    principalReserve {
      symbol
    }
    liquidator
    timestamp
  }
}
```

### 6. Get Reserve (Market) Data

```graphql
{
  reserves(where: { symbol: "USDC" }) {
    id
    symbol
    name
    decimals
    totalLiquidity
    totalCurrentVariableDebt
    totalCurrentStableDebt
    liquidityRate
    variableBorrowRate
    stableBorrowRate
    utilizationRate
    price {
      priceInEth
    }
  }
}
```

### 7. Get All Active Users (Paginated)

```graphql
# Page 1
{
  users(first: 1000, skip: 0, where: { borrowedReservesCount_gt: 0 }) {
    id
  }
}

# Page 2
{
  users(first: 1000, skip: 1000, where: { borrowedReservesCount_gt: 0 }) {
    id
  }
}
```

### 8. Get Flash Loan Events

```graphql
{
  flashLoans(
    first: 10
    orderBy: timestamp
    orderDirection: desc
  ) {
    id
    initiator
    amount
    totalFee
    reserve {
      symbol
    }
    timestamp
  }
}
```

---

## Integration with Code

### Python (requests)

```python
import requests
import json

SUBGRAPH_URL = "https://api.thegraph.com/subgraphs/name/aave/protocol-v3"

def query_subgraph(query: str, variables: dict = None) -> dict:
    """Execute a GraphQL query against The Graph."""
    payload = {"query": query}
    if variables:
        payload["variables"] = variables

    response = requests.post(SUBGRAPH_URL, json=payload)
    response.raise_for_status()
    return response.json()


# Example: Get user data
def get_user_data(user_address: str) -> dict:
    query = """
    query GetUser($id: ID!) {
        user(id: $id) {
            id
            reserves {
                currentATokenBalance
                currentVariableDebt
                currentStableDebt
                reserve {
                    symbol
                    decimals
                }
                usageAsCollateralEnabledOnUser
            }
        }
    }
    """
    result = query_subgraph(query, {"id": user_address.lower()})
    return result["data"]["user"]


# Example: Get all borrowers (paginated)
def get_all_borrowers(batch_size: int = 1000) -> list:
    all_users = []
    skip = 0

    while True:
        query = f"""
        {{
            users(
                first: {batch_size}
                skip: {skip}
                where: {{ borrowedReservesCount_gt: 0 }}
                orderBy: id
            ) {{
                id
                borrowedReservesCount
                reserves {{
                    currentVariableDebt
                    reserve {{ symbol }}
                }}
            }}
        }}
        """
        result = query_subgraph(query)
        users = result["data"]["users"]

        if len(users) == 0:
            break

        all_users.extend(users)
        skip += batch_size
        print(f"Fetched {len(all_users)} users so far...")

    return all_users
```

### JavaScript/TypeScript

```typescript
const SUBGRAPH_URL = "https://api.thegraph.com/subgraphs/name/aave/protocol-v3";

async function querySubgraph(query: string, variables?: Record<string, any>) {
    const response = await fetch(SUBGRAPH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables }),
    });
    const json = await response.json();
    if (json.errors) throw new Error(JSON.stringify(json.errors));
    return json.data;
}

// Get user positions
async function getUserPositions(address: string) {
    const query = `
        query GetUser($id: ID!) {
            user(id: $id) {
                id
                reserves {
                    currentATokenBalance
                    currentVariableDebt
                    currentStableDebt
                    reserve {
                        symbol
                        decimals
                        price { priceInEth }
                    }
                    usageAsCollateralEnabledOnUser
                }
            }
        }
    `;
    return querySubgraph(query, { id: address.toLowerCase() });
}

// Get supply events for a user
async function getUserSupplyHistory(address: string) {
    const query = `
        query GetSupplies($user: String!) {
            supplies(
                where: { user: $user }
                orderBy: timestamp
                orderDirection: desc
                first: 100
            ) {
                amount
                reserve { symbol decimals }
                timestamp
            }
        }
    `;
    return querySubgraph(query, { user: address.toLowerCase() });
}
```

---

## Building a Subgraph

### Step-by-Step Setup

**1. Install Graph CLI:**
```bash
npm install -g @graphprotocol/graph-cli
```

**2. Initialize Subgraph:**
```bash
graph init --product subgraph-studio my-aave-subgraph

# Choose:
# Protocol: ethereum
# Network: mainnet
# Contract address: 0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2
```

**3. Define Schema** (`schema.graphql`):
```graphql
type User @entity {
  id: ID!
  supplies: [Supply!]! @derivedFrom(field: "user")
  borrows: [Borrow!]! @derivedFrom(field: "user")
}

type Supply @entity {
  id: ID!
  user: User!
  asset: Bytes!
  amount: BigInt!
  timestamp: BigInt!
}

type Borrow @entity {
  id: ID!
  user: User!
  asset: Bytes!
  amount: BigInt!
  rate: BigInt!
  timestamp: BigInt!
}
```

**4. Generate Types:**
```bash
graph codegen
```

**5. Write Mappings** (`src/mapping.ts`):
```typescript
import { Supply as SupplyEvent } from "../generated/Pool/Pool"
import { User, Supply } from "../generated/schema"

export function handleSupply(event: SupplyEvent): void {
  // Create/load user
  let userId = event.params.onBehalfOf.toHexString()
  let user = User.load(userId)
  if (!user) {
    user = new User(userId)
    user.save()
  }

  // Create supply event
  let supply = new Supply(event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
  supply.user = userId
  supply.asset = event.params.reserve
  supply.amount = event.params.amount
  supply.timestamp = event.block.timestamp
  supply.save()
}
```

**6. Build:**
```bash
graph build
```

**7. Deploy to Subgraph Studio:**
```bash
graph auth --studio <DEPLOY_KEY>
graph deploy --studio my-aave-subgraph
```

---

## Resources

### Official
- [The Graph Docs](https://thegraph.com/docs/)
- [Subgraph Studio](https://thegraph.com/studio/)
- [Graph Explorer](https://thegraph.com/explorer/)
- [AssemblyScript Docs](https://www.assemblyscript.org/introduction.html)

### Aave Subgraphs
- [Aave V3 Subgraph Repo](https://github.com/aave/protocol-subgraphs)
- [Aave V3 Subgraph (Ethereum)](https://thegraph.com/hosted-service/subgraph/aave/protocol-v3)

### Tools
- [GraphQL Playground](https://graphql-playground.com/) - Test queries
- [Hasura GraphQL](https://hasura.io/) - Alternative GraphQL engine
- [Goldsky](https://goldsky.com/) - Alternative indexing platform

### Learning
- [The Graph Academy](https://thegraph.academy/)
- [Building Subgraphs Tutorial](https://thegraph.com/docs/en/developing/creating-a-subgraph/)
- [GraphQL Tutorial](https://graphql.org/learn/)
