import { CosmosBlock, CosmosMessage } from '@subql/types-cosmos'
import { Contract, ContractHourlySnapshot } from '../types'
import { sendBatchOfMessagesToKafka } from '../common/kafka-producer'
import {
  BIGINT_ZERO,
  HOURLY_CONTRACT_SNAPSHOT_TOPIC,
  MILLISECONDS_PER_HOUR,
  NEW_CONTRACT_TOPIC,
} from '../common/constants'
import { getTimestamp, increaseFailedTransactionBy } from '../common/utils'
import {
  decreaseAccountBalance,
  getOrCreateAccount,
  getOrCreateAccountBalance,
  increaseAccountBalance,
} from './account'

export async function handleIssueMsg(msg: CosmosMessage<IssueMsg>): Promise<void> {
  const { subunit, issuer, symbol, initialAmount } = msg.msg.decodedMsg

  const tokenId = subunit + '-' + issuer
  const token = await getOrCreateContract(tokenId, msg.block.header.chainId, symbol)

  const account = await getOrCreateAccount(issuer, chainId)
  const balance = await increaseAccountBalance(
    account,
    { denom: tokenId, amount: initialAmount },
    msg.block,
    token,
  )

  const snapshot = await getOrCreateContractHourlySnapshot(token, msg.block)
  snapshot.hourlyTransactionCount += 1
  snapshot.hourlyFailedTransactionCount += increaseFailedTransactionBy(msg.tx.tx.code)
  snapshot.hourlyGasConsumption += BigInt(msg.tx.tx.gasUsed)

  await sendBatchOfMessagesToKafka([snapshot], HOURLY_CONTRACT_SNAPSHOT_TOPIC)

  await snapshot.save()
  await token.save()
  await account.save()
  await balance.save()
}

export async function handleMsgMint(msg: CosmosMessage<MsgMint>): Promise<void> {
  const { coin, sender } = msg.msg.decodedMsg
  const { chainId } = msg.block.header

  const token = await getOrCreateContract(coin.denom, chainId)

  const account = await getOrCreateAccount(sender, chainId)
  const balance = await increaseAccountBalance(account, coin, msg.block, token)

  await account.save()
  await balance.save()

  const snapshot = await getOrCreateContractHourlySnapshot(token, msg.block)
  snapshot.hourlyTransactionCount += 1
  snapshot.hourlyFailedTransactionCount += increaseFailedTransactionBy(msg.tx.tx.code)
  snapshot.hourlyGasConsumption += BigInt(msg.tx.tx.gasUsed)

  await snapshot.save()
}

export async function handleMsgBurn(msg: CosmosMessage<MsgBurn>): Promise<void> {
  const { coin, sender } = msg.msg.decodedMsg

  const token = await getOrCreateContract(coin.denom, chainId)

  const account = await getOrCreateAccount(sender, chainId)
  const balance = await decreaseAccountBalance(account, coin, msg.block, token)

  await account.save()
  await balance.save()

  const snapshot = await getOrCreateContractHourlySnapshot(token, msg.block)
  snapshot.hourlyTransactionCount += 1
  snapshot.hourlyFailedTransactionCount += increaseFailedTransactionBy(msg.tx.tx.code)
  snapshot.hourlyGasConsumption += BigInt(msg.tx.tx.gasUsed)

  await snapshot.save()
}

export async function handleMsgFreeze(msg: CosmosMessage<MsgFreeze>): Promise<void> {
  const { coin } = msg.msg.decodedMsg
  const { chainId } = msg.block.header

  const token = await getOrCreateContract(coin.denom, chainId)
  const snapshot = await getOrCreateContractHourlySnapshot(token, msg.block)
  snapshot.hourlyTransactionCount += 1
  snapshot.hourlyFailedTransactionCount += increaseFailedTransactionBy(msg.tx.tx.code)
  snapshot.hourlyGasConsumption += BigInt(msg.tx.tx.gasUsed)

  await snapshot.save()
}

export async function handleMsgUnfreeze(msg: CosmosMessage<MsgUnfreeze>): Promise<void> {
  const { coin } = msg.msg.decodedMsg
  const { chainId } = msg.block.header

  const token = await getOrCreateContract(coin.denom, chainId)
  const snapshot = await getOrCreateContractHourlySnapshot(token, msg.block)
  snapshot.hourlyTransactionCount += 1
  snapshot.hourlyFailedTransactionCount += increaseFailedTransactionBy(msg.tx.tx.code)
  snapshot.hourlyGasConsumption += BigInt(msg.tx.tx.gasUsed)

  await snapshot.save()
}

