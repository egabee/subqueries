import { sendMessages } from '../common/kafka-producer'
import { Account, AccountBalance, Contract } from '../types'
import { ACCOUNT_BALANCE_TOPIC, BIGINT_ZERO, NEW_ACCOUNT_TOPIC } from '../common/constants'

export async function getOrCreateAccount(accountId: string): Promise<Account> {
  const account = await Account.get(accountId)

  if (account) {
    return account
  }

  const newAccount = Account.create({
    id: accountId,
  })

  sendMessages([newAccount], NEW_ACCOUNT_TOPIC)
  return newAccount
}

export async function getOrCreateAccountBalance(
  account: Account,
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
    blockNumber: 0,
    timestamp: BIGINT_ZERO,
    contractId: contract?.id,
  })
  return newBalance
}

export async function decreaseAccountBalance(
  account: Account,
  amount: bigint,
  contract?: Contract,
): Promise<AccountBalance> {
  const balance = await getOrCreateAccountBalance(account, contract)
  balance.amount -= amount
  if (balance.amount < BIGINT_ZERO) {
    balance.amount = BIGINT_ZERO
  }
  sendMessages([balance], ACCOUNT_BALANCE_TOPIC)

  return balance
}

export async function increaseAccountBalance(
  account: Account,
  amount: bigint,
  contract?: Contract,
): Promise<AccountBalance> {
  const balance = await getOrCreateAccountBalance(account, contract)
  balance.amount += amount

  sendMessages([balance], ACCOUNT_BALANCE_TOPIC)

  return balance
}
