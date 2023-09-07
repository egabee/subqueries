import { CosmosBlock, CosmosTransaction } from '@subql/types-cosmos'
import { sendBatchOfMessagesToKafka } from '../common/kafka-producer'
import { BLOCK_TOPIC } from '../common/constants'

export async function handleBlock(block: CosmosBlock): Promise<void> {
  await sendBatchOfMessagesToKafka([
    { messages: [{ height: block.block.header.height }], topic: BLOCK_TOPIC },
  ])
}

export async function handleTx(tx: CosmosTransaction): Promise<void> {
  return
}