export async function handleMsgGloballyFreeze(
  msg: CosmosMessage<MsgGloballyFreeze>,
): Promise<void> {
  const { denom } = msg.msg.decodedMsg
  const { chainId } = msg.block.header

  const token = await getOrCreateContract(denom, chainId)
  const snapshot = await getOrCreateContractHourlySnapshot(token, msg.block)
  snapshot.hourlyTransactionCount += 1
  snapshot.hourlyFailedTransactionCount += increaseFailedTransactionBy(msg.tx.tx.code)
  snapshot.hourlyGasConsumption += BigInt(msg.tx.tx.gasUsed)

  await snapshot.save()
}

export async function handleMsgGloballyUnfreeze(
  msg: CosmosMessage<MsgGloballyUnfreeze>,
): Promise<void> {
  const { denom } = msg.msg.decodedMsg
  const { chainId } = msg.block.header

  const token = await getOrCreateContract(denom, chainId)
  const snapshot = await getOrCreateContractHourlySnapshot(token, msg.block)
  snapshot.hourlyTransactionCount += 1
  snapshot.hourlyFailedTransactionCount += increaseFailedTransactionBy(msg.tx.tx.code)
  snapshot.hourlyGasConsumption += BigInt(msg.tx.tx.gasUsed)

  await snapshot.save()
}

export async function handleMsgSetWhitelistedLimit(
  msg: CosmosMessage<MsgSetWhitelistedLimit>,
): Promise<void> {
  const { coin, account } = msg.msg.decodedMsg
  const { chainId } = msg.block.header

  const token = await getOrCreateContract(coin.denom, chainId)

  const targetAccount = await getOrCreateAccount(account, chainId)
  const balance = await getOrCreateAccountBalance(targetAccount, msg.block, token)

  await targetAccount.save()
  await balance.save()

  const snapshot = await getOrCreateContractHourlySnapshot(token, msg.block)
  snapshot.hourlyTransactionCount += 1
  snapshot.hourlyFailedTransactionCount += increaseFailedTransactionBy(msg.tx.tx.code)
  snapshot.hourlyGasConsumption += BigInt(msg.tx.tx.gasUsed)

  await snapshot.save()
}

export async function getOrCreateContract(
  address: string,
  chainId: string,
  name?: string,
): Promise<Contract> {
  const contract = await Contract.get(address)
  if (contract) {
    return contract
  }

  const newContract = new Contract(address, chainId)
  newContract.name = name

  await sendBatchOfMessagesToKafka([newContract], NEW_CONTRACT_TOPIC)

  return newContract
}

async function getOrCreateContractHourlySnapshot(
  contract: Contract,
  block: CosmosBlock,
): Promise<ContractHourlySnapshot> {
  const snapshotId =
    contract.id + '-' + Math.floor(block.header.time.valueOf() / MILLISECONDS_PER_HOUR).toString()
  const previousSnapshot = await ContractHourlySnapshot.get(snapshotId)

  if (previousSnapshot) {
    return previousSnapshot
  }

  const newSnapshot = ContractHourlySnapshot.create({
    id: snapshotId,
    contractId: contract.id,
    hourlyTransactionCount: 0,
    hourlyFailedTransactionCount: 0,
    hourlyGasConsumption: BIGINT_ZERO,
    blockNumber: BigInt(block.header.height),
    timestamp: getTimestamp(block),
    chainId: block.header.chainId,
  })

  return newSnapshot
}

type IssueMsg = {
  issuer: string
  symbol: string
  subunit: string
  precision: number
  initialAmount: string
  description: string
  features: string[]
  burnRate: string
  sendCommissionRate: string
}

type Coin = {
  denom: string
  amount: string
}

type MsgMint = {
  sender: string
  coin: Coin
}

type MsgBurn = {
  sender: string
  coin: Coin
}

type MsgFreeze = {
  sender: string
  account: string
  coin: Coin
}

type MsgUnfreeze = MsgFreeze

type MsgGloballyFreeze = {
  sender: string
  denom: string
}

type MsgGloballyUnfreeze = MsgGloballyFreeze

type MsgSetWhitelistedLimit = {
  sender: string
  account: string
  coin: Coin
}
