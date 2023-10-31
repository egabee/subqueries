import { CosmosBlock, CosmosTransaction } from '@subql/types-cosmos'
import isBase64 from 'is-base64'

export function getTimestamp(block: CosmosBlock): bigint {
  return BigInt(block.header.time.valueOf())
}

export function toJson(o: any): string {
  return JSON.stringify(o, (_, v) => (typeof v === 'bigint' ? v.toString() : v))
}

export function isTransactionSuccessful(tx: CosmosTransaction): boolean {
  return tx.tx.code === 0
}

/**
 * Decodes a string if it's Base64 encoded; otherwise, returns the original string.
 *
 * @param {string} input - The input string to decode if it's Base64 encoded.
 * @returns {string} - The decoded string or the original input string.
 */
export function decodeBase64IfEncoded(input: string): string {
  return isBase64(input) ? Buffer.from(input, 'base64').toString() : input
}
