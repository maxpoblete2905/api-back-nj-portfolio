import { Timestamp } from 'firebase-admin/firestore';

export interface Certification {
    id?: string;
    title: string;
    institution: string;
    issueDate: Date | Timestamp;
    expirationDate?: Date | Timestamp;
    credentialId?: string;
    credentialUrl?: string;
    imageUrl: string;
    createdAt?: Timestamp | Date;
    updatedAt?: Timestamp | Date;
}