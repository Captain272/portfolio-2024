# Move Programming Language - Complete Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Why Move?](#why-move)
3. [Core Concepts](#core-concepts)
4. [Setup & Environment](#setup--environment)
5. [Basic Syntax](#basic-syntax)
6. [Advanced Concepts](#advanced-concepts)
7. [Best Practices](#best-practices)
8. [Resources](#resources)

---

## Introduction

**Move** is a programming language designed for safe and secure blockchain development. Originally created by Facebook (Meta) for the Diem blockchain, it's now used by Aptos and Sui.

### Key Philosophy
- **Resource-oriented programming**: Digital assets are first-class citizens
- **Safety first**: Prevents common smart contract vulnerabilities
- **Formal verification**: Mathematical proofs of correctness

---

## Why Move?

### Problems Move Solves

1. **Re-entrancy Attacks** (like the DAO hack)
   - Move's resource model prevents this by design

2. **Double Spending**
   - Resources can't be copied or dropped accidentally

3. **Access Control**
   - Built-in ownership and capability-based security

### Move vs Solidity

| Feature | Move | Solidity |
|---------|------|----------|
| Asset Model | Resources (linear types) | Integers (can copy) |
| Re-entrancy | Prevented by design | Must use patterns |
| Verification | Built-in prover | External tools |
| Learning Curve | Moderate | Moderate |

---

## Core Concepts

### 1. **Resources** (The Big Idea)

Resources are special types that represent digital assets:

```move
struct Coin has key {
    value: u64
}
```

**Rules:**
- ✅ Can be **stored** in accounts
- ✅ Can be **moved** between accounts
- ❌ **Cannot** be copied
- ❌ **Cannot** be dropped (lost)
- ❌ **Cannot** be created out of thin air

Think of it like a physical gold coin - you can't duplicate it or lose it accidentally!

### 2. **Abilities**

Abilities define what you can do with a type:

```move
struct MyResource has key, store {
    value: u64
}
```

| Ability | Meaning |
|---------|---------|
| `key` | Can be stored as a top-level resource in global storage |
| `store` | Can be stored inside other resources |
| `copy` | Can be copied (cloned) |
| `drop` | Can be dropped/destroyed |

### 3. **Global Storage**

Each account has its own storage. You can publish resources to it:

```move
// Publish a resource to an account
move_to<MyResource>(&signer, MyResource { value: 100 });

// Borrow a resource from global storage
let resource = borrow_global<MyResource>(address);

// Move a resource out of storage
let resource = move_from<MyResource>(address);
```

---

## Setup & Environment

### 1. Install Aptos CLI

```bash
# macOS/Linux
curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3

# Verify installation
aptos --version
```

### 2. Create Your First Project

```bash
# Create a new Move project
aptos move init --name my_first_module

# Project structure:
# my_first_module/
# ├── Move.toml          # Package manifest
# └── sources/           # Your .move files
```

### 3. Configure Move.toml

```toml
[package]
name = "MyFirstModule"
version = "1.0.0"

[addresses]
my_addr = "_"  # Will be filled at deployment

[dependencies.AptosFramework]
git = "https://github.com/aptos-labs/aptos-core.git"
rev = "mainnet"
subdir = "aptos-move/framework/aptos-framework"
```

---

## Basic Syntax

### Module Structure

```move
module my_addr::hello_world {
    use std::signer;
    use std::string::{Self, String};

    // Struct definition
    struct Message has key {
        text: String
    }

    // Function to set a message
    public entry fun set_message(account: &signer, text: String) {
        let message = Message { text };
        move_to(account, message);
    }

    // Function to get a message
    public fun get_message(addr: address): String acquires Message {
        let message = borrow_global<Message>(addr);
        message.text
    }
}
```

### Variables & Types

```move
// Basic types
let x: u8 = 10;
let y: u64 = 100;
let z: u128 = 1000;
let is_active: bool = true;
let addr: address = @0x1;

// Vectors (arrays)
let nums: vector<u64> = vector[1, 2, 3, 4];

// Structs
struct Point {
    x: u64,
    y: u64
}

let p = Point { x: 5, y: 10 };
```

### Functions

```move
// Public function (callable from outside)
public fun add(a: u64, b: u64): u64 {
    a + b
}

// Entry function (can be called via transactions)
public entry fun transfer(from: &signer, to: address, amount: u64) {
    // ...
}

// Private function (module-only)
fun internal_helper(): u64 {
    42
}

// Acquires annotation (when accessing global storage)
public fun withdraw(addr: address): Coin acquires Coin {
    move_from<Coin>(addr)
}
```

### References

```move
// Immutable reference
let x = 10;
let x_ref: &u64 = &x;

// Mutable reference
let mut y = 20;
let y_ref: &mut u64 = &mut y;
*y_ref = 30;  // y is now 30

// Borrowing from global storage
let coin_ref = borrow_global<Coin>(addr);           // immutable
let coin_mut = borrow_global_mut<Coin>(addr);       // mutable
```

---

## Advanced Concepts

### 1. Generics

```move
struct Box<T> has store {
    value: T
}

public fun create_box<T: store>(value: T): Box<T> {
    Box { value }
}

// Type constraints
public fun copy_box<T: copy + store>(box: &Box<T>): Box<T> {
    Box { value: box.value }
}
```

### 2. Events

```move
use aptos_framework::event::{Self, EventHandle};

struct TransferEvent has drop, store {
    from: address,
    to: address,
    amount: u64
}

struct EventStore has key {
    transfer_events: EventHandle<TransferEvent>
}

public entry fun transfer_with_event(
    from: &signer,
    to: address,
    amount: u64
) acquires EventStore {
    // ... transfer logic ...

    let event_store = borrow_global_mut<EventStore>(from_addr);
    event::emit_event(
        &mut event_store.transfer_events,
        TransferEvent { from: from_addr, to, amount }
    );
}
```

### 3. Unit Tests

```move
#[test_only]
use std::unit_test;

#[test]
fun test_addition() {
    assert!(add(2, 3) == 5, 0);
}

#[test(account = @0x1)]
fun test_with_signer(account: &signer) {
    set_message(account, string::utf8(b"Hello"));
    assert!(get_message(@0x1) == string::utf8(b"Hello"), 0);
}
```

Run tests:
```bash
aptos move test
```

### 4. Access Control

```move
struct AdminCapability has key, store {}

public entry fun initialize(account: &signer) {
    // Only the module publisher can initialize
    assert!(signer::address_of(account) == @my_addr, E_NOT_AUTHORIZED);
    move_to(account, AdminCapability {});
}

public entry fun admin_only_action(admin: &signer) acquires AdminCapability {
    // Verify admin has the capability
    assert!(exists<AdminCapability>(signer::address_of(admin)), E_NOT_ADMIN);
    // ... perform admin action ...
}
```

---

## Best Practices

### 1. **Error Codes**

```move
/// Error: caller is not authorized
const E_NOT_AUTHORIZED: u64 = 1;

/// Error: insufficient balance
const E_INSUFFICIENT_BALANCE: u64 = 2;

/// Error: resource already exists
const E_ALREADY_EXISTS: u64 = 3;

public fun withdraw(account: &signer, amount: u64) acquires Balance {
    let balance = borrow_global_mut<Balance>(signer::address_of(account));
    assert!(balance.value >= amount, E_INSUFFICIENT_BALANCE);
    balance.value = balance.value - amount;
}
```

### 2. **Use `acquires` Correctly**

```move
// CORRECT: List all resources accessed
public fun update_both(addr: address) acquires Balance, Config {
    let balance = borrow_global_mut<Balance>(addr);
    let config = borrow_global<Config>(addr);
    // ...
}

// WRONG: Missing acquires annotation
public fun update(addr: address) {
    let balance = borrow_global_mut<Balance>(addr);  // ❌ Compilation error
}
```

### 3. **Avoid Orphaned Resources**

```move
// BAD: Resource can be orphaned
public fun bad_transfer(from: &signer, to: address) acquires Coin {
    let coin = move_from<Coin>(signer::address_of(from));
    // If an error occurs here, coin is lost!
    move_to<Coin>(&to, coin);  // ❌ Can't do this - 'to' is not a signer
}

// GOOD: Use proper patterns
public fun transfer(from: &signer, to: address, amount: u64) acquires Balance {
    let from_balance = borrow_global_mut<Balance>(signer::address_of(from));
    assert!(from_balance.value >= amount, E_INSUFFICIENT_BALANCE);
    from_balance.value = from_balance.value - amount;

    if (!exists<Balance>(to)) {
        move_to(&to, Balance { value: 0 });  // Create if doesn't exist
    };

    let to_balance = borrow_global_mut<Balance>(to);
    to_balance.value = to_balance.value + amount;
}
```

### 4. **Check Before Modify**

```move
// Always validate before making state changes
public entry fun claim_reward(account: &signer) acquires Reward, Stats {
    let addr = signer::address_of(account);

    // Check conditions first
    assert!(exists<Reward>(addr), E_NO_REWARD);
    let reward = borrow_global<Reward>(addr);
    assert!(reward.amount > 0, E_ZERO_REWARD);
    assert!(!reward.claimed, E_ALREADY_CLAIMED);

    // Then modify state
    let reward_mut = borrow_global_mut<Reward>(addr);
    reward_mut.claimed = true;

    // Finally transfer
    // ...
}
```

---

## Resources

### Official Documentation
- [Move Book](https://move-language.github.io/move/)
- [Aptos Move Documentation](https://aptos.dev/move/move-on-aptos)
- [Move Tutorial](https://github.com/move-language/move/tree/main/language/documentation/tutorial)

### Tools
- [Move Prover](https://github.com/move-language/move/tree/main/language/move-prover) - Formal verification
- [Move Playground](https://playground.move-language.org/) - Online IDE
- [Aptos Explorer](https://explorer.aptoslabs.com/) - View deployed contracts

### Community
- [Aptos Discord](https://discord.gg/aptoslabs)
- [Move Language Discord](https://discord.gg/cPUmhe7)
- [GitHub Discussions](https://github.com/aptos-labs/aptos-core/discussions)

### Example Projects
- [Aptos Core Framework](https://github.com/aptos-labs/aptos-core/tree/main/aptos-move/framework)
- [Move Examples](https://github.com/aptos-labs/aptos-core/tree/main/aptos-move/move-examples)
- [Community Projects](https://github.com/aptos-labs/awesome-aptos)

---

## Next Steps

1. ✅ Complete the [Move Tutorial](https://github.com/move-language/move/tree/main/language/documentation/tutorial)
2. ✅ Build a simple token contract
3. ✅ Create a basic NFT collection
4. ✅ Explore the Aptos Framework source code
5. ✅ Build a small DeFi application

**Remember**: The best way to learn Move is by writing code. Start small, test thoroughly, and gradually build more complex applications!
