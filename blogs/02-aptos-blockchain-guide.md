# Aptos Blockchain - Complete Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Architecture](#architecture)
3. [Key Features](#key-features)
4. [Getting Started](#getting-started)
5. [Accounts & Transactions](#accounts--transactions)
6. [Smart Contract Development](#smart-contract-development)
7. [Aptos Framework](#aptos-framework)
8. [Building dApps](#building-dapps)
9. [Resources](#resources)

---

## Introduction

**Aptos** is a Layer 1 blockchain designed for safety, scalability, and upgradeability. Built by former Meta (Facebook) engineers who worked on Diem, Aptos uses the Move programming language and innovative consensus mechanisms.

### Vision
> "A blockchain for the next billion users"

### Key Goals
- **High throughput**: 160,000+ theoretical TPS
- **Low latency**: Sub-second finality
- **Safety**: Move language prevents common vulnerabilities
- **Upgradeability**: On-chain governance for protocol upgrades

---

## Architecture

### 1. **Consensus: AptosBFT**

Aptos uses a modified version of HotStuff BFT consensus:

```
┌─────────────┐
│  Validator  │ ──┐
└─────────────┘   │
                  │    Propose Block
┌─────────────┐   │
│  Validator  │ ──┼──► Consensus ──► Execution ──► Commitment
└─────────────┘   │
                  │
┌─────────────┐   │
│  Validator  │ ──┘
└─────────────┘
```

**Features:**
- **Fast finality**: ~1 second
- **Byzantine fault tolerance**: Works as long as <1/3 validators are malicious
- **Leader rotation**: Different validator proposes each block
- **Pipelining**: Consensus and execution happen in parallel

### 2. **Parallel Execution: Block-STM**

Block-STM (Software Transactional Memory) enables parallel transaction execution:

```
Traditional Sequential:
TX1 → TX2 → TX3 → TX4   (Slow!)

Block-STM Parallel:
TX1 ─┐
TX2 ─┼─→ Execute ──► Detect Conflicts ──► Re-execute if needed
TX3 ─┤
TX4 ─┘
```

**How it works:**
1. Optimistically execute all transactions in parallel
2. Detect conflicts (e.g., two TXs modifying same resource)
3. Re-execute conflicting transactions sequentially
4. Achieve deterministic results

**Benefits:**
- 🚀 Up to 16x performance improvement
- ⚡ Better hardware utilization
- 📈 Scales with CPU cores

### 3. **Account Model**

```
Account: 0x1234...5678
├── Sequence Number: 42
├── Authentication Key
├── Resources
│   ├── 0x1::coin::CoinStore<AptosCoin> { value: 1000 }
│   └── 0x1::nft::Collection { ... }
└── Modules (Smart Contracts)
    └── 0x1234::my_contract
```

**Key Points:**
- Each account has a unique 32-byte address
- Accounts store both code (modules) and data (resources)
- Resources are typed and protected by the Move VM

---

## Key Features

### 1. **Move Language**

```move
module my_addr::token {
    struct Token has key {
        value: u64
    }

    public entry fun mint(account: &signer, value: u64) {
        move_to(account, Token { value });
    }
}
```

Benefits:
- Resource safety (no double-spending)
- Formal verification support
- Built-in security features

### 2. **Account Types**

**Standard Account:**
```
Address: 0x1234...5678
Auth: Single Ed25519 key
```

**Multi-Signature Account:**
```
Address: 0xabcd...ef01
Auth: 2-of-3 signatures required
Keys: [key1, key2, key3]
```

**Resource Account:**
```
Address: Derived from source account
Purpose: Autonomous smart contract account
Control: Only code can manage (no private key)
```

### 3. **Gas & Fees**

```
Transaction Fee = Gas Units Used × Gas Price

Example:
Gas Units: 1,000
Gas Price: 100 (octas per gas unit)
Fee: 100,000 octas = 0.001 APT
```

**Fee Components:**
- **Execution**: Running the transaction
- **Storage**: Storing data on-chain
- **Network**: Transaction propagation

### 4. **Token Standards**

**Aptos Coin (Fungible Token):**
```move
use aptos_framework::coin;

// Register to receive a coin type
coin::register<MyCoin>(account);

// Transfer coins
coin::transfer<MyCoin>(from, to, amount);
```

**Aptos Token (NFT):**
```move
use aptos_token::token;

// Create collection
token::create_collection(
    creator,
    collection_name,
    description,
    uri,
    maximum,
    mutate_setting
);

// Mint token
token::create_token_script(
    creator,
    collection,
    name,
    description,
    supply,
    uri,
    royalty_payee,
    royalty_numerator,
    royalty_denominator,
    property_keys,
    property_values,
    property_types
);
```

---

## Getting Started

### 1. **Install Aptos CLI**

**macOS/Linux:**
```bash
curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
```

**Windows:**
```powershell
iwr "https://aptos.dev/scripts/install_cli.py" -OutFile "install_cli.py"
python install_cli.py
```

**Verify:**
```bash
aptos --version
# Output: aptos 2.x.x
```

### 2. **Initialize Account**

```bash
# Initialize a new account (creates keypair)
aptos init

# Choose network (devnet, testnet, mainnet)
# Example output:
# Private key saved to: .aptos/config.yaml
# Account: 0x1234...5678
```

### 3. **Fund Your Account (Testnet)**

```bash
# Get test tokens from faucet
aptos account fund-with-faucet --account default

# Check balance
aptos account list --account default
```

### 4. **Create Your First Module**

```bash
# Initialize Move project
aptos move init --name my_first_module

# Directory structure:
# my_first_module/
# ├── Move.toml
# └── sources/
#     └── hello.move
```

---

## Accounts & Transactions

### Creating an Account

**1. Generate Keys:**
```bash
aptos key generate --key-type ed25519 --output-file my_key
# Creates: my_key (private) and my_key.pub (public)
```

**2. Derive Address:**
```bash
aptos account derive-address --public-key-file my_key.pub
# Output: 0xabcd...ef01
```

**3. Fund Account:**
```bash
aptos account fund-with-faucet --account 0xabcd...ef01 --faucet-url https://faucet.devnet.aptoslabs.com
```

### Transaction Lifecycle

```
1. Create Transaction
   ↓
2. Sign Transaction (with private key)
   ↓
3. Submit to Network
   ↓
4. Transaction Pool (Mempool)
   ↓
5. Block Proposal
   ↓
6. Consensus
   ↓
7. Execution (Move VM)
   ↓
8. Committed to Blockchain
   ↓
9. Finalized ✓
```

### Transaction Structure

```json
{
  "sender": "0x1234...5678",
  "sequence_number": 42,
  "max_gas_amount": 2000,
  "gas_unit_price": 100,
  "expiration_timestamp_secs": 1234567890,
  "payload": {
    "type": "entry_function_payload",
    "function": "0x1::coin::transfer",
    "arguments": ["0xabcd...ef01", "1000000"]
  },
  "signature": {
    "type": "ed25519_signature",
    "public_key": "0x...",
    "signature": "0x..."
  }
}
```

### Submitting Transactions

**Via CLI:**
```bash
aptos move run \
  --function-id 'default::message::set_message' \
  --args 'string:Hello Aptos'
```

**Via SDK (TypeScript):**
```typescript
import { AptosClient, AptosAccount, TxnBuilderTypes } from "aptos";

const client = new AptosClient("https://fullnode.devnet.aptoslabs.com");
const account = new AptosAccount();

const payload = {
  type: "entry_function_payload",
  function: `${moduleAddress}::message::set_message`,
  arguments: ["Hello Aptos"],
  type_arguments: [],
};

const txn = await client.generateTransaction(account.address(), payload);
const signedTxn = await client.signTransaction(account, txn);
const result = await client.submitTransaction(signedTxn);
await client.waitForTransaction(result.hash);
```

---

## Smart Contract Development

### Project Setup

**Move.toml:**
```toml
[package]
name = "MyDApp"
version = "1.0.0"

[addresses]
my_addr = "_"  # Filled during deployment

[dependencies.AptosFramework]
git = "https://github.com/aptos-labs/aptos-core.git"
rev = "mainnet"
subdir = "aptos-move/framework/aptos-framework"

[dependencies.AptosStdlib]
git = "https://github.com/aptos-labs/aptos-core.git"
rev = "mainnet"
subdir = "aptos-move/framework/aptos-stdlib"
```

### Example: Simple Token

```move
module my_addr::simple_token {
    use std::signer;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::event::{Self, EventHandle};

    /// Error codes
    const E_NOT_INITIALIZED: u64 = 1;
    const E_ALREADY_INITIALIZED: u64 = 2;
    const E_INSUFFICIENT_BALANCE: u64 = 3;

    /// Token struct
    struct SimpleToken has key {
        balance: u64,
        transfer_events: EventHandle<TransferEvent>,
    }

    /// Event emitted on transfer
    struct TransferEvent has drop, store {
        from: address,
        to: address,
        amount: u64,
    }

    /// Initialize token for an account
    public entry fun initialize(account: &signer) {
        let addr = signer::address_of(account);
        assert!(!exists<SimpleToken>(addr), E_ALREADY_INITIALIZED);

        move_to(account, SimpleToken {
            balance: 0,
            transfer_events: account::new_event_handle<TransferEvent>(account),
        });
    }

    /// Mint tokens (for demo - anyone can mint)
    public entry fun mint(account: &signer, amount: u64) acquires SimpleToken {
        let addr = signer::address_of(account);
        if (!exists<SimpleToken>(addr)) {
            initialize(account);
        };

        let token = borrow_global_mut<SimpleToken>(addr);
        token.balance = token.balance + amount;
    }

    /// Transfer tokens
    public entry fun transfer(
        from: &signer,
        to: address,
        amount: u64
    ) acquires SimpleToken {
        let from_addr = signer::address_of(from);

        // Ensure receiver is initialized
        assert!(exists<SimpleToken>(to), E_NOT_INITIALIZED);

        // Withdraw from sender
        let from_token = borrow_global_mut<SimpleToken>(from_addr);
        assert!(from_token.balance >= amount, E_INSUFFICIENT_BALANCE);
        from_token.balance = from_token.balance - amount;

        // Deposit to receiver
        let to_token = borrow_global_mut<SimpleToken>(to);
        to_token.balance = to_token.balance + amount;

        // Emit event
        event::emit_event(
            &mut from_token.transfer_events,
            TransferEvent { from: from_addr, to, amount }
        );
    }

    /// Get balance
    #[view]
    public fun balance_of(addr: address): u64 acquires SimpleToken {
        if (!exists<SimpleToken>(addr)) {
            return 0
        };
        borrow_global<SimpleToken>(addr).balance
    }
}
```

### Compile & Test

```bash
# Compile
aptos move compile

# Run tests
aptos move test

# Publish to devnet
aptos move publish --named-addresses my_addr=default
```

---

## Aptos Framework

The Aptos Framework provides core functionality:

### Core Modules

**1. Account (`0x1::account`)**
```move
use aptos_framework::account;

// Create account
account::create_account(new_address);

// Get sequence number
let seq = account::get_sequence_number(addr);
```

**2. Coin (`0x1::coin`)**
```move
use aptos_framework::coin::{Self, Coin};

// Register to receive coins
coin::register<AptosCoin>(account);

// Transfer
coin::transfer<AptosCoin>(from, to, amount);

// Get balance
let balance = coin::balance<AptosCoin>(addr);
```

**3. Timestamp (`0x1::timestamp`)**
```move
use aptos_framework::timestamp;

// Get current time (microseconds since Unix epoch)
let now = timestamp::now_seconds();
```

**4. Event (`0x1::event`)**
```move
use aptos_framework::event::{Self, EventHandle};

struct MyEvent has drop, store {
    message: String
}

// Emit event
event::emit_event(&mut event_handle, MyEvent { message });
```

**5. Table (`0x1::table`)**
```move
use aptos_framework::table::{Self, Table};

struct Storage has key {
    data: Table<address, u64>
}

// Add entry
table::add(&mut storage.data, addr, value);

// Get entry
let value = table::borrow(&storage.data, addr);
```

---

## Building dApps

### Frontend Stack

**1. TypeScript SDK:**
```bash
npm install aptos
```

```typescript
import { AptosClient, AptosAccount, FaucetClient } from "aptos";

// Initialize client
const NODE_URL = "https://fullnode.devnet.aptoslabs.com";
const client = new AptosClient(NODE_URL);

// Read view function
const balance = await client.view({
  function: `${moduleAddr}::simple_token::balance_of`,
  arguments: [accountAddr],
  type_arguments: [],
});

// Submit transaction
const payload = {
  type: "entry_function_payload",
  function: `${moduleAddr}::simple_token::transfer`,
  arguments: [recipientAddr, "1000"],
  type_arguments: [],
};

const txn = await client.generateTransaction(account.address(), payload);
const signed = await client.signTransaction(account, txn);
const result = await client.submitTransaction(signed);
await client.waitForTransaction(result.hash);
```

**2. Wallet Integration (Petra/Martian):**
```typescript
// Check if wallet is installed
const isPetraInstalled = window.aptos;

// Connect wallet
const response = await window.aptos.connect();
const account = response.address;

// Sign and submit transaction
const pendingTxn = await window.aptos.signAndSubmitTransaction({
  type: "entry_function_payload",
  function: `${moduleAddr}::simple_token::transfer`,
  arguments: [recipient, amount],
  type_arguments: [],
});

await client.waitForTransaction(pendingTxn.hash);
```

**3. React Example:**
```typescript
import { useState, useEffect } from "react";
import { AptosClient } from "aptos";

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);

  const client = new AptosClient("https://fullnode.devnet.aptoslabs.com");

  const connectWallet = async () => {
    const response = await window.aptos.connect();
    setAccount(response.address);
  };

  const getBalance = async () => {
    if (!account) return;
    const bal = await client.view({
      function: `0x1::coin::balance`,
      type_arguments: ["0x1::aptos_coin::AptosCoin"],
      arguments: [account],
    });
    setBalance(Number(bal[0]));
  };

  useEffect(() => {
    if (account) {
      getBalance();
    }
  }, [account]);

  return (
    <div>
      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Account: {account}</p>
          <p>Balance: {balance / 100000000} APT</p>
        </div>
      )}
    </div>
  );
}
```

### Indexing & Querying

**Aptos Indexer (GraphQL):**
```graphql
query GetAccountTokens($address: String!) {
  current_token_ownerships(
    where: {owner_address: {_eq: $address}}
  ) {
    token_data_id_hash
    name
    collection_name
    amount
  }
}
```

**Using with Apollo Client:**
```typescript
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";

const client = new ApolloClient({
  uri: "https://indexer.devnet.aptoslabs.com/v1/graphql",
  cache: new InMemoryCache(),
});

const { data } = await client.query({
  query: gql`
    query GetTokens($owner: String!) {
      current_token_ownerships(where: {owner_address: {_eq: $owner}}) {
        name
        amount
      }
    }
  `,
  variables: { owner: accountAddress },
});
```

---

## Resources

### Official Resources
- [Aptos Documentation](https://aptos.dev/)
- [Aptos GitHub](https://github.com/aptos-labs/aptos-core)
- [Move Book](https://move-language.github.io/move/)
- [Aptos Explorer](https://explorer.aptoslabs.com/)

### Developer Tools
- [Aptos CLI](https://aptos.dev/cli-tools/aptos-cli-tool/install-aptos-cli)
- [TypeScript SDK](https://aptos.dev/sdks/ts-sdk)
- [Python SDK](https://aptos.dev/sdks/python-sdk)
- [Rust SDK](https://aptos.dev/sdks/rust-sdk)

### Wallets
- [Petra Wallet](https://petra.app/)
- [Martian Wallet](https://martianwallet.xyz/)
- [Pontem Wallet](https://pontem.network/wallet)

### Networks
| Network | Purpose | RPC URL |
|---------|---------|---------|
| Devnet | Development & Testing | https://fullnode.devnet.aptoslabs.com |
| Testnet | Pre-production Testing | https://fullnode.testnet.aptoslabs.com |
| Mainnet | Production | https://fullnode.mainnet.aptoslabs.com |

### Community
- [Discord](https://discord.gg/aptoslabs)
- [Forum](https://forum.aptoslabs.com/)
- [Twitter](https://twitter.com/AptosLabs)
- [YouTube](https://www.youtube.com/@Aptosfoundation)

### Example Projects
- [Aptos Core Examples](https://github.com/aptos-labs/aptos-core/tree/main/aptos-move/move-examples)
- [Awesome Aptos](https://github.com/aptos-labs/awesome-aptos)
- [DeFi Examples](https://github.com/aptos-labs/aptos-core/tree/main/aptos-move/move-examples/defi)

---

## Next Steps

### Beginner Track
1. ✅ Set up Aptos CLI and create an account
2. ✅ Complete Move language tutorial
3. ✅ Deploy your first module to devnet
4. ✅ Build a simple token contract
5. ✅ Create a basic frontend with wallet integration

### Intermediate Track
1. ✅ Build an NFT marketplace
2. ✅ Implement a staking mechanism
3. ✅ Create a DAO with voting
4. ✅ Build a DeFi protocol (lending/borrowing)
5. ✅ Integrate with Aptos Indexer

### Advanced Track
1. ✅ Contribute to Aptos Core
2. ✅ Build cross-chain bridges
3. ✅ Implement formal verification for your contracts
4. ✅ Optimize for high-throughput applications
5. ✅ Build infrastructure tools

**Happy Building on Aptos! 🚀**
