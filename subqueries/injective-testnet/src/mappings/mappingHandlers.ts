import { ChainHourlySnapshot, Contract, ContractHourlySnapshot } from '../types'
import { CosmosBlock, CosmosMessage, CosmosTransaction } from '@subql/types-cosmos'

import { sendMessages } from '../common/kafka-producer'
import { decreaseAccountBalance, getOrCreateAccount, increaseAccountBalance } from './account'
import {
  BIGINT_ZERO,
  CHAIN_HOURLY_SNAPSHOT_TOPIC,
  CONTRACT_HOURLY_SNAPSHOT_TOPIC,
  NEW_CONTRACT_TOPIC,
  MILLISECONDS_PER_HOUR,
} from '../common/constants'
import { getTimestamp } from '../common/utils'

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

  const amount = BigInt(msg.msg.decodedMsg.amount[0].amount)
  const chainId = msg.block.header.chainId

  if (sender) {
    const senderAccount = await getOrCreateAccount(sender, chainId)
    const accountBalance = await decreaseAccountBalance(senderAccount, amount, chainId)
    accountBalance.blockNumber = msg.block.header.height
    accountBalance.timestamp = getTimestamp(msg.block)

    await senderAccount.save()
    await accountBalance.save()
  }

  if (recipient) {
    const recipientAccount = await getOrCreateAccount(recipient, chainId)
    const accountBalance = await increaseAccountBalance(recipientAccount, amount, chainId)
    accountBalance.blockNumber = msg.block.header.height
    accountBalance.timestamp = getTimestamp(msg.block)

    await recipientAccount.save()
    await accountBalance.save()
  }
}

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

type ExecuteContractCompatMessage = {
  sender: string
  contract: string
  msg: any
  funds: string
}

export async function handleContractExecution(
  msg: CosmosMessage<ExecuteContractCompatMessage>,
): Promise<void> {
  const contract = await getOrCreateContract(msg.msg.decodedMsg.contract, msg.block.header.chainId)

  const hourlySnapshot = await getOrCreateContractHourlySnapshot(contract, msg.block)
  hourlySnapshot.timestamp = getTimestamp(msg.block)
  hourlySnapshot.blockNumber = BigInt(msg.block.header.height)
  hourlySnapshot.hourlyTransactionCount += 1
  hourlySnapshot.hourlyGasConsumption += BigInt(msg.tx.tx.gasUsed)
  hourlySnapshot.hourlyFailedTransactionCount += msg.tx.tx.code === 0 ? 0 : 1

  sendMessages([hourlySnapshot], CONTRACT_HOURLY_SNAPSHOT_TOPIC)

  await contract.save()
  await hourlySnapshot.save()
}

export async function getOrCreateContract(address: string, chainId: string): Promise<Contract> {
  const contract = await Contract.get(address)
  if (contract) {
    return contract
  }

  const newContract = new Contract(address, chainId)

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
