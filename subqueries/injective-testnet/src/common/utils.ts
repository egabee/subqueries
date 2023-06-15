import { CosmosBlock } from '@subql/types-cosmos'

export function getTimestamp(block: CosmosBlock): bigint {
  return BigInt(block.header.time.valueOf())
}
