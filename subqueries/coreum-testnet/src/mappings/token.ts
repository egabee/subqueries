import { CosmosBlock, CosmosMessage } from '@subql/types-cosmos'

import {
  IssueMsg,
  MsgBurn,
  MsgFreeze,
  MsgGloballyFreeze,
  MsgMint,
  MsgGloballyUnfreeze,
  MsgSetWhitelistedLimit,
  MsgUnfreeze,
} from './coreum-types'
import { Token, TokenDailySnapshot, TokenHourlySnapshot } from '../types'
import { sendBatchOfMessagesToKafka } from '../common/kafka-producer'
import { getTimestamp, toJson } from '../common/utils'
import {
  ACCOUNT_BALANCE_TOPIC,
  BIGINT_ONE,
  BIGINT_ZERO,
  EMPTY_STRING,
  MILLISECONDS_PER_HOUR,
  MILLISECONDS_PER_DAY,
  TOKEN_TOPIC,
  TOKEN_HOURLY_SNAPSHOT_TOPIC,
  TOKEN_DAILY_SNAPSHOT_TOPIC,
  TOKEN_UPDATE_TOPIC,
  TRANSACTION_TOPIC,
  ACCOUNT_TOPIC,
} from '../common/constants'
import { decreaseAccountBalance, getOrCreateAccount, increaseAccountBalance } from './account'
import { upsertTransaction } from './tx'

export async function handleIssueMsg(msg: CosmosMessage<IssueMsg>): Promise<void> {
  const {
    subunit,
    issuer,
    symbol,
    initialAmount,
    precision,
    description,
    features,
    burnRate,
    sendCommissionRate,
  } = msg.msg.decodedMsg

  const tokenId = subunit + '-' + issuer
  const token = await getOrCreateToken(tokenId)

  token.issuer = issuer
  token.symbol = symbol
  token.subunit = subunit
  token.precision = precision
  token.initialAmount = initialAmount
  token.description = description
  token.features = features.join()
  token.burnRate = burnRate
  token.sendCommissionRate = sendCommissionRate
  token.totalSupply = BigInt(initialAmount)

  const account = await getOrCreateAccount(issuer)
  const balance = await increaseAccountBalance(account, initialAmount, msg.block)

  const hourlySnapshot = await getOrCreateTokenHourlySnapshot(token, msg.block)
  const dailySnapshot = await getOrCreateTokenDailySnapshot(token, msg.block)

  const transaction = await upsertTransaction(msg)

  await sendBatchOfMessagesToKafka([
    { messages: [account], topic: ACCOUNT_TOPIC },
    { messages: [balance], topic: ACCOUNT_BALANCE_TOPIC },
    { messages: [token], topic: TOKEN_TOPIC },
    { messages: [balance], topic: ACCOUNT_BALANCE_TOPIC },
    { messages: [transaction], topic: TRANSACTION_TOPIC },
    { messages: [hourlySnapshot], topic: TOKEN_HOURLY_SNAPSHOT_TOPIC },
    { messages: [dailySnapshot], topic: TOKEN_DAILY_SNAPSHOT_TOPIC },
  ])

  await token.save()
  await hourlySnapshot.save()
  await dailySnapshot.save()
  await transaction.save()
  await account.save()
  await balance.save()
}

export async function handleMsgMint(msg: CosmosMessage<MsgMint>): Promise<void> {
  const {
    coin: { amount, denom },
    sender,
  } = msg.msg.decodedMsg
  const { height } = msg.block.header

  const transaction = await upsertTransaction(msg)

  const token = await Token.get(denom)
  if (token) {
    token.mintCount += BIGINT_ONE
    token.totalMinted += BigInt(amount)
    token.totalSupply += BigInt(amount)

    const account = await getOrCreateAccount(sender)
    const balance = await increaseAccountBalance(account, amount, msg.block)
    balance.blockNumber = height
    balance.timestamp = getTimestamp(msg.block)

    const dailySnapshot = await getOrCreateTokenDailySnapshot(token, msg.block)
    dailySnapshot.dailyTotalSupply = token.totalSupply
    dailySnapshot.dailyEventCount += 1
    dailySnapshot.dailyMintCount += 1
    dailySnapshot.dailyMintAmount += BigInt(amount)
    dailySnapshot.blockNumber = BigInt(height)
    dailySnapshot.timestamp = getTimestamp(msg.block)

    const hourlySnapshot = await getOrCreateTokenHourlySnapshot(token, msg.block)
    hourlySnapshot.hourlyTotalSupply = token.totalSupply
    hourlySnapshot.hourlyEventCount += 1
    hourlySnapshot.hourlyMintCount += 1
    hourlySnapshot.hourlyMintAmount += BigInt(amount)
    hourlySnapshot.blockNumber = BigInt(height)
    hourlySnapshot.timestamp = getTimestamp(msg.block)

    transaction.tokenId = token.id

    await sendBatchOfMessagesToKafka([
      { messages: [token], topic: TOKEN_TOPIC },
      { messages: [balance], topic: ACCOUNT_BALANCE_TOPIC },
      { messages: [hourlySnapshot], topic: TOKEN_HOURLY_SNAPSHOT_TOPIC },
      { messages: [dailySnapshot], topic: TOKEN_DAILY_SNAPSHOT_TOPIC },
    ])

    await token.save()
    await account.save()
    await balance.save()
    await hourlySnapshot.save()
    await dailySnapshot.save()
  }

  await sendBatchOfMessagesToKafka([{ messages: [transaction], topic: TRANSACTION_TOPIC }])
  await transaction.save()
}

