// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';




export type ChainHourlySnapshotProps = Omit<ChainHourlySnapshot, NonNullable<FunctionPropertyNames<ChainHourlySnapshot>>| '_name'>;

export class ChainHourlySnapshot implements Entity {

    constructor(
        
            id: string,
        
            hourlyTransactionCount: number,
        
            hourlyFailedTransactionCount: number,
        
            hourlyGasConsumption: bigint,
        
            blockNumber: bigint,
        
            timestamp: bigint,
        
    ) {
        
            this.id = id;
        
            this.hourlyTransactionCount = hourlyTransactionCount;
        
            this.hourlyFailedTransactionCount = hourlyFailedTransactionCount;
        
            this.hourlyGasConsumption = hourlyGasConsumption;
        
            this.blockNumber = blockNumber;
        
            this.timestamp = timestamp;
        
    }


    public id: string;

    public hourlyTransactionCount: number;

    public hourlyFailedTransactionCount: number;

    public hourlyGasConsumption: bigint;

    public blockNumber: bigint;

    public timestamp: bigint;


    get _name(): string {
        return 'ChainHourlySnapshot';
    }

    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save ChainHourlySnapshot entity without an ID");
        await store.set('ChainHourlySnapshot', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove ChainHourlySnapshot entity without an ID");
        await store.remove('ChainHourlySnapshot', id.toString());
    }

    static async get(id:string): Promise<ChainHourlySnapshot | undefined>{
        assert((id !== null && id !== undefined), "Cannot get ChainHourlySnapshot entity without an ID");
        const record = await store.get('ChainHourlySnapshot', id.toString());
        if (record){
            return this.create(record as ChainHourlySnapshotProps);
        }else{
            return;
        }
    }



    static create(record: ChainHourlySnapshotProps): ChainHourlySnapshot {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new this(
        
            record.id,
        
            record.hourlyTransactionCount,
        
            record.hourlyFailedTransactionCount,
        
            record.hourlyGasConsumption,
        
            record.blockNumber,
        
            record.timestamp,
        );
        Object.assign(entity,record);
        return entity;
    }
}
