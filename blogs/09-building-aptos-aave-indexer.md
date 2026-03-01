# Building a Production AAVE V3 Indexer for Aptos

AAVE V3 launched on Aptos — the first non-EVM deployment of the protocol. No subgraphs, no etherscan, no existing tooling. I built a Go indexer from scratch that scans Move events, tracks user positions, and handles the unique challenges of indexing a Move-based chain.

---

## Why This Is Different from EVM Indexing

On Ethereum, you have The Graph. Point a subgraph at a contract address, define your event handlers, deploy, and query with GraphQL. On Aptos, none of that exists for AAVE.

**Aptos Move Events v2** changed the game. Unlike v1 events (which had queryable event handles you could paginate through), v2 events are embedded in transaction outputs. The only way to find them is to scan transactions and filter.

```
EVM approach:    Contract → Event Logs → Filter by topic → Done
Aptos approach:  Scan ALL transactions → Check module prefix → Parse matching events
```

This means the indexer has to process every transaction from AAVE's deployment version forward (~3.2 billion transactions into the chain) and check each one for matching events.

---

## Architecture

```
┌─────────────────────────────────────────────┐
│                  CLI Layer                   │
│  --users  --status  --dry-run  --version    │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│              Config (YAML)                   │
│  node_url, pool_address, assets, rate_limit │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│            Aptos RPC Client                  │
│  Rate limiting (token bucket)               │
│  Exponential backoff retries                │
│  30s HTTP timeouts                          │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│              Indexer Core                    │
│  Transaction scanning loop                  │
│  Event type matching & parsing              │
│  Checkpoint management                      │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│            SQLite Store                      │
│  6 event tables + users + checkpoints       │
│  WAL mode, idempotent inserts               │
└─────────────────────────────────────────────┘
```

---

## The Six AAVE Events We Track

Every lending protocol action emits an event:

| Event | Description | Key Fields |
|---|---|---|
| `Supply` | User deposits collateral | reserve, user, amount |
| `Withdraw` | User removes collateral | reserve, user, amount |
| `Borrow` | User takes a loan | reserve, user, amount, borrow_rate |
| `Repay` | User repays debt | reserve, user, amount |
| `LiquidationCall` | Underwater position liquidated | collateral, debt, liquidator |
| `FlashLoan` | Uncollateralized instant loan | target, amount, premium |

Each event is parsed from the Move event type suffix and stored with the full transaction context — version, event index, timestamp, and all protocol-specific fields.

---

## Transaction Scanning Strategy

The core loop is deceptively simple:

```go
for {
    txns, err := client.GetTransactions(startVersion, batchSize)
    if err != nil {
        // exponential backoff retry
        continue
    }

    for _, txn := range txns {
        for _, event := range txn.Events {
            if strings.HasPrefix(event.Type, poolModulePrefix) {
                parsed := parseEvent(event)
                store.InsertEvent(parsed)
            }
        }
    }

    store.SaveCheckpoint(startVersion + len(txns))
    startVersion += len(txns)
}
```

But the devil is in the details:

1. **Batch size is capped at 100** by the Aptos API
2. **Rate limiting** — public nodes throttle at ~5 req/sec
3. **Checkpoint recovery** — if the process crashes, it resumes from the last saved version
4. **Graceful shutdown** — SIGINT/SIGTERM triggers a clean save before exit

---

## User Position Tracking

AAVE stores active users in a Move `SmartTable`. Reading it requires iterating through hash buckets on-chain:

```go
func (c *Client) GetTableItems(tableHandle string) ([]UserEntry, error) {
    // Read SmartTable metadata to get bucket count
    // Iterate each bucket via view function calls
    // Collect all user addresses
}
```

For each user, we call the `get_user_account_data` view function to get:

- **Total collateral** (in USD)
- **Total debt** (in USD)
- **Available borrow** amount
- **Health factor** (< 1.0 means liquidatable)
- **LTV** and **liquidation threshold**

This data is upserted on every scan, giving us a snapshot of all user positions at any point in time.

---

## Handling Aptos RPC Quirks

Building directly against Aptos RPC (no SDK) exposed several edge cases:

**Transaction version gaps**: The API returns transactions by version range, but some versions are system transactions with no events. The indexer must handle empty batches without advancing the checkpoint incorrectly.

**Event type naming**: Move events use fully qualified names like `0x39dd...::supply_logic::Supply`. We match by suffix to avoid hardcoding the full module address in event filtering.

**Rate limiting**: Token bucket algorithm with configurable burst:

```go
type RateLimiter struct {
    tokens    float64
    maxTokens float64
    refillRate float64
    lastRefill time.Time
}
```

**Numeric precision**: AAVE amounts are stored as `u256` strings in Move. Go's `math/big.Int` handles the conversion without overflow.

---

## Database Design

SQLite with WAL mode gives us concurrent reads during writes — perfect for a single-writer indexer with multiple query clients:

```sql
CREATE TABLE supply_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    txn_version INTEGER NOT NULL,
    event_index INTEGER NOT NULL,
    reserve TEXT NOT NULL,
    user TEXT NOT NULL,
    on_behalf_of TEXT NOT NULL,
    amount TEXT NOT NULL,
    referral_code INTEGER,
    timestamp INTEGER NOT NULL,
    UNIQUE(txn_version, event_index)
);

CREATE INDEX idx_supply_user ON supply_events(user, txn_version);
CREATE INDEX idx_supply_reserve ON supply_events(reserve, txn_version);
```

`INSERT OR IGNORE` makes inserts idempotent — reprocessing the same transaction range is safe.

---

## What I'd Do Differently

1. **PostgreSQL for production** — SQLite is great for development but a shared PostgreSQL instance would allow multiple services to query concurrently
2. **WebSocket streaming** — Instead of polling, use Aptos's transaction stream API for real-time event processing
3. **Parallel scanning** — Split the version range across goroutines to backfill faster
4. **GraphQL API layer** — Expose the indexed data through a GraphQL endpoint for frontend consumption

---

## Results

The indexer runs against Aptos mainnet, tracking all AAVE V3 activity from deployment. It processes ~10K transactions per minute on a public node and maintains a complete history of every supply, borrow, withdraw, repay, liquidation, and flash loan on the protocol.

Combined with the multi-chain EVM indexer (which covers Ethereum, Polygon, Arbitrum, Optimism, and Avalanche via The Graph), this gives full cross-chain visibility into AAVE V3 across both EVM and Move-based chains.
