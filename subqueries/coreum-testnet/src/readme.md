# Types Conflict Issue - Notice and Solution

## Issue Description
When running the indexer, an issue arises due to conflicts in the types of `MsgMint` between FT (Fungible Token) and NFT (Non-Fungible Token) within the `./src/types/CosmosMessagTypes.ts` file. These message types lack differentiation, causing conflict during code generation or compilation.

## Problem Statement
The types `MsgMint` for both FT and NFT do not have any distinction in the `CosmosMessageTypes.ts` file. This similarity leads to potential conflicts when handling Fungible Token and Non-Fungible Token transactions, especially during the process of running the indexer.

## Solution Strategy
To resolve this issue, a suggested approach is to update the `CosmosMessageTypes.ts` file, specifically by introducing distinct names for the conflicting `MsgMint` types. Below is an example of how to address this issue within the code:

### Code Update
```typescript
import {
  MsgIssueClass,
  MsgMint as MsgMintNFT,
  MsgBurn as MsgBurnNFT,
  MsgFreeze as MsgFreezeNFT
} from "./proto-interfaces/coreum/asset/nft/v1/tx";

// ... (additional code)

export type MsgIssueClassMessage = CosmosMessage<MsgIssueClass>;
export type MsgMintMessageNFT = CosmosMessage<MsgMintNFT>;
export type MsgBurnMessageNFT = CosmosMessage<MsgBurnNFT>;
export type MsgFreezeMessageNFT = CosmosMessage<MsgFreezeNFT>;
```
