/**
 * Represents a message for issuing an asset.
 */
export type IssueMsg = {
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

/**
 * Represents a coin with denomination and amount.
 */
export type Coin = {
  denom: string
  amount: string
}

/**
 * Represents a message for minting new coins.
 */
export type MsgMint = {
  sender: string
  coin: Coin
}

/**
 * Represents a message for burning coins.
 */
export type MsgBurn = {
  sender: string
  coin: Coin
}

/**
 * Represents a message for freezing an account's coins.
 */
export type MsgFreeze = {
  sender: string
  account: string
  coin: Coin
}

// MsgUnfreeze is the same as MsgFreeze
export type MsgUnfreeze = MsgFreeze

/**
 * Represents a message for globally freezing a denomination.
 */
export type MsgGloballyFreeze = {
  sender: string
  denom: string
}

// MsgGloballyUnfreeze is the same as MsgGloballyFreeze
export type MsgGloballyUnfreeze = MsgGloballyFreeze

/**
 * Represents a message for setting a whitelisted limit.
 */
export type MsgSetWhitelistedLimit = {
  sender: string
  account: string
  coin: Coin
}

// TODO: Move it to cosmos types?
export type MsgSend = {
  amount: Coin[]
  toAddress: string
  fromAddress: string
}

export type MsgMultiSend = {
  inputs: { coins: Coin[]; address: string }[]
  outputs: { coins: Coin[]; address: string }[]
}

/** MsgExecuteContract submits the given message data to a smart contract */
export interface MsgExecuteContract {
  /** Sender is the that actor that signed the messages */
  sender: string
  /** Contract is the address of the smart contract */
  contract: string
  /** Funds coins that are transferred to the contract on execution */
  funds: Coin[]
}

/**
 * MsgInstantiateContract create a new smart contract instance for the given
 * code id.
 */
export interface MsgInstantiateContract {
  /** Sender is the that actor that signed the messages */
  sender: string
  /** Admin is an optional address that can execute migrations */
  admin: string
  /** CodeID is the reference to the stored WASM code */
  codeId: number
  /** Label is optional metadata to be stored with a contract instance. */
  label: string
  /** Funds coins that are transferred to the contract on instantiation */
  funds: Coin[]
}
