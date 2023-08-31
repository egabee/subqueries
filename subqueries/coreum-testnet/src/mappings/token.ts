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
import { getTimestamp, isTransactionSuccessful } from '../common/utils'
import {
  ACCOUNT_BALANCE_TOPIC,
  BIGINT_ONE,
  BIGINT_ZERO,
  EMPTY_STRING,
  MILLISECONDS_PER_HOUR,
  MILLISECONDS_PER_DAY,
  NEW_TOKEN_TOPIC,
  TOKEN_HOURLY_SNAPSHOT_TOPIC,
  TOKEN_DAILY_SNAPSHOT_TOPIC,
  TOKEN_UPDATE_TOPIC,
} from '../common/constants'
import { decreaseAccountBalance, getOrCreateAccount, increaseAccountBalance } from './account'

export async function handleIssueMsg(msg: CosmosMessage<IssueMsg>): Promise<void> {
  // Early return if transaction was failed
  if (!isTransactionSuccessful(msg.tx)) {
    return
  }

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
  token.features = features.reduce((p, c) => p + ',' + c)
  token.burnRate = burnRate
  token.sendCommissionRate = sendCommissionRate
  token.totalSupply = BigInt(initialAmount)

  const account = await getOrCreateAccount(issuer, chainId)
  const balance = await increaseAccountBalance(
    account,
    { denom: tokenId, amount: initialAmount },
    msg.block,
  )

  const snapshot = await getOrCreateTokenHourlySnapshot(token, msg.block)

  await sendBatchOfMessagesToKafka([
    { messages: [snapshot], topic: TOKEN_HOURLY_SNAPSHOT_TOPIC },
    { messages: [token], topic: NEW_TOKEN_TOPIC },
    { messages: [balance], topic: ACCOUNT_BALANCE_TOPIC },
  ])

  await token.save()
  await account.save()
  await balance.save()
}

