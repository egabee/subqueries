import { CosmosBlock } from '@subql/types-cosmos'
import { sendBatchOfMessagesToKafka } from '../common/kafka-producer'
import { NEW_BLOCK_TOPIC } from '../common/constants'

export async function handleBlock(block: CosmosBlock): Promise<void> {
  await sendBatchOfMessagesToKafka([
    { messages: [{ height: block.block.header.height }], topic: NEW_BLOCK_TOPIC },
  ])
}
