import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FirebaseConfig {
    private readonly firestore: admin.firestore.Firestore;

    constructor() {
        if (!admin.apps.length) {
            // Obtener la ruta del archivo desde las variables de entorno
            const serviceAccountPath = path.resolve(
                process.env.FIREBASE_SERVICE_ACCOUNT_PATH as string
            );


            // Verificar que el archivo exista
            if (!fs.existsSync(serviceAccountPath)) {
                throw new Error(`Firebase service account file not found at: ${serviceAccountPath}`);
            }

            // Leer y parsear el archivo
            const serviceAccount = JSON.parse(
                fs.readFileSync(serviceAccountPath, 'utf8')
            );

            // Inicializar Firebase
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
                storageBucket: `${serviceAccount.project_id}.appspot.com`
            });
        }

        this.firestore = admin.firestore();
        this.firestore.settings({ ignoreUndefinedProperties: true });
    }

    getFirestore(): admin.firestore.Firestore {
        return this.firestore;
    }
}