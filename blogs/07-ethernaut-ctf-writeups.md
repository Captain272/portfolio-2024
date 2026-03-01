# Ethernaut CTF — All 30 Levels Broken Down

Ethernaut is the OG Solidity wargame by OpenZeppelin. 30+ levels, each one a deployed contract with a vulnerability you need to exploit on-chain. I cleared all of them. Here's the complete breakdown — every level, every exploit, every lesson.

---

## Level 0: Hello Ethernaut

The tutorial. Call `info()`, follow the breadcrumbs through `info1()`, `info2()`, etc., and eventually call `authenticate()` with the password from `password()`. Teaches you how to interact with contracts via the browser console.

**Lesson:** Public functions and state variables are callable by anyone.

---

## Level 1: Fallback

The contract has a `receive()` function that sets `msg.sender` as owner if they've already contributed:

```solidity
receive() external payable {
    require(msg.value > 0 && contributions[msg.sender] > 0);
    owner = msg.sender;
}
```

Send a tiny contribution via `contribute()`, then send ETH directly to trigger `receive()`. You're the owner — call `withdraw()`.

**Lesson:** Fallback functions can contain critical logic that bypasses intended access control.

---

## Level 2: Fallout

The "constructor" is just a misspelled function — `Fal1out()` instead of `Fallout()`. Anyone can call it and become owner.

```solidity
function Fal1out() public payable {
    owner = msg.sender;
}
```

Pre-Solidity 0.4.22, constructors were functions with the same name as the contract. A typo = public function anyone can call.

**Lesson:** Always use the `constructor` keyword. Never rely on naming conventions for security.

---

## Level 3: Coin Flip

The contract uses `block.number` for randomness:

```solidity
uint256 blockValue = uint256(blockhash(block.number - 1));
uint256 coinFlip = blockValue / FACTOR;
```

Deploy an attacker contract that computes the same value in the same block and calls `flip()` with the known answer. Repeat 10 times.

**Lesson:** On-chain randomness from block data is predictable. Use Chainlink VRF for real randomness.

---

## Level 4: Telephone

```solidity
function changeOwner(address _owner) public {
    if (tx.origin != msg.sender) {
        owner = _owner;
    }
}
```

`tx.origin` is the EOA that initiated the transaction. `msg.sender` is the immediate caller. Call through an intermediary contract → `tx.origin != msg.sender` → ownership taken.

**Lesson:** Never use `tx.origin` for authorization. It enables phishing attacks where a malicious contract calls your contract on behalf of the user.

---

## Level 5: Token

Pre-Solidity 0.8 integer underflow:

```solidity
function transfer(address _to, uint _value) public returns (bool) {
    require(balances[msg.sender] - _value >= 0);
    balances[msg.sender] -= _value;
    balances[_to] += _value;
}
```

You have 20 tokens. Transfer 21 → `20 - 21` underflows to `2^256 - 1`. The `require` passes because unsigned integers can't be negative.

**Lesson:** Use Solidity 0.8+ (built-in overflow checks) or OpenZeppelin's SafeMath for older versions.

---

## Level 6: Delegation

`delegatecall` executes another contract's code in the caller's storage context:

```solidity
fallback() external {
    (bool result,) = address(delegate).delegatecall(msg.data);
}
```

Call the Delegation contract with `msg.data = abi.encodeWithSignature("pwn()")`. The Delegate's `pwn()` sets `owner = msg.sender`, but it writes to Delegation's storage slot 0.

**Lesson:** `delegatecall` preserves caller context. Storage layout between proxy and implementation must match exactly.

---

## Level 7: Force

Send ETH to a contract with no `receive()` or `fallback()`:

```solidity
contract ForceFeeder {
    constructor(address target) payable {
        selfdestruct(payable(target));
    }
}
```

`selfdestruct` forces ETH transfer regardless of the target's code.

**Lesson:** Never rely on `address(this).balance` for logic. Use internal accounting instead.

---

## Level 8: Vault

```solidity
bool public locked = true;
bytes32 private password;
```

"Private" only means other contracts can't read it. Anyone can read storage slots directly:

```javascript
await web3.eth.getStorageAt(contract.address, 1) // slot 1 = password
```

