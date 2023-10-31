import dotenv from 'dotenv'
dotenv.config({ path: '/app/.env' })

//Exports all handler functions
export * from './mappings/token'
export * from './mappings/bank'
export * from './mappings/contract'