export async function handleMsgBurn(msg: CosmosMessage<MsgBurn>): Promise<void> {
  const {
    coin: { amount, denom },
    sender,
  } = msg.msg.decodedMsg
  const { height } = msg.block.header

  const transaction = await upsertTransaction(msg)

  const token = await Token.get(denom)
  if (token) {
    token.burnCount += BIGINT_ONE
    token.totalBurned += BigInt(amount)
    token.totalSupply -= BigInt(amount)

    const account = await getOrCreateAccount(sender)
    const balance = await decreaseAccountBalance(account, amount, msg.block)
    balance.blockNumber = height
    balance.timestamp = getTimestamp(msg.block)

    const dailySnapshot = await getOrCreateTokenDailySnapshot(token, msg.block)
    dailySnapshot.dailyTotalSupply = token.totalSupply
    dailySnapshot.dailyEventCount += 1
    dailySnapshot.dailyBurnCount += 1
    dailySnapshot.dailyBurnAmount += BigInt(amount)
    dailySnapshot.blockNumber = BigInt(height)
    dailySnapshot.timestamp = getTimestamp(msg.block)

    const hourlySnapshot = await getOrCreateTokenHourlySnapshot(token, msg.block)
    hourlySnapshot.hourlyTotalSupply = token.totalSupply
    hourlySnapshot.hourlyEventCount += 1
    hourlySnapshot.hourlyBurnCount += 1
    hourlySnapshot.hourlyBurnAmount += BigInt(amount)
    hourlySnapshot.blockNumber = BigInt(height)
    hourlySnapshot.timestamp = getTimestamp(msg.block)

    transaction.tokenId = token.id

    await sendBatchOfMessagesToKafka([
      { messages: [balance], topic: ACCOUNT_BALANCE_TOPIC },
      { messages: [hourlySnapshot], topic: TOKEN_HOURLY_SNAPSHOT_TOPIC },
      { messages: [dailySnapshot], topic: TOKEN_DAILY_SNAPSHOT_TOPIC },
    ])

    await token.save()
    await account.save()
    await balance.save()
    await hourlySnapshot.save()
    await dailySnapshot.save()
  }

  await sendBatchOfMessagesToKafka([{ messages: [transaction], topic: TRANSACTION_TOPIC }])
  await transaction.save()
}

export async function handleMsgFreeze(msg: CosmosMessage<MsgFreeze>): Promise<void> {
  const {
    coin: { amount, denom },
  } = msg.msg.decodedMsg
  const { height } = msg.block.header

  const transaction = await upsertTransaction(msg)

  const token = await Token.get(denom)
  if (token) {
    token.frozenAmount += BigInt(amount)

    const dailySnapshot = await getOrCreateTokenDailySnapshot(token, msg.block)
    dailySnapshot.dailyEventCount += 1
    dailySnapshot.frozenAccountCount += 1
    dailySnapshot.blockNumber = BigInt(height)
    dailySnapshot.timestamp = getTimestamp(msg.block)

    const hourlySnapshot = await getOrCreateTokenHourlySnapshot(token, msg.block)
    hourlySnapshot.hourlyEventCount += 1
    hourlySnapshot.frozenAccountCount += 1
    hourlySnapshot.blockNumber = BigInt(height)
    hourlySnapshot.timestamp = getTimestamp(msg.block)

    transaction.tokenId = token.id

    await sendBatchOfMessagesToKafka([
      { messages: [token], topic: TOKEN_UPDATE_TOPIC },
      { messages: [hourlySnapshot], topic: TOKEN_HOURLY_SNAPSHOT_TOPIC },
      { messages: [dailySnapshot], topic: TOKEN_DAILY_SNAPSHOT_TOPIC },
    ])

    await token.save()
    await hourlySnapshot.save()
    await dailySnapshot.save()
  }

  await sendBatchOfMessagesToKafka([{ messages: [transaction], topic: TRANSACTION_TOPIC }])
  await transaction.save()
}

