import { CosmosMessage } from '@subql/types-cosmos'

import { MsgSend } from './coreum-types'
import { decreaseAccountBalance, getOrCreateAccount, increaseAccountBalance } from './account'
import { getTimestamp } from '../common/utils'
import { sendBatchOfMessagesToKafka } from '../common/kafka-producer'
import { ACCOUNT_BALANCE_TOPIC, BIGINT_ONE, TRANSACTION_TOPIC } from '../common/constants'
import { createTransaction } from './tx'
import { Token } from '../types'

export async function handleMsgSend(msg: CosmosMessage<MsgSend>): Promise<void> {
  // const { fromAddress, toAddress } = msg.msg.decodedMsg
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
  await sendBatchOfMessagesToKafka([{ messages: [transaction], topic: TRANSACTION_TOPIC }])
}
