import { CosmosMessage } from '@subql/types-cosmos'

import { MsgMultiSend, MsgSend } from './coreum-types'
import { sendBatchOfMessagesToKafka } from '../common/kafka-producer'
import { TOPIC_MESSAGE } from '../common/constants'
import { createTransaction } from './helper'

export async function handleMsgSend(msg: CosmosMessage<MsgSend>): Promise<void> {
  // const { fromAddress, toAddress, amount } = msg.msg.decodedMsg
  // const { height } = msg.block.header
  // const timestamp = getTimestamp(msg.block)

  // for (const { denom, amount } of msg.msg.decodedMsg.amount) {
  //   const senderAccountId = fromAddress + '-' + denom
  //   const senderAccount = await getOrCreateAccount(senderAccountId)

  //   const senderBalance = await decreaseAccountBalance(senderAccount, amount, msg.block)
  //   senderBalance.blockNumber = height
  //   senderBalance.timestamp = timestamp

  //   await senderAccount.save()
  //   await senderBalance.save()

  //   const recipientAccountId = toAddress + '-' + denom
  //   const recipientAccount = await getOrCreateAccount(recipientAccountId)

  //   const recipientBalance = await increaseAccountBalance(recipientAccount, amount, msg.block)
  //   recipientBalance.blockNumber = height
  //   recipientBalance.timestamp = timestamp

  //   await sendBatchOfMessagesToKafka([
  //     { messages: [senderBalance, recipientBalance], topic: ACCOUNT_BALANCE_TOPIC },
  //   ])

  //   await recipientAccount.save()
  //   await recipientBalance.save()

  //   const token = await Token.get(denom)

  //   if (token) {
  //     token.transferCount += BIGINT_ONE

  //     await token.save()
  //   }
  // }

  const transaction = createTransaction('MsgSend', msg)
  await sendBatchOfMessagesToKafka([{ messages: [transaction], topic: TOPIC_MESSAGE }])
}

export async function handleMsgMultiSend(msg: CosmosMessage<MsgMultiSend>): Promise<void> {
  const transaction = createTransaction('MsgMultiSend', msg)
  await sendBatchOfMessagesToKafka([{ messages: [transaction], topic: TOPIC_MESSAGE }])
}
