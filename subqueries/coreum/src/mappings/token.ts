import { CosmosMessage } from '@subql/types-cosmos'

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
import { sendBatchOfMessagesToKafka } from '../common/kafka-producer'
import { TOPIC_MESSAGE } from '../common/constants'

import { createTransaction } from './helper'

export async function handleIssueMsg(msg: CosmosMessage<IssueMsg>): Promise<void> {
  await sendBatchOfMessagesToKafka([
    { messages: [createTransaction('MsgIssue', msg)], topic: TOPIC_MESSAGE },
  ])
}

export async function handleMsgMint(msg: CosmosMessage<MsgMint>): Promise<void> {
  await sendBatchOfMessagesToKafka([
    { messages: [createTransaction('MsgMint', msg)], topic: TOPIC_MESSAGE },
  ])
}

export async function handleMsgBurn(msg: CosmosMessage<MsgBurn>): Promise<void> {
  await sendBatchOfMessagesToKafka([
    { messages: [createTransaction('MsgBurn', msg)], topic: TOPIC_MESSAGE },
  ])
}

export async function handleMsgFreeze(msg: CosmosMessage<MsgFreeze>): Promise<void> {
  await sendBatchOfMessagesToKafka([
    { messages: [createTransaction('MsgFreeze', msg)], topic: TOPIC_MESSAGE },
  ])
}

export async function handleMsgUnfreeze(msg: CosmosMessage<MsgUnfreeze>): Promise<void> {
  await sendBatchOfMessagesToKafka([
    { messages: [createTransaction('MsgUnfreeze', msg)], topic: TOPIC_MESSAGE },
  ])
}

export async function handleMsgGloballyFreeze(
  msg: CosmosMessage<MsgGloballyFreeze>,
): Promise<void> {
  await sendBatchOfMessagesToKafka([
    { messages: [createTransaction('MsgGloballyFreeze', msg)], topic: TOPIC_MESSAGE },
  ])
}

export async function handleMsgGloballyUnfreeze(
  msg: CosmosMessage<MsgGloballyUnfreeze>,
): Promise<void> {
  await sendBatchOfMessagesToKafka([
    { messages: [createTransaction('MsgGloballyUnfreeze', msg)], topic: TOPIC_MESSAGE },
  ])
}

export async function handleMsgSetWhitelistedLimit(
  msg: CosmosMessage<MsgSetWhitelistedLimit>,
): Promise<void> {
  await sendBatchOfMessagesToKafka([
    { messages: [createTransaction('MsgSetWhitelistedLimit', msg)], topic: TOPIC_MESSAGE },
  ])
}
