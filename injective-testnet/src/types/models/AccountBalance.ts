// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';




export type AccountBalanceProps = Omit<AccountBalance, NonNullable<FunctionPropertyNames<AccountBalance>>| '_name'>;

export class AccountBalance implements Entity {

    constructor(
        
            id: string,
        
            accountId: string,
        
        
            amount: bigint,
        
            blockNumber: number,
        
            timestamp: bigint,
        
    ) {
        
            this.id = id;
        
            this.accountId = accountId;
        
            this.amount = amount;
        
            this.blockNumber = blockNumber;
        
            this.timestamp = timestamp;
        
    }


    public id: string;

    public accountId: string;

    public contractId?: string;

    public amount: bigint;

    public blockNumber: number;

    public timestamp: bigint;


    get _name(): string {
        return 'AccountBalance';
    }

    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save AccountBalance entity without an ID");
        await store.set('AccountBalance', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove AccountBalance entity without an ID");
        await store.remove('AccountBalance', id.toString());
    }

    static async get(id:string): Promise<AccountBalance | undefined>{
        assert((id !== null && id !== undefined), "Cannot get AccountBalance entity without an ID");
        const record = await store.get('AccountBalance', id.toString());
        if (record){
            return this.create(record as AccountBalanceProps);
        }else{
            return;
        }
    }


    static async getByAccountId(accountId: string): Promise<AccountBalance[] | undefined>{
      
      const records = await store.getByField('AccountBalance', 'accountId', accountId);
      return records.map(record => this.create(record as AccountBalanceProps));
      
    }

    static async getByContractId(contractId: string): Promise<AccountBalance[] | undefined>{
      
      const records = await store.getByField('AccountBalance', 'contractId', contractId);
      return records.map(record => this.create(record as AccountBalanceProps));
      
    }


    static create(record: AccountBalanceProps): AccountBalance {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new this(
        
            record.id,
        
            record.accountId,
        
            record.amount,
        
            record.blockNumber,
        
            record.timestamp,
        );
        Object.assign(entity,record);
        return entity;
    }
}
