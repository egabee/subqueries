// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';




export type TokenProps = Omit<Token, NonNullable<FunctionPropertyNames<Token>>| '_name'>;

export class Token implements Entity {

    constructor(
        
            id: string,
        
            issuer: string,
        
            symbol: string,
        
            subunit: string,
        
            precision: number,
        
            initialAmount: string,
        
            description: string,
        
            features: string,
        
            burnRate: string,
        
            sendCommissionRate: string,
        
            chainId: string,
        
            timestamp: bigint,
        
    ) {
        
            this.id = id;
        
            this.issuer = issuer;
        
            this.symbol = symbol;
        
            this.subunit = subunit;
        
            this.precision = precision;
        
            this.initialAmount = initialAmount;
        
            this.description = description;
        
            this.features = features;
        
            this.burnRate = burnRate;
        
            this.sendCommissionRate = sendCommissionRate;
        
            this.chainId = chainId;
        
            this.timestamp = timestamp;
        
    }


    public id: string;

    public issuer: string;

    public symbol: string;

    public subunit: string;

    public precision: number;

    public initialAmount: string;

    public description: string;

    public features: string;

    public burnRate: string;

    public sendCommissionRate: string;

    public chainId: string;

    public timestamp: bigint;


    get _name(): string {
        return 'Token';
    }

    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save Token entity without an ID");
        await store.set('Token', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove Token entity without an ID");
        await store.remove('Token', id.toString());
    }

    static async get(id:string): Promise<Token | undefined>{
        assert((id !== null && id !== undefined), "Cannot get Token entity without an ID");
        const record = await store.get('Token', id.toString());
        if (record){
            return this.create(record as TokenProps);
        }else{
            return;
        }
    }



    static create(record: TokenProps): Token {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new this(
        
            record.id,
        
            record.issuer,
        
            record.symbol,
        
            record.subunit,
        
            record.precision,
        
            record.initialAmount,
        
            record.description,
        
            record.features,
        
            record.burnRate,
        
            record.sendCommissionRate,
        
            record.chainId,
        
            record.timestamp,
        );
        Object.assign(entity,record);
        return entity;
    }
}
