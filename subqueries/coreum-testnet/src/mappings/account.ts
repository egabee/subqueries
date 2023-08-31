import { sendBatchOfMessagesToKafka } from '../common/kafka-producer'
import { Account, AccountBalance } from '../types'
import { ACCOUNT_BALANCE_TOPIC, BIGINT_ZERO, NEW_ACCOUNT_TOPIC } from '../common/constants'
import { CosmosBlock } from '@subql/types-cosmos'
import { getTimestamp } from '../common/utils'

export async function getOrCreateAccount(accountId: string): Promise<Account> {
  const account = await Account.get(accountId)

  if (account) {
    return account
  }

  const newAccount = Account.create({
    id: accountId,
  })

  await sendBatchOfMessagesToKafka([{ messages: [newAccount], topic: NEW_ACCOUNT_TOPIC }])

  return newAccount
}

export async function getOrCreateAccountBalance(
  account: Account,
  block: CosmosBlock,
): Promise<AccountBalance> {
  const previousBalance = await AccountBalance.get(account.id)

  if (previousBalance) {
    return previousBalance
  }

  const newBalance = AccountBalance.create({
    id: account.id,
    accountId: account.id,
    amount: BIGINT_ZERO,
    blockNumber: block.header.height,
    timestamp: getTimestamp(block),
  })

  return newBalance
}

export async function decreaseAccountBalance(
  account: Account,
  amount: string,
  block: CosmosBlock,
): Promise<AccountBalance> {
  const balance = await getOrCreateAccountBalance(account, block)
  balance.amount -= BigInt(amount)

  if (balance.amount < BIGINT_ZERO) {
    balance.amount = BIGINT_ZERO
  }
  balance.blockNumber = block.header.height
  balance.timestamp = getTimestamp(block)

  await sendBatchOfMessagesToKafka([{ messages: [balance], topic: ACCOUNT_BALANCE_TOPIC }])

  return balance
}

export async function increaseAccountBalance(
  account: Account,
  amount: string,
  block: CosmosBlock,
): Promise<AccountBalance> {
  const balance = await getOrCreateAccountBalance(account, block)
  balance.amount += BigInt(amount)
  balance.blockNumber = block.header.height
  balance.timestamp = getTimestamp(block)

  await sendBatchOfMessagesToKafka([{ messages: [balance], topic: ACCOUNT_BALANCE_TOPIC }])

  return balance
}
