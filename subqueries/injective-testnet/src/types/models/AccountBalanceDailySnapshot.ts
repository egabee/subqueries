// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';




export type AccountBalanceDailySnapshotProps = Omit<AccountBalanceDailySnapshot, NonNullable<FunctionPropertyNames<AccountBalanceDailySnapshot>>| '_name'>;

export class AccountBalanceDailySnapshot implements Entity {

    constructor(
        
            id: string,
        
            accountId: string,
        
        
            amount: bigint,
        
            blockNumber: bigint,
        
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

    public tokenId?: string;

    public amount: bigint;

    public blockNumber: bigint;

    public timestamp: bigint;


    get _name(): string {
        return 'AccountBalanceDailySnapshot';
    }

    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save AccountBalanceDailySnapshot entity without an ID");
        await store.set('AccountBalanceDailySnapshot', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove AccountBalanceDailySnapshot entity without an ID");
        await store.remove('AccountBalanceDailySnapshot', id.toString());
    }

    static async get(id:string): Promise<AccountBalanceDailySnapshot | undefined>{
        assert((id !== null && id !== undefined), "Cannot get AccountBalanceDailySnapshot entity without an ID");
        const record = await store.get('AccountBalanceDailySnapshot', id.toString());
        if (record){
            return this.create(record as AccountBalanceDailySnapshotProps);
        }else{
            return;
        }
    }


    static async getByAccountId(accountId: string): Promise<AccountBalanceDailySnapshot[] | undefined>{
      
      const records = await store.getByField('AccountBalanceDailySnapshot', 'accountId', accountId);
      return records.map(record => this.create(record as AccountBalanceDailySnapshotProps));
      
    }

    static async getByTokenId(tokenId: string): Promise<AccountBalanceDailySnapshot[] | undefined>{
      
      const records = await store.getByField('AccountBalanceDailySnapshot', 'tokenId', tokenId);
      return records.map(record => this.create(record as AccountBalanceDailySnapshotProps));
      
    }


    static create(record: AccountBalanceDailySnapshotProps): AccountBalanceDailySnapshot {
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
