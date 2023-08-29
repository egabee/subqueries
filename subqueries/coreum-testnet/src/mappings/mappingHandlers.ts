import { CosmosBlock, CosmosMessage, CosmosTransaction } from '@subql/types-cosmos'

import {
  BIGINT_ZERO,
  HOURLY_CHAIN_SNAPSHOT_TOPIC,
  MILLISECONDS_PER_HOUR,
} from '../common/constants'
import { sendBatchOfMessagesToKafka } from '../common/kafka-producer'
import { getTimestamp } from '../common/utils'
import { ChainHourlySnapshot } from '../types'
import { decreaseAccountBalance, getOrCreateAccount, increaseAccountBalance } from './account'

export async function handleTransaction(tx: CosmosTransaction): Promise<void> {
  const hourlySnapshot = await getOrCreateChainHourlySnapshot(
    tx.block.block.header.chainId,
    tx.block,
  )
  hourlySnapshot.hourlyFailedTransactionCount += tx.tx.code === 0 ? 0 : 1
  hourlySnapshot.hourlyGasConsumption += BigInt(tx.tx.gasUsed)
  hourlySnapshot.hourlyTransactionCount += 1

  await sendBatchOfMessagesToKafka([hourlySnapshot], HOURLY_CHAIN_SNAPSHOT_TOPIC)
  await hourlySnapshot.save()
}

type TransferMsg = {
  fromAddress: string
  toAddress: string
  amount: {
    denom: string
    amount: string
  }[]
}

// TODO: bu contract transfer islemine dahil olmus olabilir ondan dolayi hourlyContractSnapshot
// guncellenmeli
export async function handleTransferMessage(msg: CosmosMessage<TransferMsg>): Promise<void> {
  const sender = msg.msg.decodedMsg.fromAddress
  const recipient = msg.msg.decodedMsg.toAddress
  const chainId = msg.block.header.chainId

  for (const coin of msg.msg.decodedMsg.amount) {
    const senderAccountId = sender + '-' + coin.denom
    const senderAccount = await getOrCreateAccount(senderAccountId, chainId)
    const senderBalance = await decreaseAccountBalance(senderAccount, coin, msg.block)
    senderBalance.blockNumber = msg.block.header.height
    senderBalance.timestamp = getTimestamp(msg.block)

    await senderAccount.save()
    await senderBalance.save()

    const recipientAccountId = recipient + '-' + coin.denom
    const recipientAccount = await getOrCreateAccount(recipientAccountId, chainId)
    const recipientBalance = await increaseAccountBalance(recipientAccount, coin, msg.block)
    recipientBalance.blockNumber = msg.block.header.height
    recipientBalance.timestamp = getTimestamp(msg.block)

    await recipientAccount.save()
    await recipientBalance.save()
  }
}

async function getOrCreateChainHourlySnapshot(
  chainId: string,
  block: CosmosBlock,
): Promise<ChainHourlySnapshot> {
  const snapshotId =
    chainId + '-' + Math.floor(block.header.time.valueOf() / MILLISECONDS_PER_HOUR).toString()
  const previousSnapshot = await ChainHourlySnapshot.get(snapshotId)

  if (previousSnapshot) {
    return previousSnapshot
  }

  const newSnapshot = ChainHourlySnapshot.create({
    id: snapshotId,
    hourlyFailedTransactionCount: 0,
    hourlyGasConsumption: BIGINT_ZERO,
    hourlyTransactionCount: 0,
    blockNumber: BigInt(block.header.height),
    timestamp: getTimestamp(block),
    chainId: block.header.chainId,
  })

  return newSnapshot
}
