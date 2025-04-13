// src/contacts/interfaces/contact.interface.ts
import { Timestamp } from 'firebase-admin/firestore';

export interface Contact {
    id?: string;
    name: string;
    email: string;
    message: string;
    createdAt?: Timestamp | Date;
    updatedAt?: Timestamp | Date;
    status?: 'pending' | 'read' | 'replied' | 'archived';
    ipAddress?: string;
    userAgent?: string;
}