**Lesson:** Nothing on-chain is private. Not variables, not bytecode, not transaction data. If it's on the blockchain, it's public.

---

## Level 9: King

The contract sends ETH to the previous king when a new king claims the throne:

```solidity
(bool sent, ) = king.call{value: msg.value}("");
require(sent);
```

Deploy a contract that reverts on receive. When it becomes king, nobody can dethrone it because the ETH transfer always fails.

**Lesson:** Pull over push. Never make contract functionality dependent on successful ETH transfers to arbitrary addresses.

---

## Level 10: Re-entrancy

The classic:

```solidity
function withdraw(uint _amount) public {
    if(balances[msg.sender] >= _amount) {
        (bool result,) = msg.sender.call{value: _amount}("");
        require(result);
        balances[msg.sender] -= _amount; // state updated AFTER call
    }
}
```

Attacker's `receive()` calls `withdraw()` again before balance is decremented. Drain the entire contract.

```solidity
receive() external payable {
    if (address(target).balance >= amount) {
        target.withdraw(amount);
    }
}
```

**Lesson:** Checks-Effects-Interactions. Update state before external calls. Use `ReentrancyGuard`.

---

## Level 11: Elevator

The `Building` interface's `isLastFloor()` is called twice. Return `false` first (to pass the guard), then `true` (to set `top = true`):

```solidity
bool called;
function isLastFloor(uint) external returns (bool) {
    if (!called) { called = true; return false; }
    return true;
}
```

**Lesson:** Never trust external contract return values for state changes. Interface implementations can be malicious.

---

## Level 12: Privacy

Complex storage layout with different types packed into slots:

```solidity
bool public locked = true;           // slot 0
uint256 public ID = block.timestamp; // slot 1
uint8 private flattening = 10;       // slot 2 (packed)
uint8 private denomination = 255;    // slot 2 (packed)
uint16 private awkwardness = ...;    // slot 2 (packed)
bytes32[3] private data;             // slots 3, 4, 5
```

The key is `bytes16(data[2])` — read slot 5, take the first 16 bytes:

```javascript
const data = await web3.eth.getStorageAt(address, 5);
const key = data.slice(0, 34); // bytes16
```

**Lesson:** Understand Solidity storage layout. Fixed arrays occupy sequential slots. Smaller types are packed. Everything is readable.

---

## Level 13: Gatekeeper One

Three modifiers that must all pass:

```solidity
modifier gateOne()  { require(msg.sender != tx.origin); }        // call via contract
modifier gateTwo()  { require(gasleft() % 8191 == 0); }          // exact gas amount
modifier gateThree(bytes8 _gateKey) {
    require(uint32(uint64(_gateKey)) == uint16(uint64(_gateKey)));  // type casting tricks
    require(uint32(uint64(_gateKey)) != uint64(_gateKey));
    require(uint32(uint64(_gateKey)) == uint16(uint160(tx.origin)));
}
```

Gate 1: Call through a contract. Gate 2: Brute-force the gas amount. Gate 3: Craft the key using bitmasks — `bytes8(uint64(uint16(uint160(tx.origin))) | (1 << 32))`.

**Lesson:** Type casting in Solidity truncates. Understanding how `uint64 → uint32 → uint16` conversions work is essential for low-level EVM work.

---

## Level 14: Gatekeeper Two

```solidity
modifier gateTwo() {
    uint x;
    assembly { x := extcodesize(caller()) }
    require(x == 0);
}
```

