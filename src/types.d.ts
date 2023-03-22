export interface IBrand {
    name: string;
    slug: string;
    image:{
        round: string;
        original: string;
        local_round: string;
    }
}
export enum EDefaultTypes {
    CAR = 'car',
    MOTORBIKE = 'motorbike',
    TRACTOR = 'tractor',
    TRAILER = 'trailer',
    TRUCK = 'truck'
}