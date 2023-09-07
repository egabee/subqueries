import { CosmosBlock } from '@subql/types-cosmos'
import { BIGINT_ZERO, MILLISECONDS_PER_HOUR, CONTRACT_TOPIC } from '../common/constants'
import { sendBatchOfMessagesToKafka } from '../common/kafka-producer'
import { Contract, ContractHourlySnapshot } from '../types'
import { getTimestamp } from '../common/utils'

async function getOrCreateContract(address: string, name?: string): Promise<Contract> {
  const contract = await Contract.get(address)
  if (contract) {
    return contract
  }

  const newContract = new Contract(address)
  newContract.name = name

  await sendBatchOfMessagesToKafka([{ messages: [newContract], topic: CONTRACT_TOPIC }])

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
  })

  return newSnapshot
}
