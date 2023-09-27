import dotenv from 'dotenv'
dotenv.config({ path: '/app/.env' })

//Exports all handler functions
export * from './mappings/contract'
