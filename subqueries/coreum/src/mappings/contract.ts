import { CosmosMessage } from '@subql/types-cosmos'

import { MsgInstantiateContract, MsgExecuteContract } from './coreum-types'
import { createTransaction } from './helper'
import { sendBatchOfMessagesToKafka } from '../common/kafka-producer'
import { TOPIC_MESSAGE } from '../common/constants'

export async function handleMsgInstantiateContract(
  msg: CosmosMessage<MsgInstantiateContract>,
): Promise<void> {
  const transaction = createTransaction('MsgInstantiateContract', msg)
  await sendBatchOfMessagesToKafka([{ messages: [transaction], topic: TOPIC_MESSAGE }])
}

export async function handleMsgExecuteContract(
  msg: CosmosMessage<MsgExecuteContract>,
): Promise<void> {
  const transaction = createTransaction('MsgExecuteContract', msg)
  await sendBatchOfMessagesToKafka([{ messages: [transaction], topic: TOPIC_MESSAGE }])
}
