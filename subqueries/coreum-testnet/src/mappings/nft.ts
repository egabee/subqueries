import { CosmosMessage } from '@subql/types-cosmos'
import {MsgIssueMessage,MsgMintMessageNft,MsgBurnMessageNft,MsgFreezeMessageNft} from '../types/CosmosMessageTypes'
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
export async function handleNftMsgMint(message:CosmosMessage<MsgMintMessageNft>):Promise<void>{
    // const mint=message.msg.decodedMsg.data

    const transaction = createTransaction('MsgMint',message)
    await sendBatchOfMessagesToKafka([{messages:[transaction],topic:TOPIC_MESSAGE}])


}

export interface MsgBurn {
  sender: string;
  classId: string;
  id: string;
}
export async function handleNftMsgBurn(message:CosmosMessage<MsgBurnMessageNft>):Promise<void>{
  // const burn=message.msg.decodedMsg.data
  const transaction = createTransaction('MsgBurn',message)
  await sendBatchOfMessagesToKafka([{messages:[transaction],topic:TOPIC_MESSAGE}])
    

}

export interface MsgFreeze {
  sender: string;
  classId: string;
  id: string;
}
export async function handleNftMsgFreeze(message:CosmosMessage<MsgFreezeMessageNft>):Promise<void>{
  // const freeze=message.msg.decodedMsg.classId
  const transaction=createTransaction('MsgFreeze',message)
  await sendBatchOfMessagesToKafka([{messages:[transaction],topic:TOPIC_MESSAGE}])
}
