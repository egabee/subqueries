import { CosmosMessage } from '@subql/types-cosmos'
import { MsgSend } from './coreum-types'
import { decreaseAccountBalance, getOrCreateAccount, increaseAccountBalance } from './account'
import { getTimestamp } from '../common/utils'

export async function handleMsgSend(msg: CosmosMessage<MsgSend>): Promise<void> {
  const { fromAddress, toAddress } = msg.msg.decodedMsg
  const { height } = msg.block.header

  for (const { denom, amount } of msg.msg.decodedMsg.amount) {
    const senderAccountId = fromAddress + '-' + denom
    const senderAccount = await getOrCreateAccount(senderAccountId)

    const senderBalance = await decreaseAccountBalance(senderAccount, amount, msg.block)
    senderBalance.blockNumber = height
    senderBalance.timestamp = getTimestamp(msg.block)

    await senderAccount.save()
    await senderBalance.save()

    const recipientAccountId = toAddress + '-' + denom
    const recipientAccount = await getOrCreateAccount(recipientAccountId)

    const recipientBalance = await increaseAccountBalance(recipientAccount, amount, msg.block)
    recipientBalance.blockNumber = height
    recipientBalance.timestamp = getTimestamp(msg.block)

    await recipientAccount.save()
    await recipientBalance.save()
  }
}
