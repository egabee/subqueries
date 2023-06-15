// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';




export type TokenTransferProps = Omit<TokenTransfer, NonNullable<FunctionPropertyNames<TokenTransfer>>| '_name'>;

export class TokenTransfer implements Entity {

    constructor(
        
            id: string,
        
            blockHeight: number,
        
            timestamp: bigint,
        
            txHash: string,
        
            from: string,
        
            to: string,
        
            amount: string,
        
            chainId: string,
        
            tokenId: string,
        
            gasUsed: bigint,
        
            status: string,
        
    ) {
        
            this.id = id;
        
            this.blockHeight = blockHeight;
        
            this.timestamp = timestamp;
        
            this.txHash = txHash;
        
            this.from = from;
        
            this.to = to;
        
            this.amount = amount;
        
            this.chainId = chainId;
        
            this.tokenId = tokenId;
        
            this.gasUsed = gasUsed;
        
            this.status = status;
        
    }


    public id: string;

    public blockHeight: number;

    public timestamp: bigint;

    public txHash: string;

    public from: string;

    public to: string;

    public amount: string;

    public chainId: string;

    public tokenId: string;

    public gasUsed: bigint;

    public status: string;


    get _name(): string {
        return 'TokenTransfer';
    }

    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save TokenTransfer entity without an ID");
        await store.set('TokenTransfer', id.toString(), this);
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove TokenTransfer entity without an ID");
        await store.remove('TokenTransfer', id.toString());
    }

    static async get(id:string): Promise<TokenTransfer | undefined>{
        assert((id !== null && id !== undefined), "Cannot get TokenTransfer entity without an ID");
        const record = await store.get('TokenTransfer', id.toString());
        if (record){
            return this.create(record as TokenTransferProps);
        }else{
            return;
        }
    }


    static async getByTokenId(tokenId: string): Promise<TokenTransfer[] | undefined>{
      
      const records = await store.getByField('TokenTransfer', 'tokenId', tokenId);
      return records.map(record => this.create(record as TokenTransferProps));
      
    }


    static create(record: TokenTransferProps): TokenTransfer {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new this(
        
            record.id,
        
            record.blockHeight,
        
            record.timestamp,
        
            record.txHash,
        
            record.from,
        
            record.to,
        
            record.amount,
        
            record.chainId,
        
            record.tokenId,
        
            record.gasUsed,
        
            record.status,
        );
        Object.assign(entity,record);
        return entity;
    }
}
