import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class FirebaseConfig {
    private readonly firestore: admin.firestore.Firestore;
    private readonly logger = new Logger(FirebaseConfig.name);

    constructor() {
        console.log('🔥 FIREBASE_CONFIG_PATH =', process.env.FIREBASE_CONFIG_PATH);

        try {
            if (!admin.apps.length) {
                this.logger.log('Initializing Firebase...');

                const serviceAccountPath = path.resolve(
                    process.env.FIREBASE_CONFIG_PATH as string
                );

                if (!fs.existsSync(serviceAccountPath)) {
                    this.logger.error(`Service account file not found at: ${serviceAccountPath}`);
                    throw new Error('Firebase service account file not found');
                }

                const serviceAccount = JSON.parse(
                    fs.readFileSync(serviceAccountPath, 'utf8')
                );

                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
                    storageBucket: `${serviceAccount.project_id}.appspot.com`
                });

                this.logger.log('Firebase initialized successfully');
            }

            this.firestore = admin.firestore();
            this.firestore.settings({ ignoreUndefinedProperties: true });

            // Verificación básica de conexión
            this.firestore.listCollections()
                .then(() => this.logger.log('Firestore connection successful'))
                .catch(err => this.logger.error('Firestore connection error', err));

        } catch (error) {
            this.logger.error('Firebase initialization failed', error);
            throw error;
        }
    }

    getFirestore(): admin.firestore.Firestore {
        return this.firestore;
    }
}