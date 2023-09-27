import { CosmosMessage } from '@subql/types-cosmos'
import { TRANSACTION_TOPIC } from '../common/constants'
import { sendBatchOfMessagesToKafka } from '../common/kafka-producer'
import { Coin } from '../types/proto-interfaces/cosmos/base/v1beta1/coin'
import { createTransaction } from './tx'

type AnyJson = any

interface MsgInstantiateContract {
  sender: string
  admin: string
  codeId: string
  label: string
  msg: AnyJson
  funds: Coin[]
}

export async function handleMsgInstantiateContract(
  msg: CosmosMessage<MsgInstantiateContract>,
): Promise<void> {
  const transaction = createTransaction('MsgInstantiateContract', msg)
  await sendBatchOfMessagesToKafka([{ topic: TRANSACTION_TOPIC, messages: [transaction] }])
}
