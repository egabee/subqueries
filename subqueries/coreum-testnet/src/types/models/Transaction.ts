// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';




export type TransactionProps = Omit<Transaction, NonNullable<FunctionPropertyNames<Transaction>>| '_name'>;

export class Transaction implements Entity {

    constructor(
        
            id: string,
        
            blockHeight: number,
        
            timestamp: bigint,
        
            status: string,
        
            chainId: string,
        
            gasUsed: bigint,
        
    ) {
        
            this.id = id;
        
            this.blockHeight = blockHeight;
        
            this.timestamp = timestamp;
        
            this.status = status;
        
            this.chainId = chainId;
        
            this.gasUsed = gasUsed;
        
    }


    public id: string;

    public blockHeight: number;

    public timestamp: bigint;

    public status: string;

    public chainId: string;

    public gasUsed: bigint;


    get _name(): string {
        return 'Transaction';
    }

    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save Transaction entity without an ID");
        await store.set('Transaction', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove Transaction entity without an ID");
        await store.remove('Transaction', id.toString());
    }

    static async get(id:string): Promise<Transaction | undefined>{
        assert((id !== null && id !== undefined), "Cannot get Transaction entity without an ID");
        const record = await store.get('Transaction', id.toString());
        if (record){
            return this.create(record as TransactionProps);
        }else{
            return;
        }
    }



    static create(record: TransactionProps): Transaction {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new this(
        
            record.id,
        
            record.blockHeight,
        
            record.timestamp,
        
            record.status,
        
            record.chainId,
        
            record.gasUsed,
        );
        Object.assign(entity,record);
        return entity;
    }
}
