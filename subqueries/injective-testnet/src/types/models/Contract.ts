// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';




export type ContractProps = Omit<Contract, NonNullable<FunctionPropertyNames<Contract>>| '_name'>;

export class Contract implements Entity {

    constructor(
        
            id: string,
        
        
            chainId: string,
        
    ) {
        
            this.id = id;
        
            this.chainId = chainId;
        
    }


    public id: string;

    public name?: string;

    public chainId: string;


    get _name(): string {
        return 'Contract';
    }

    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save Contract entity without an ID");
        await store.set('Contract', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove Contract entity without an ID");
        await store.remove('Contract', id.toString());
    }

    static async get(id:string): Promise<Contract | undefined>{
        assert((id !== null && id !== undefined), "Cannot get Contract entity without an ID");
        const record = await store.get('Contract', id.toString());
        if (record){
            return this.create(record as ContractProps);
        }else{
            return;
        }
    }



    static create(record: ContractProps): Contract {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new this(
        
            record.id,
        
            record.chainId,
        );
        Object.assign(entity,record);
        return entity;
    }
}
