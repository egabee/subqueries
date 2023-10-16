import { CosmosMessage } from '@subql/types-cosmos'
import { EventLog, Transaction } from '../types'
import { BIGINT_ZERO } from '../common/constants'
import {
  decodeBase64IfEncoded,
  getTimestamp,
  isTransactionSuccessful,
  toJson,
} from '../common/utils'

// TODO: this type is what we gonna using to send data to kafka
interface Tx {
  transactionHash: string
  network: string
  status: string
  block: string
  timestamp: string
  index: string
  value: string
  nonce: string
  gasUsed: string
  gasWanted: string
  gasPrice: string
  fee: string
  gasLimit: string
  rawInput: string
  sender: string
  receiver: string // could be contract address
  messages: string[]
  events: string[]
}

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

export function createTransaction<T>(type: string, msg: CosmosMessage<T>): Transaction {
  const transaction = Transaction.create({
    id: msg.tx.hash,
    events: [],
    messages: [],
    gasUsed: BIGINT_ZERO,
    gasWanted: BIGINT_ZERO,
    success: true,
    blockNumber: 0,
    timestamp: BIGINT_ZERO,
  })

  transaction.success = isTransactionSuccessful(msg.tx)
  transaction.gasUsed = BigInt(msg.tx.tx.gasUsed)
  transaction.gasWanted = BigInt(msg.tx.tx.gasWanted)

  const events: EventLog[] = msg.tx.tx.events.map(({ type, attributes }) => ({
    type,
    attributes: attributes.map(({ key, value }) => ({
      key: decodeBase64IfEncoded(key),
      value: decodeBase64IfEncoded(value),
    })),
  }))

  transaction.events = [...events]
  transaction.messages = [{ type, value: toJson(msg.msg.decodedMsg) }]

  transaction.blockNumber = msg.block.header.height
  transaction.timestamp = getTimestamp(msg.block)

  return transaction
}
