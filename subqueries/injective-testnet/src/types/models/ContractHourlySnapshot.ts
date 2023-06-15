// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';




export type ContractHourlySnapshotProps = Omit<ContractHourlySnapshot, NonNullable<FunctionPropertyNames<ContractHourlySnapshot>>| '_name'>;

export class ContractHourlySnapshot implements Entity {

    constructor(
        
            id: string,
        
            contractId: string,
        
            hourlyTransactionCount: number,
        
            hourlyFailedTransactionCount: number,
        
            hourlyGasConsumption: bigint,
        
            blockNumber: bigint,
        
            timestamp: bigint,
        
    ) {
        
            this.id = id;
        
            this.contractId = contractId;
        
            this.hourlyTransactionCount = hourlyTransactionCount;
        
            this.hourlyFailedTransactionCount = hourlyFailedTransactionCount;
        
            this.hourlyGasConsumption = hourlyGasConsumption;
        
            this.blockNumber = blockNumber;
        
            this.timestamp = timestamp;
        
    }


    public id: string;

    public contractId: string;

    public hourlyTransactionCount: number;

    public hourlyFailedTransactionCount: number;

    public hourlyGasConsumption: bigint;

    public blockNumber: bigint;

    public timestamp: bigint;


    get _name(): string {
        return 'ContractHourlySnapshot';
    }

    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save ContractHourlySnapshot entity without an ID");
        await store.set('ContractHourlySnapshot', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove ContractHourlySnapshot entity without an ID");
        await store.remove('ContractHourlySnapshot', id.toString());
    }

    static async get(id:string): Promise<ContractHourlySnapshot | undefined>{
        assert((id !== null && id !== undefined), "Cannot get ContractHourlySnapshot entity without an ID");
        const record = await store.get('ContractHourlySnapshot', id.toString());
        if (record){
            return this.create(record as ContractHourlySnapshotProps);
        }else{
            return;
        }
    }


    static async getByContractId(contractId: string): Promise<ContractHourlySnapshot[] | undefined>{
      
      const records = await store.getByField('ContractHourlySnapshot', 'contractId', contractId);
      return records.map(record => this.create(record as ContractHourlySnapshotProps));
      
    }


    static create(record: ContractHourlySnapshotProps): ContractHourlySnapshot {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new this(
        
            record.id,
        
            record.contractId,
        
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
