import { CosmosBlock } from '@subql/types-cosmos'
import { sendBatchOfMessagesToKafka } from '../common/kafka-producer'
import { NEW_BLOCK } from '../common/constants'

export async function handleBlock(block: CosmosBlock): Promise<void> {
  await sendBatchOfMessagesToKafka([{ height: block.block.header.height }], NEW_BLOCK)
}
