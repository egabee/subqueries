import dotenv from 'dotenv'
dotenv.config({ path: '/app/.env' })

//Exports all handler functions
export * from './mappings/token'
export * from './mappings/block'
export * from './mappings/transfer'
export { handleTransaction } from './mappings/transaction-handler'