export async function handleMsgMint(msg: CosmosMessage<MsgMint>): Promise<void> {
  // Early return if transaction was failed
  if (!isTransactionSuccessful(msg.tx)) {
    return
  }

  const { coin, sender } = msg.msg.decodedMsg
  const { chainId, height } = msg.block.header

  const token = await getOrCreateToken(coin.denom)
  token.mintCount += BIGINT_ONE
  token.totalMinted += BigInt(coin.amount)
  token.totalSupply += BigInt(coin.amount)

  const account = await getOrCreateAccount(sender, chainId)
  const balance = await increaseAccountBalance(account, coin, msg.block)
  balance.blockNumber = height
  balance.timestamp = getTimestamp(msg.block)

  const dailySnapshot = await getOrCreateTokenDailySnapshot(token, msg.block)
  dailySnapshot.dailyTotalSupply = token.totalSupply
  dailySnapshot.dailyEventCount += 1
  dailySnapshot.dailyMintCount += 1
  dailySnapshot.dailyMintAmount += BigInt(coin.amount)
  dailySnapshot.blockNumber = BigInt(height)
  dailySnapshot.timestamp = getTimestamp(msg.block)

  const hourlySnapshot = await getOrCreateTokenHourlySnapshot(token, msg.block)
  hourlySnapshot.hourlyTotalSupply = token.totalSupply
  hourlySnapshot.hourlyEventCount += 1
  hourlySnapshot.hourlyMintCount += 1
  hourlySnapshot.hourlyMintAmount += BigInt(coin.amount)
  hourlySnapshot.blockNumber = BigInt(height)
  hourlySnapshot.timestamp = getTimestamp(msg.block)

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

export async function handleMsgBurn(msg: CosmosMessage<MsgBurn>): Promise<void> {
  // Early return if transaction was failed
  if (!isTransactionSuccessful(msg.tx)) {
    return
  }

  const { coin, sender } = msg.msg.decodedMsg
  const { chainId, height } = msg.block.header

  const token = await getOrCreateToken(coin.denom)
  token.burnCount += BIGINT_ONE
  token.totalBurned += BigInt(coin.amount)
  token.totalSupply -= BigInt(coin.amount)

  const account = await getOrCreateAccount(sender, chainId)
  const balance = await decreaseAccountBalance(account, coin, msg.block)
  balance.blockNumber = height
  balance.timestamp = getTimestamp(msg.block)

  const dailySnapshot = await getOrCreateTokenDailySnapshot(token, msg.block)
  dailySnapshot.dailyTotalSupply = token.totalSupply
  dailySnapshot.dailyEventCount += 1
  dailySnapshot.dailyBurnCount += 1
  dailySnapshot.dailyBurnAmount += BigInt(coin.amount)
  dailySnapshot.blockNumber = BigInt(height)
  dailySnapshot.timestamp = getTimestamp(msg.block)

  const hourlySnapshot = await getOrCreateTokenHourlySnapshot(token, msg.block)
  hourlySnapshot.hourlyTotalSupply = token.totalSupply
  hourlySnapshot.hourlyEventCount += 1
  hourlySnapshot.hourlyBurnCount += 1
  hourlySnapshot.hourlyBurnAmount += BigInt(coin.amount)
  hourlySnapshot.blockNumber = BigInt(height)
  hourlySnapshot.timestamp = getTimestamp(msg.block)

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

export async function handleMsgFreeze(msg: CosmosMessage<MsgFreeze>): Promise<void> {
  // Early return if transaction was failed
  if (!isTransactionSuccessful(msg.tx)) {
    return
  }

  const { coin } = msg.msg.decodedMsg
  const { height } = msg.block.header

  const token = await getOrCreateToken(coin.denom)
  token.frozenAmount += BigInt(coin.amount)

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

  await sendBatchOfMessagesToKafka([
    { messages: [token], topic: TOKEN_UPDATE_TOPIC },
    { messages: [hourlySnapshot], topic: TOKEN_HOURLY_SNAPSHOT_TOPIC },
    { messages: [dailySnapshot], topic: TOKEN_DAILY_SNAPSHOT_TOPIC },
  ])

  await token.save()
  await hourlySnapshot.save()
  await dailySnapshot.save()
}

export async function handleMsgUnfreeze(msg: CosmosMessage<MsgUnfreeze>): Promise<void> {
  // Early return if transaction was failed
  if (!isTransactionSuccessful(msg.tx)) {
    return
  }

  const { coin } = msg.msg.decodedMsg
  const { height } = msg.block.header

  const token = await getOrCreateToken(coin.denom)
  token.frozenAmount -= BigInt(coin.amount)

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

  await sendBatchOfMessagesToKafka([
    { messages: [token], topic: TOKEN_UPDATE_TOPIC },
    { messages: [hourlySnapshot], topic: TOKEN_HOURLY_SNAPSHOT_TOPIC },
    { messages: [dailySnapshot], topic: TOKEN_DAILY_SNAPSHOT_TOPIC },
  ])

  await token.save()
  await hourlySnapshot.save()
  await dailySnapshot.save()
}

export async function handleMsgGloballyFreeze(
  msg: CosmosMessage<MsgGloballyFreeze>,
): Promise<void> {
  // Early return if transaction was failed
  if (!isTransactionSuccessful(msg.tx)) {
    return
  }

  const { denom } = msg.msg.decodedMsg
  const { height } = msg.block.header

  const token = await getOrCreateToken(denom)
  token.globallyFrozen = true

  const dailySnapshot = await getOrCreateTokenDailySnapshot(token, msg.block)
  dailySnapshot.dailyEventCount += 1
  dailySnapshot.blockNumber = BigInt(height)
  dailySnapshot.timestamp = getTimestamp(msg.block)

  const hourlySnapshot = await getOrCreateTokenHourlySnapshot(token, msg.block)
  hourlySnapshot.hourlyEventCount += 1
  hourlySnapshot.blockNumber = BigInt(height)
  hourlySnapshot.timestamp = getTimestamp(msg.block)

  await sendBatchOfMessagesToKafka([
    { messages: [token], topic: TOKEN_UPDATE_TOPIC },
    { messages: [hourlySnapshot], topic: TOKEN_HOURLY_SNAPSHOT_TOPIC },
    { messages: [dailySnapshot], topic: TOKEN_DAILY_SNAPSHOT_TOPIC },
  ])

  await token.save()
  await hourlySnapshot.save()
  await dailySnapshot.save()
}

export async function handleMsgGloballyUnfreeze(
  msg: CosmosMessage<MsgGloballyUnfreeze>,
): Promise<void> {
  // Early return if transaction was failed
  if (!isTransactionSuccessful(msg.tx)) {
    return
  }

  const { denom } = msg.msg.decodedMsg
  const { height } = msg.block.header

  const token = await getOrCreateToken(denom)
  token.globallyFrozen = false

  const dailySnapshot = await getOrCreateTokenDailySnapshot(token, msg.block)
  dailySnapshot.dailyEventCount += 1
  dailySnapshot.blockNumber = BigInt(height)
  dailySnapshot.timestamp = getTimestamp(msg.block)

  const hourlySnapshot = await getOrCreateTokenHourlySnapshot(token, msg.block)
  hourlySnapshot.hourlyEventCount += 1
  hourlySnapshot.blockNumber = BigInt(height)
  hourlySnapshot.timestamp = getTimestamp(msg.block)

  await sendBatchOfMessagesToKafka([
    { messages: [token], topic: TOKEN_UPDATE_TOPIC },
    { messages: [hourlySnapshot], topic: TOKEN_HOURLY_SNAPSHOT_TOPIC },
    { messages: [dailySnapshot], topic: TOKEN_DAILY_SNAPSHOT_TOPIC },
  ])

  await token.save()
  await hourlySnapshot.save()
  await dailySnapshot.save()
}

export async function handleMsgSetWhitelistedLimit(
  msg: CosmosMessage<MsgSetWhitelistedLimit>,
): Promise<void> {
  // Early return if transaction was failed
  if (!isTransactionSuccessful(msg.tx)) {
    return
  }

  const { coin } = msg.msg.decodedMsg
  const { height } = msg.block.header

  const token = await getOrCreateToken(coin.denom)

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

  await sendBatchOfMessagesToKafka([
    { messages: [hourlySnapshot], topic: TOKEN_HOURLY_SNAPSHOT_TOPIC },
    { messages: [dailySnapshot], topic: TOKEN_DAILY_SNAPSHOT_TOPIC },
  ])

  await hourlySnapshot.save()
  await dailySnapshot.save()
}

async function getOrCreateToken(tokenId: string): Promise<Token> {
  let token = await Token.get(tokenId)

  if (token) {
    return token
  }

  token = new Token(
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

  return token
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