`extcodesize` returns 0 during constructor execution (code hasn't been deployed yet). Put your attack in the constructor.

**Lesson:** `extcodesize == 0` is not a reliable EOA check. Contracts have zero code size during construction.

---

## Level 15: Naught Coin

You have tokens but can't `transfer()` for 10 years (timelock). But ERC-20 has `approve()` + `transferFrom()` — the timelock only overrides `transfer()`:

```solidity
token.approve(attackerAddress, balance);
// From attacker:
token.transferFrom(playerAddress, attackerAddress, balance);
```

**Lesson:** When restricting token movement, override ALL transfer mechanisms. ERC-20 has two: `transfer()` and `transferFrom()`.

---

## Level 16: Preservation

Two library contracts are called via `delegatecall`. The library's `setTime()` writes to slot 0 — but in the calling contract's context, slot 0 is the library address, not the timestamp.

Overwrite the library address with your attack contract → the next `delegatecall` runs your code → overwrite `owner` (slot 2).

**Lesson:** `delegatecall` to libraries must have matching storage layouts. Slot collision = arbitrary storage write.

---

## Level 17: Recovery

A factory deploys a SimpleToken contract. You need to find the deployed address. Contract addresses are deterministic:

```javascript
address = keccak256(rlp.encode([sender, nonce]))[12:]
```

Or just look at the factory's transaction on Etherscan. Call `destroy()` to selfdestruct the token contract and recover ETH.

**Lesson:** Contract addresses are deterministic based on deployer + nonce. Nothing deployed on-chain is hidden.

---

## Level 18: MagicNumber

Deploy a contract that returns `42` from a `whatIsTheMeaningOfLife()` call — but the runtime bytecode must be 10 bytes or less. This requires hand-writing EVM opcodes:

```
// Runtime bytecode: return 42
PUSH1 0x2a    // push 42
PUSH1 0x00    // memory offset
MSTORE        // store in memory
PUSH1 0x20    // return 32 bytes
PUSH1 0x00    // from offset 0
RETURN
```

That's 10 bytes: `602a60005260206000f3`. Wrap it in init code that copies it to memory and returns it.

**Lesson:** Understanding raw EVM bytecode. Every Solidity contract compiles down to these opcodes.

---

## Level 19: Alien Codex

The contract inherits `Ownable` (owner at slot 0) and has a dynamic bytes32 array. Calling `retract()` underflows the array length from 0 to `2^256 - 1`, giving you access to every storage slot.

Array elements start at `keccak256(slot)`. Slot 0 (owner) = `keccak256(1) + index` where index wraps around in 256-bit space:

```
index = 2^256 - keccak256(1)
```

Write your address to that index → you've overwritten slot 0 → you're the owner.

**Lesson:** Array length underflow gives arbitrary storage write. This is why Solidity 0.8+ checks arithmetic by default.

---

## Level 20: Denial

You're a withdrawal partner. The contract sends you ETH via `call`:

```solidity
partner.call{value: amountToSend, gas: 1000000}("");
```

Drain all the gas in your `receive()` function with an infinite loop or `assert(false)`. The owner's withdrawal on the next line never executes.

**Lesson:** Even `call` with a gas limit can be DoS'd. Use a withdrawal pattern where users pull funds instead of the contract pushing.

---

## Level 21: Shop

Similar to Elevator. The `price()` function is called twice. Return 100 first (to pass `price >= 100`), then return 0:

```solidity
function price() external view returns (uint) {
    return target.isSold() ? 0 : 100;
}
```

Check the `isSold` state to know which call you're in.

**Lesson:** `view` functions can still return different values based on other contract state. Don't trust external `view` calls for validation.

---

## Level 22: Dex

The DEX uses a naive price formula: `amount * tokenBalance / otherTokenBalance`. By swapping back and forth, rounding errors accumulate in your favor until you drain one token entirely:

```
Swap 10 A → get 10 B (price 1:1)
Swap 10 B → get ~11 A (pool imbalance)
Swap 11 A → get ~13 B (larger imbalance)
... repeat until drained
```

**Lesson:** AMM price calculations must handle precision carefully. This is why real DEXes use `x * y = k` with proper rounding.

---

## Level 23: Dex Two

Like Dex but with no token validation in the `swap()` function. Deploy a fake token, give the DEX an arbitrary balance, and swap your fake token for real tokens:

```solidity
fakeToken.approve(dex, 100);
dex.swap(fakeToken, token1, 100);
```

**Lesson:** Always validate token addresses in DeFi contracts. An unchecked swap function is a free withdrawal.

---

## Level 24: Puzzle Wallet

Proxy pattern with storage collision. The proxy's `pendingAdmin` (slot 0) overlaps with the implementation's `owner` (slot 0). Set `pendingAdmin` on the proxy → you're the `owner` on the implementation.

Then exploit `multicall` + `deposit` to count a single ETH deposit twice. Drain the contract via `execute()`. Finally, set `maxBalance` to your address — which overwrites the proxy's `admin` (slot 1).

**Lesson:** Storage collision between proxy and implementation is catastrophic. This is exactly the bug that caused real proxy exploits.

---

## Level 25: Motorbike

UUPS proxy. The implementation contract was never initialized:

1. Read the implementation address from EIP-1967 slot
2. Call `initialize()` directly on the implementation
3. You're now the `upgrader` on the implementation
4. Call `upgradeToAndCall()` with a contract that selfdestructs

The proxy now delegates to dead code.

**Lesson:** Always call `_disableInitializers()` in implementation constructors. Uninitialized implementations are ticking time bombs.

---

## Level 26: DoubleEntryPoint

A token with a `delegateTransfer()` function that can be exploited through a legacy token's `transfer()`. The fix: write a Forta detection bot that raises an alert when `delegateTransfer()` is called by the CryptoVault:

```solidity
function handleTransaction(address user, bytes calldata msgData) external {
    (,, address origSender) = abi.decode(msgData[4:], (address, uint256, address));
    if (origSender == cryptoVault) {
        IForta(forta).raiseAlert(user);
    }
}
```

**Lesson:** This level teaches defense — building monitoring bots. Real protocols use Forta and similar systems for on-chain threat detection.

---

## Level 27: Good Samaritan

The contract donates 10 coins when `requestDonation()` is called. It catches a custom error `NotEnoughBalance()` and transfers the remaining balance. Trigger the custom error from your `notify()` callback with only 10 coins:

```solidity
function notify(uint256 amount) external {
    if (amount == 10) {
        revert NotEnoughBalance();
    }
}
```

The Good Samaritan catches the error and sends everything.

**Lesson:** Custom errors can be spoofed by malicious contracts. Don't use error types as trusted signals for fallback logic.

---

## Level 28: Gatekeeper Three

Combines multiple tricks:
- Become owner via constructor pattern
- Send exactly 0.001 ETH + make the receive reject direct sends
- Pass the password check by reading the private variable

**Lesson:** Composition of multiple small vulnerabilities into a chain.

---

## Level 29: Switch

Low-level calldata manipulation. The contract checks `calldataload(68)` for the `turnSwitchOff` selector, but you can craft calldata with a dynamic bytes offset that makes `calldataload(68)` point to `turnSwitchOff` while the actual function call data points to `turnSwitchOn`.

```
Offset 0:  selector for flipSwitch(bytes)
Offset 4:  bytes offset (points to offset 96 instead of 32)
Offset 36: padding
Offset 68: turnSwitchOff selector (passes the check)
Offset 96: actual bytes length
Offset 128: turnSwitchOn selector (actually executed)
```

**Lesson:** Never validate calldata at fixed offsets when using dynamic types. ABI encoding allows repointing offsets.

---

## Level 30: HigherOrder

```solidity
function registerTreasury(uint8 _id) public {
    assembly {
        sstore(treasury_slot, calldataload(4))
    }
}
```

The function signature says `uint8` but the assembly reads a full 32-byte word. Send a value > 255 in the calldata — Solidity's ABI decoder would truncate it, but the raw `calldataload` doesn't.

**Lesson:** Assembly bypasses Solidity's type safety. When mixing Solidity and inline assembly, type assumptions can diverge.

---

## Summary — All Vulnerability Classes

| Category | Levels | Real-World Losses |
|---|---|---|
| Reentrancy | 10, 9, 20 | The DAO ($60M), Cream ($130M) |
| Delegatecall/Proxy | 6, 16, 24, 25 | Parity ($150M), Wormhole ($320M) |
| Access Control | 1, 2, 4 | Ronin Bridge ($625M) |
| Storage Manipulation | 8, 12, 19 | Various data leaks |
| Integer Overflow | 5 | bZx, early token hacks |
| Oracle/Randomness | 3 | Multiple DeFi exploits |
| DoS | 7, 9, 20 | Governance griefing |
| ERC-20 Quirks | 15, 23 | Unchecked return values |
| AMM Math | 22, 23 | Price manipulation |
| ABI Encoding | 29, 30 | Calldata injection |
| Interface Trust | 11, 21, 27 | Callback manipulation |
| Type Casting | 13, 14, 18 | EVM-level exploits |

Every single one of these patterns has caused real losses on mainnet. Breaking them in a CTF is the fastest way to build the intuition for catching them in production code and audits.