export async function handleMsgUnfreeze(msg: CosmosMessage<MsgUnfreeze>): Promise<void> {
  const {
    coin: { amount, denom },
  } = msg.msg.decodedMsg
  const { height } = msg.block.header

  const transaction = await upsertTransaction(msg)

  const token = await Token.get(denom)
  if (token) {
    token.frozenAmount -= BigInt(amount)

    const dailySnapshot = await getOrCreateTokenDailySnapshot(token, msg.block)
    dailySnapshot.dailyEventCount += 1
    dailySnapshot.frozenAccountCount -= 1
    dailySnapshot.blockNumber = BigInt(height)
    dailySnapshot.timestamp = getTimestamp(msg.block)

    const hourlySnapshot = await getOrCreateTokenHourlySnapshot(token, msg.block)
    hourlySnapshot.hourlyEventCount += 1
    hourlySnapshot.frozenAccountCount -= 1
    hourlySnapshot.blockNumber = BigInt(height)
    hourlySnapshot.timestamp = getTimestamp(msg.block)

    transaction.tokenId = token.id

    await sendBatchOfMessagesToKafka([
      { messages: [token], topic: TOKEN_UPDATE_TOPIC },
      { messages: [hourlySnapshot], topic: TOKEN_HOURLY_SNAPSHOT_TOPIC },
      { messages: [dailySnapshot], topic: TOKEN_DAILY_SNAPSHOT_TOPIC },
    ])

    await token.save()
    await hourlySnapshot.save()
    await dailySnapshot.save()
  }

  await sendBatchOfMessagesToKafka([{ messages: [transaction], topic: TRANSACTION_TOPIC }])
  await transaction.save()
}

export async function handleMsgGloballyFreeze(
  msg: CosmosMessage<MsgGloballyFreeze>,
): Promise<void> {
  const { denom } = msg.msg.decodedMsg
  const { height } = msg.block.header

  const transaction = await upsertTransaction(msg)

  const token = await Token.get(denom)
  if (token) {
    token.globallyFrozen = true

    const dailySnapshot = await getOrCreateTokenDailySnapshot(token, msg.block)
    dailySnapshot.dailyEventCount += 1
    dailySnapshot.blockNumber = BigInt(height)
    dailySnapshot.timestamp = getTimestamp(msg.block)

    const hourlySnapshot = await getOrCreateTokenHourlySnapshot(token, msg.block)
    hourlySnapshot.hourlyEventCount += 1
    hourlySnapshot.blockNumber = BigInt(height)
    hourlySnapshot.timestamp = getTimestamp(msg.block)

    transaction.tokenId = token.id

    await sendBatchOfMessagesToKafka([
      { messages: [token], topic: TOKEN_UPDATE_TOPIC },
      { messages: [hourlySnapshot], topic: TOKEN_HOURLY_SNAPSHOT_TOPIC },
      { messages: [dailySnapshot], topic: TOKEN_DAILY_SNAPSHOT_TOPIC },
    ])
    await token.save()
    await hourlySnapshot.save()
    await dailySnapshot.save()
  }

  await sendBatchOfMessagesToKafka([{ messages: [transaction], topic: TRANSACTION_TOPIC }])
  await transaction.save()
}

export async function handleMsgGloballyUnfreeze(
  msg: CosmosMessage<MsgGloballyUnfreeze>,
): Promise<void> {
  const { denom } = msg.msg.decodedMsg
  const { height } = msg.block.header

  const transaction = await upsertTransaction(msg)

  const token = await Token.get(denom)
  if (token) {
    token.globallyFrozen = false

    const dailySnapshot = await getOrCreateTokenDailySnapshot(token, msg.block)
    dailySnapshot.dailyEventCount += 1
    dailySnapshot.blockNumber = BigInt(height)
    dailySnapshot.timestamp = getTimestamp(msg.block)

    const hourlySnapshot = await getOrCreateTokenHourlySnapshot(token, msg.block)
    hourlySnapshot.hourlyEventCount += 1
    hourlySnapshot.blockNumber = BigInt(height)
    hourlySnapshot.timestamp = getTimestamp(msg.block)

    transaction.tokenId = token.id

    await sendBatchOfMessagesToKafka([
      { messages: [token], topic: TOKEN_UPDATE_TOPIC },
      { messages: [hourlySnapshot], topic: TOKEN_HOURLY_SNAPSHOT_TOPIC },
      { messages: [dailySnapshot], topic: TOKEN_DAILY_SNAPSHOT_TOPIC },
    ])

    await token.save()
    await hourlySnapshot.save()
    await dailySnapshot.save()
  }

  await sendBatchOfMessagesToKafka([{ messages: [transaction], topic: TRANSACTION_TOPIC }])
  await transaction.save()
}

