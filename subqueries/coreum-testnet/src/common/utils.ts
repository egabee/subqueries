import { CosmosBlock } from '@subql/types-cosmos'

export function getTimestamp(block: CosmosBlock): bigint {
  return BigInt(block.header.time.valueOf())
}

export function toJson(o: any): string {
  return JSON.stringify(o, (_, v) => (typeof v === 'bigint' ? v.toString() : v))
}

export function increaseFailedTransactionBy(code: number): number {
  return code === 0 ? 0 : 1
}
