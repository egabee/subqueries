# Coreum Testnet Subquery

The subquery monitors the chain, tokens, smart contracts and aggregates the results accordingly.

## Build and Run

```bash
# install SubQuery CLI
pnpm i -g @subql/cli

# install dependencies
pnpm i

# Copy proto definitions
pnpm cp:proto

# generate typescript types
pnpm codegen

# build the project
pnpm build

# run with docker
pnpm start:docker
```
