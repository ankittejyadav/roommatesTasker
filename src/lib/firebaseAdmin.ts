import * as admin from 'firebase-admin';

// Initialize Firebase Admin lazily to prevent duplicate initialization errors
export function getFirebaseAdmin() {
    if (!admin.apps.length) {
        // In Vercel, this will be set. Locally, it might be set via .env.local
        const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

        if (serviceAccountKey && projectId) {
            try {
                // Parse the service account JSON
                const serviceAccount = JSON.parse(serviceAccountKey);
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                    projectId: projectId,
                });
                console.log('Firebase Admin initialized successfully');
            } catch (error) {
                console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON:', error);
            }
        } else {
            console.warn('Firebase Admin skipped: missing FIREBASE_SERVICE_ACCOUNT_KEY or NEXT_PUBLIC_FIREBASE_PROJECT_ID');
        }
    }
    return admin;
}
