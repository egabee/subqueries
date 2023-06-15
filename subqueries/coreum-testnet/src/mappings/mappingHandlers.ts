import { CosmosBlock, CosmosMessage, CosmosTransaction } from '@subql/types-cosmos'

import {
  BIGINT_ZERO,
  CHAIN_HOURLY_SNAPSHOT_TOPIC,
  MILLISECONDS_PER_HOUR,
  NEW_CONTRACT_TOPIC,
} from '../common/constants'
import { sendMessages } from '../common/kafka-producer'
import { getTimestamp } from '../common/utils'
import { ContractHourlySnapshot, Contract, ChainHourlySnapshot } from '../types'
import { decreaseAccountBalance, getOrCreateAccount, increaseAccountBalance } from './account'

export async function handleTransaction(tx: CosmosTransaction): Promise<void> {
  const hourlySnapshot = await getOrCreateChainHourlySnapshot(
    tx.block.block.header.chainId,
    tx.block,
  )
  hourlySnapshot.hourlyFailedTransactionCount += tx.tx.code === 0 ? 0 : 1
  hourlySnapshot.hourlyGasConsumption += BigInt(tx.tx.gasUsed)
  hourlySnapshot.hourlyTransactionCount += 1

  sendMessages([hourlySnapshot], CHAIN_HOURLY_SNAPSHOT_TOPIC)
  await hourlySnapshot.save()
}

type TransferMsg = {
  fromAddress: string
  toAddress: string
  amount: {
    denom: string
    amount: string
  }[]
}

export async function handleTransferMessage(msg: CosmosMessage<TransferMsg>): Promise<void> {
  const sender = msg.msg.decodedMsg.fromAddress
  const recipient = msg.msg.decodedMsg.toAddress
  const chainId = msg.block.header.chainId

  for (const { denom, amount } of msg.msg.decodedMsg.amount) {
    const senderAccountId = sender + '-' + denom
    const senderAccount = await getOrCreateAccount(senderAccountId, chainId)
    const senderBalance = await decreaseAccountBalance(senderAccount, BigInt(amount), chainId)
    senderBalance.blockNumber = msg.block.header.height
    senderBalance.timestamp = getTimestamp(msg.block)

    await senderAccount.save()
    await senderBalance.save()

    const recipientAccountId = recipient + '-' + denom
    const recipientAccount = await getOrCreateAccount(recipientAccountId, chainId)
    const recipientBalance = await increaseAccountBalance(recipientAccount, BigInt(amount), chainId)
    recipientBalance.blockNumber = msg.block.header.height
    recipientBalance.timestamp = getTimestamp(msg.block)

    await recipientAccount.save()
    await recipientBalance.save()
  }
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

export async function handleTokenIssuance(msg: CosmosMessage<IssueMsg>): Promise<void> {
  const { subunit, issuer, symbol } = msg.msg.decodedMsg

  const tokenId = subunit + '-' + issuer
  const token = await getOrCreateContract(tokenId, msg.block.header.chainId, symbol)

  await token.save()
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

  sendMessages([newContract], NEW_CONTRACT_TOPIC)

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

async function getOrCreateChainHourlySnapshot(
  chainId: string,
  block: CosmosBlock,
): Promise<ChainHourlySnapshot> {
  const snapshotId =
    chainId + '-' + Math.floor(block.header.time.valueOf() / MILLISECONDS_PER_HOUR).toString()
  const previousSnapshot = await ChainHourlySnapshot.get(snapshotId)

  if (previousSnapshot) {
    return previousSnapshot
  }

  const newSnapshot = ChainHourlySnapshot.create({
    id: snapshotId,
    hourlyFailedTransactionCount: 0,
    hourlyGasConsumption: BIGINT_ZERO,
    hourlyTransactionCount: 0,
    blockNumber: BigInt(block.header.height),
    timestamp: getTimestamp(block),
    chainId: block.header.chainId,
  })

  return newSnapshot
}
