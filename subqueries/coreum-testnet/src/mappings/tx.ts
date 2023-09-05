import { CosmosMessage } from '@subql/types-cosmos'
import { EventLog, Transaction } from '../types'
import { BIGINT_ZERO } from '../common/constants'
import {
  decodeBase64IfEncoded,
  getTimestamp,
  isTransactionSuccessful,
  toJson,
} from '../common/utils'

export async function getOrCreateTransaction(txId: string): Promise<Transaction> {
  let transaction = await Transaction.get(txId)

  if (transaction) {
    return transaction
  }

  transaction = Transaction.create({
    id: txId,
    events: [],
    messages: [],
    gasUsed: BIGINT_ZERO,
    gasWanted: BIGINT_ZERO,
    success: true,
    blockNumber: 0,
    timestamp: BIGINT_ZERO,
  })

  return transaction
}

export async function upsertTransaction<T>(msg: CosmosMessage<T>): Promise<Transaction> {
  // Subquery enforce us to define json arrays nullable or even normal arrays?
  const transaction = await getOrCreateTransaction(msg.tx.hash)

  transaction.success = isTransactionSuccessful(msg.tx)
  transaction.gasUsed = BigInt(msg.tx.tx.gasUsed)
  transaction.gasWanted = BigInt(msg.tx.tx.gasWanted)

  const events: EventLog[] = msg.tx.tx.events.map(({ type, attributes }) => ({
    type: decodeBase64IfEncoded(type),
    attributes: attributes.map(({ key, value }) => ({
      key: decodeBase64IfEncoded(key),
      value: decodeBase64IfEncoded(value),
    })),
  }))

  transaction.events = transaction.events ? [...transaction.events, ...events] : [...events]
  transaction.messages = transaction.messages
    ? [...transaction.messages, toJson(msg.msg.decodedMsg)]
    : [toJson(msg.msg.decodedMsg)]
  transaction.blockNumber = msg.block.header.height
  transaction.timestamp = getTimestamp(msg.block)

  return transaction
}
