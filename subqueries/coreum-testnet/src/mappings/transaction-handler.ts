import { CosmosTransaction } from '@subql/types-cosmos'
import { sendBatchOfMessagesToKafka } from '../common/kafka-producer'
import { TOPIC_NEW_TX } from '../common/constants'

export async function transactionHandler(tx: CosmosTransaction): Promise<void> {
  await sendBatchOfMessagesToKafka([{ messages: [tx.decodedTx as any], topic: TOPIC_NEW_TX }])
}
