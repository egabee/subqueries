import { sendMessages } from '../common/kafka-producer'
import { Account, AccountBalance, Contract } from '../types'
import { ACCOUNT_BALANCE_TOPIC, BIGINT_ZERO, NEW_ACCOUNT_TOPIC } from '../common/constants'
import { CosmosBlock } from '@subql/types-cosmos'
import { getTimestamp } from '../common/utils'

export async function getOrCreateAccount(accountId: string, chainId: string): Promise<Account> {
  const account = await Account.get(accountId)

  if (account) {
    return account
  }

  const newAccount = Account.create({
    id: accountId,
    chainId,
  })

  sendMessages([newAccount], NEW_ACCOUNT_TOPIC)
  return newAccount
}

export async function getOrCreateAccountBalance(
  account: Account,
  block: CosmosBlock,
  contract?: Contract,
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
    contractId: contract?.id,
    chainId,
    denom: '',
  })
  return newBalance
}

export async function decreaseAccountBalance(
  account: Account,
  coin: { amount: string; denom: string },
  block: CosmosBlock,
  contract?: Contract,
): Promise<AccountBalance> {
  const balance = await getOrCreateAccountBalance(account, block, contract)
  balance.amount -= BigInt(coin.amount)
  balance.denom = coin.denom

  if (balance.amount < BIGINT_ZERO) {
    balance.amount = BIGINT_ZERO
  }
  balance.blockNumber = block.header.height
  balance.timestamp = getTimestamp(block)

  sendMessages([balance], ACCOUNT_BALANCE_TOPIC)

  return balance
}

export async function increaseAccountBalance(
  account: Account,
  coin: { denom: string; amount: string },
  block: CosmosBlock,
  contract?: Contract,
): Promise<AccountBalance> {
  const balance = await getOrCreateAccountBalance(account, block, contract)
  balance.amount += BigInt(coin.amount)
  balance.denom = coin.denom
  balance.blockNumber = block.header.height
  balance.timestamp = getTimestamp(block)

  sendMessages([balance], ACCOUNT_BALANCE_TOPIC)

  return balance
}