export async function handleMsgSetWhitelistedLimit(
  msg: CosmosMessage<MsgSetWhitelistedLimit>,
): Promise<void> {
  const { coin } = msg.msg.decodedMsg
  const { height } = msg.block.header

  const transaction = await upsertTransaction(msg)

  const token = await Token.get(coin.denom)
  if (token) {
    const dailySnapshot = await getOrCreateTokenDailySnapshot(token, msg.block)
    dailySnapshot.dailyEventCount += 1
    dailySnapshot.whiteListedAccountCount += 1
    dailySnapshot.blockNumber = BigInt(height)
    dailySnapshot.timestamp = getTimestamp(msg.block)

    const hourlySnapshot = await getOrCreateTokenHourlySnapshot(token, msg.block)
    hourlySnapshot.hourlyEventCount += 1
    hourlySnapshot.whiteListedAccountCount += 1
    hourlySnapshot.blockNumber = BigInt(height)
    hourlySnapshot.timestamp = getTimestamp(msg.block)

    transaction.tokenId = token.id

    await sendBatchOfMessagesToKafka([
      { messages: [hourlySnapshot], topic: TOKEN_HOURLY_SNAPSHOT_TOPIC },
      { messages: [dailySnapshot], topic: TOKEN_DAILY_SNAPSHOT_TOPIC },
    ])

    await transaction.save()
    await hourlySnapshot.save()
    await dailySnapshot.save()
  }

  await sendBatchOfMessagesToKafka([{ messages: [transaction], topic: TRANSACTION_TOPIC }])
  await transaction.save()
}

export async function getOrCreateToken(tokenId: string): Promise<Token> {
  const token = await Token.get(tokenId)

  logger.info(`token: ${toJson(token)}`)
  logger.info(`tokenid: ${tokenId}`)

  if (token) {
    return token
  }

  const newToken = new Token(
    tokenId,
    EMPTY_STRING,
    EMPTY_STRING,
    EMPTY_STRING,
    0,
    EMPTY_STRING,
    EMPTY_STRING,
    EMPTY_STRING,
    BIGINT_ZERO,
    false,
    EMPTY_STRING,
    BIGINT_ONE,
    BIGINT_ONE,
    BIGINT_ZERO,
    BIGINT_ZERO,
    BIGINT_ZERO,
    BIGINT_ZERO,
    BIGINT_ZERO,
    BIGINT_ZERO,
  )

  return newToken
}

async function getOrCreateTokenHourlySnapshot(
  token: Token,
  block: CosmosBlock,
): Promise<TokenHourlySnapshot> {
  const snapshotId =
    token.id + '-' + Math.floor(block.header.time.valueOf() / MILLISECONDS_PER_HOUR).toString()
  const previousSnapshot = await TokenHourlySnapshot.get(snapshotId)

  if (previousSnapshot) {
    return previousSnapshot
  }

  const newSnapshot = new TokenHourlySnapshot(
    snapshotId,
    token.id,
    token.totalSupply,
    token.currentHolderCount,
    token.cumulativeHolderCount,
    0,
    0,
    0,
    0,
    BIGINT_ZERO,
    0,
    BIGINT_ZERO,
    0,
    BIGINT_ZERO,
    BigInt(block.header.height),
    getTimestamp(block),
  )

  return newSnapshot
}

async function getOrCreateTokenDailySnapshot(
  token: Token,
  block: CosmosBlock,
): Promise<TokenDailySnapshot> {
  const snapshotId =
    token.id + '-' + Math.floor(block.header.time.valueOf() / MILLISECONDS_PER_DAY).toString()
  const previousSnapshot = await TokenDailySnapshot.get(snapshotId)

  if (previousSnapshot) {
    return previousSnapshot
  }

  const newSnapshot = new TokenDailySnapshot(
    snapshotId,
    token.id,
    token.totalSupply,
    token.currentHolderCount,
    token.cumulativeHolderCount,
    0,
    0,
    0,
    0,
    BIGINT_ZERO,
    0,
    BIGINT_ZERO,
    0,
    BIGINT_ZERO,
    BigInt(block.header.height),
    getTimestamp(block),
  )

  return newSnapshot
}
