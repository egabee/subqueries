import { Kafka } from 'kafkajs'
import { toJson } from './utils'
import {
  Account,
  AccountBalance,
  ChainHourlySnapshot,
  Contract,
  ContractHourlySnapshot,
  Token,
  TokenDailySnapshot,
  TokenHourlySnapshot,
} from '../types'

const kafka = new Kafka({
  brokers: process.env.KAFKA_BROKERS?.split(',') || [],
  clientId: 'coreum-producer-client',
})

const producer = kafka.producer({ allowAutoTopicCreation: true })
let producerConnected = false
async function connectProducer(): Promise<void> {
  await producer.connect()
  producerConnected = true
}

//eslint-disable-next-line
async function disconnectProducer(): Promise<void> {
  await producer.disconnect()
}

connectProducer()

type MessageType =
  | Account
  | Contract
  | AccountBalance
  | ContractHourlySnapshot
  | ChainHourlySnapshot
  | { height: number }
  | TokenHourlySnapshot
  | Token
  | TokenDailySnapshot

interface TopicMessages {
  topic: string
  messages: MessageType[]
}

/**
 * Send a batch of messages to Kafka
 * @param messages - An array of messages to send
 * @param topic - The topic to send the messages to
 */
export async function sendBatchOfMessagesToKafka(topicMessages: TopicMessages[]): Promise<void> {
  if (!producerConnected) {
    await connectProducer()
  }

  try {
    for (const { topic, messages } of topicMessages) {
      const messageResults = await producer.send({
        messages: messages.map((message) => ({
          value: toJson({ ...message, chainId: process.env.CHAIN_ID }),
        })),
        topic,
      })
      const failedMessages = messageResults.filter((messageResult) => messageResult.errorCode !== 0)

      if (failedMessages.length) {
        logger.error(`Error pushing ${failedMessages.length} messages to Kafka`)
      }
    }
  } catch (error) {
    logger.error(`Error pushing batch of messages to Kafka: ${JSON.stringify(error)}`)
    throw error // Rethrow the error for better visibility at the caller level
  }
}
