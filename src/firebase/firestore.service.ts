import { Injectable } from '@nestjs/common';
import {
    CollectionReference,
    DocumentData,
    DocumentReference,
    DocumentSnapshot,
    QuerySnapshot,
    WriteResult,
    Query,
    FieldValue,
    Firestore,
} from 'firebase-admin/firestore';
import { FirebaseConfig } from 'src/firebase.config';
import { StandardResponse } from 'src/interface/standard-response.interface';

@Injectable()
export class FirestoreService {
    private readonly firestore: Firestore;

    constructor(private readonly firebaseConfig: FirebaseConfig) {
        this.firestore = firebaseConfig.getFirestore();
    }

    // Obtener referencia a una colección con tipado genérico
    getCollectionRef<T = DocumentData>(collectionPath: string): CollectionReference<T> {
        return this.firestore.collection(collectionPath) as CollectionReference<T>;
    }

    // Obtener referencia a un documento con tipado genérico
    getDocRef<T = DocumentData>(collectionPath: string, docId: string): DocumentReference<T> {
        return this.getCollectionRef<T>(collectionPath).doc(docId);
    }

    // Crear documento con opción de ID específico
    async createDoc<T = DocumentData>(
        collectionPath: string,
        data: T,
        docId?: string,
    ): Promise<StandardResponse<DocumentReference<T>>> {
        try {
            const collectionRef = this.getCollectionRef<T>(collectionPath);
            const docRef = docId ? collectionRef.doc(docId) : collectionRef.doc();

            await docRef.set({
                ...data,
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
            });

            return {
                success: true,
                message: 'Document created successfully',
                data: docRef,
                statusCode: 201
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to create document',
                error: error.message,
                statusCode: 500
            };
        }
    }

    // Obtener documento por ID
    async getDoc<T = DocumentData>(
        collectionPath: string,
        docId: string,
    ): Promise<StandardResponse<DocumentSnapshot<T>>> {
        try {
            const docSnapshot = await this.getDocRef<T>(collectionPath, docId).get();

            if (!docSnapshot.exists) {
                return {
                    success: false,
                    message: 'Document not found',
                    statusCode: 404
                };
            }

            return {
                success: true,
                message: 'Document retrieved successfully',
                data: docSnapshot,
                statusCode: 200
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to get document',
                error: error.message,
                statusCode: 500
            };
        }
    }

    // Obtener todos los documentos de una colección
    async getDocs<T = DocumentData>(
        collectionPath: string,
    ): Promise<StandardResponse<QuerySnapshot<T>>> {
        try {
            const querySnapshot = await this.getCollectionRef<T>(collectionPath).get();

            return {
                success: true,
                message: querySnapshot.empty
                    ? 'No documents found'
                    : 'Documents retrieved successfully',
                data: querySnapshot,
                statusCode: querySnapshot.empty ? 204 : 200
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to get documents',
                error: error.message,
                statusCode: 500
            };
        }
    }

    // Actualizar documento
    async updateDoc<T = DocumentData>(
        collectionPath: string,
        docId: string,
        data: Partial<T>,
    ): Promise<StandardResponse<WriteResult>> {
        try {
            const docRef = this.getDocRef<T>(collectionPath, docId);
            const docSnapshot = await docRef.get();

            if (!docSnapshot.exists) {
                return {
                    success: false,
                    message: 'Document not found',
                    statusCode: 404
                };
            }

            const result = await docRef.update({
                ...data,
                updatedAt: FieldValue.serverTimestamp(),
            });

            return {
                success: true,
                message: 'Document updated successfully',
                data: result,
                statusCode: 200
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to update document',
                error: error.message,
                statusCode: 500
            };
        }
    }

    // Eliminar documento
    async deleteDoc(
        collectionPath: string,
        docId: string,
    ): Promise<StandardResponse<WriteResult>> {
        try {
            const docRef = this.getDocRef(collectionPath, docId);
            const docSnapshot = await docRef.get();

            if (!docSnapshot.exists) {
                return {
                    success: false,
                    message: 'Document not found',
                    statusCode: 404
                };
            }

            const result = await docRef.delete();

            // Verificación opcional de que el documento fue eliminado
            const deletedDoc = await docRef.get();
            if (deletedDoc.exists) {
                return {
                    success: false,
                    message: 'Document deletion verification failed',
                    statusCode: 500
                };
            }

            return {
                success: true,
                message: 'Document deleted successfully',
                data: result,
                statusCode: 200
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to delete document',
                error: error.message,
                statusCode: 500
            };
        }
    }

    // Consultar documentos con condiciones
    async queryDocs<T = DocumentData>(
        collectionPath: string,
        field: string,
        operator: FirebaseFirestore.WhereFilterOp,
        value: any,
    ): Promise<StandardResponse<QuerySnapshot<T>>> {
        try {
            const querySnapshot = await this.getCollectionRef<T>(collectionPath)
                .where(field, operator, value)
                .get();

            return {
                success: true,
                message: querySnapshot.empty
                    ? 'No matching documents found'
                    : 'Matching documents retrieved successfully',
                data: querySnapshot,
                statusCode: querySnapshot.empty ? 204 : 200
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to query documents',
                error: error.message,
                statusCode: 500
            };
        }
    }

    // Crear consulta personalizada
    createQuery<T = DocumentData>(
        collectionPath: string,
    ): Query<T> {
        return this.getCollectionRef<T>(collectionPath);
    }

    // Operación batch
    async runBatch(
        operations: Array<{
            type: 'create' | 'update' | 'delete';
            collectionPath: string;
            docId?: string;
            data?: any;
        }>,
    ): Promise<StandardResponse<void>> {
        try {
            const batch = this.firestore.batch();

            operations.forEach(op => {
                const docRef = op.docId
                    ? this.getCollectionRef(op.collectionPath).doc(op.docId)
                    : this.getCollectionRef(op.collectionPath).doc();

                switch (op.type) {
                    case 'create':
                        batch.set(docRef, {
                            ...op.data,
                            createdAt: FieldValue.serverTimestamp(),
                            updatedAt: FieldValue.serverTimestamp(),
                        });
                        break;
                    case 'update':
                        batch.update(docRef, {
                            ...op.data,
                            updatedAt: FieldValue.serverTimestamp(),
                        });
                        break;
                    case 'delete':
                        batch.delete(docRef);
                        break;
                }
            });

            await batch.commit();

            return {
                success: true,
                message: 'Batch operation completed successfully',
                statusCode: 200
            };
        } catch (error) {
            return {
                success: false,
                message: 'Batch operation failed',
                error: error.message,
                statusCode: 500
            };
        }
    }
}