import { Timestamp } from 'firebase-admin/firestore';

export interface Technology {
    id?: string;
    name: string;
    url: string;
    createdAt?: Timestamp | Date;
    updatedAt?: Timestamp | Date;
}