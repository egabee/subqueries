// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';




export type TransferEventProps = Omit<TransferEvent, NonNullable<FunctionPropertyNames<TransferEvent>>| '_name'>;

export class TransferEvent implements Entity {

    constructor(
        
            id: string,
        
            hash: string,
        
            logIndex: number,
        
        
            amount: bigint,
        
            fromId: string,
        
            toId: string,
        
            blockNumber: bigint,
        
            timestamp: bigint,
        
    ) {
        
            this.id = id;
        
            this.hash = hash;
        
            this.logIndex = logIndex;
        
            this.amount = amount;
        
            this.fromId = fromId;
        
            this.toId = toId;
        
            this.blockNumber = blockNumber;
        
            this.timestamp = timestamp;
        
    }


    public id: string;

    public hash: string;

    public logIndex: number;

    public contractId?: string;

    public amount: bigint;

    public fromId: string;

    public toId: string;

    public blockNumber: bigint;

    public timestamp: bigint;


    get _name(): string {
        return 'TransferEvent';
    }

    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save TransferEvent entity without an ID");
        await store.set('TransferEvent', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove TransferEvent entity without an ID");
        await store.remove('TransferEvent', id.toString());
    }

    static async get(id:string): Promise<TransferEvent | undefined>{
        assert((id !== null && id !== undefined), "Cannot get TransferEvent entity without an ID");
        const record = await store.get('TransferEvent', id.toString());
        if (record){
            return this.create(record as TransferEventProps);
        }else{
            return;
        }
    }


    static async getByContractId(contractId: string): Promise<TransferEvent[] | undefined>{
      
      const records = await store.getByField('TransferEvent', 'contractId', contractId);
      return records.map(record => this.create(record as TransferEventProps));
      
    }

    static async getByFromId(fromId: string): Promise<TransferEvent[] | undefined>{
      
      const records = await store.getByField('TransferEvent', 'fromId', fromId);
      return records.map(record => this.create(record as TransferEventProps));
      
    }

    static async getByToId(toId: string): Promise<TransferEvent[] | undefined>{
      
      const records = await store.getByField('TransferEvent', 'toId', toId);
      return records.map(record => this.create(record as TransferEventProps));
      
    }


    static create(record: TransferEventProps): TransferEvent {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new this(
        
            record.id,
        
            record.hash,
        
            record.logIndex,
        
            record.amount,
        
            record.fromId,
        
            record.toId,
        
            record.blockNumber,
        
            record.timestamp,
        );
        Object.assign(entity,record);
        return entity;
    }
}
