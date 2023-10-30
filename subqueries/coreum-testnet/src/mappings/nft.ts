import { CosmosMessage } from '@subql/types-cosmos'
import { sendBatchOfMessagesToKafka } from '../common/kafka-producer'
import { TOPIC_MESSAGE } from '../common/constants'
import { createTransaction } from './helper'

export enum ClassFeature {
  burning = 0,
  freezing = 1,
  whitelisting = 2,
  disable_sending = 3,
  UNRECOGNIZED = -1,
}

export interface MsgIssueClass {
  issuer: string
  symbol: string
  name: string
  description: string
  uri: string
  uriHash: string
  data: any
  features: ClassFeature[]
  royaltyRate: string
}

export async function handleNftIssue(message: CosmosMessage<MsgIssueClass>): Promise<void> {
  // to get any propertie of data 
  // const issuer = message.msg.decodedMsg.issuer
  // const symbol = message.msg.decodedMsg.symbol

  
  const transaction = createTransaction('MsgIssueClass',message)
  await sendBatchOfMessagesToKafka([{ messages: [transaction],topic: TOPIC_MESSAGE }])
}

export interface MsgMint {
    sender: string;
    classId: string;
    id: string;
    uri: string;
    uriHash: string;
    data: any;
}
export async function handleNftMsgMint(message:CosmosMessage<MsgMint>):Promise<void>{
    // const mint=message.msg.decodedMsg.data

    const transaction = createTransaction('MsgMintNFT',message)
    await sendBatchOfMessagesToKafka([{messages:[transaction],topic:TOPIC_MESSAGE}])


}

export interface MsgBurn {
  sender: string;
  classId: string;
  id: string;
}
export async function handleNftMsgBurn(message:CosmosMessage<MsgBurn>):Promise<void>{
  // const burn=message.msg.decodedMsg.data
  const transaction = createTransaction('MsgBurnNFT',message)
  await sendBatchOfMessagesToKafka([{messages:[transaction],topic:TOPIC_MESSAGE}])
    

}

export interface MsgFreeze {
  sender: string;
  classId: string;
  id: string;
}
export async function handleNftMsgFreeze(message:CosmosMessage<MsgFreeze>):Promise<void>{
  // const freeze=message.msg.decodedMsg.classId
  const transaction=createTransaction('MsgFreezeNFT',message)
  await sendBatchOfMessagesToKafka([{messages:[transaction],topic:TOPIC_MESSAGE}])
}

// --------------------------------------------------
export interface MsgUnfreeze {
  sender: string;
  classId: string;
  id: string;
}
export async function handleNftMsgUnfreeze(message:CosmosMessage<MsgUnfreeze>):Promise<void>{
  const transaction=createTransaction('MsgUnFreezeNFT',message)
  await sendBatchOfMessagesToKafka([{messages:[transaction],topic:TOPIC_MESSAGE}])
}

export interface MsgAddToWhitelist {
  sender: string;
  classId: string;
  id: string;
  account: string;
}

export async function handleNftMsgAddToWhitelist(message:CosmosMessage<MsgAddToWhitelist>):Promise<void> {
  const transaction=createTransaction('MsgAddToWhitelistNFT',message)
  await sendBatchOfMessagesToKafka([{messages:[transaction],topic:TOPIC_MESSAGE}])
}

export interface MsgRemoveFromWhitelist {
  sender: string;
  classId: string;
  id: string;
  account: string;
}

export async function handleNftMsgRemoveFromWhitelist(message:CosmosMessage<MsgRemoveFromWhitelist>):Promise<void> {
  const transaction=createTransaction('MsgRemoveFromWhitelistNFT',message)
  await sendBatchOfMessagesToKafka([{messages:[transaction],topic:TOPIC_MESSAGE}])
}
