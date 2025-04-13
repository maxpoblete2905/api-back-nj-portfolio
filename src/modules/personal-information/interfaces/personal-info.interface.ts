import { Timestamp } from 'firebase-admin/firestore';

export interface PersonalInformation {
    id?: string;
    description: string;
    descriptionPosition: string;
    name: string;
    university_title: string;
    update: Timestamp | Date;
    createdAt?: Timestamp | Date;
    updatedAt?: Timestamp | Date;
}