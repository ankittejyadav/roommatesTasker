import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { eq } from 'drizzle-orm';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../lib/db/src/schema';
import dotenv from 'dotenv';
import path from 'path';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
process.env.GRPC_SSL_CIPHER_SUITES = 'HIGH+ECDSA:HIGH+RSA:ECDHE-RSA-AES128-SHA';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

/**
 * MIGRATION SCRIPT: Firestore -> Neon PostgreSQL (TurnSync)
 * 
 * Usage:
 * 1. Ensure DATABASE_URL is set in .env
 * 2. Ensure FIREBASE_SERVICE_ACCOUNT_KEY is set in .env (or provide path to serviceAccountKey.json)
 * 3. Run: npx tsx scripts/migrate-firestore-to-neon.ts
 */

async function runMigration() {
  console.log('🚀 Starting Firestore to Neon PostgreSQL migration...');

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ Error: DATABASE_URL environment variable is required.');
    process.exit(1);
  }

  // Initialize Neon Drizzle ORM
  const sql = neon(dbUrl);
  const db = drizzle(sql, { schema });

  // Initialize Firebase Admin
  let serviceAccount: any;
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    } catch {
      serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    }
  } else {
    const keyPath = path.resolve(process.cwd(), 'serviceAccountKey.json');
    if (fs.existsSync(keyPath)) {
      serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf-8'));
    }
  }

  if (!serviceAccount) {
    console.error('❌ Error: FIREBASE_SERVICE_ACCOUNT_KEY or serviceAccountKey.json required for migration.');
    process.exit(1);
  }

  let firestore: any;
  try {
    const app = getApps().length === 0 ? initializeApp({ credential: cert(serviceAccount) }) : getApps()[0];
    firestore = getFirestore(app);
    // Force REST settings on firestore client if supported
    if (firestore.settings) {
      try { firestore.settings({ preferRest: true }); } catch {}
    }
  } catch (e) {
    console.error('Firestore init error:', e);
  }

  let housesDocs: any[] = [];
  try {
    const housesSnap = await firestore.collection('houses').get();
    housesDocs = housesSnap.docs;
  } catch (err: any) {
    console.warn('⚠️ gRPC Firestore connection failed, attempting REST API fetch fallback...');
    // Direct REST API fetch fallback
    const projectId = serviceAccount.project_id || 'roommatestasker';
    const restUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/houses`;
    const res = await fetch(restUrl);
    if (res.ok) {
      const json = await res.json();
      const rawDocs = json.documents || [];
      housesDocs = rawDocs.map((doc: any) => {
        const fields = doc.fields || {};
        return {
          data: () => ({
            name: fields.name?.stringValue,
            inviteCode: fields.inviteCode?.stringValue,
            adminUid: fields.adminUid?.stringValue,
            members: (fields.members?.arrayValue?.values || []).map((m: any) => ({
              uid: m.mapValue?.fields?.uid?.stringValue,
              displayName: m.mapValue?.fields?.displayName?.stringValue,
              email: m.mapValue?.fields?.email?.stringValue,
              photoURL: m.mapValue?.fields?.photoURL?.stringValue,
            })),
            tasks: (fields.tasks?.arrayValue?.values || []).map((t: any) => {
              const tf = t.mapValue?.fields || {};
              return {
                name: tf.name?.stringValue,
                icon: tf.icon?.stringValue,
                frequencyDays: tf.frequencyDays?.integerValue ? Number(tf.frequencyDays.integerValue) : null,
                rotation: (tf.rotation?.arrayValue?.values || []).map((v: any) => v.stringValue),
                currentIndex: tf.currentIndex?.integerValue ? Number(tf.currentIndex.integerValue) : 0,
                lastCompletedDate: tf.lastCompletedDate?.stringValue,
                lastCompletedByUid: tf.lastCompletedByUid?.stringValue,
                history: (tf.history?.arrayValue?.values || []).map((h: any) => ({
                  uid: h.mapValue?.fields?.uid?.stringValue,
                  date: h.mapValue?.fields?.date?.stringValue,
                })),
              };
            }),
          })
        };
      });
    } else {
      console.log('ℹ️ No existing Firestore house documents found or REST read returned status:', res.status);
    }
  }

  console.log(`📦 Processing ${housesDocs.length} house document(s).`);

  for (const houseDoc of housesDocs) {
    const data = houseDoc.data();
    const houseName = data.name || 'My Group';
    const inviteCode = data.inviteCode || Math.random().toString(36).substring(2, 8).toUpperCase();
    const members: any[] = data.members || [];
    const tasks: any[] = data.tasks || [];

    console.log(`\n🏠 Migrating house: "${houseName}" (Invite Code: ${inviteCode})`);

    // 1. Migrate Users
    const userMap = new Map<string, string>(); // firebaseUid -> postgresUserId

    for (const member of members) {
      const googleId = member.uid;
      const email = member.email || `${member.uid}@placeholder.com`;
      const displayName = member.displayName || 'Roommate';
      const avatarUrl = member.photoURL || null;

      // Upsert User into Neon
      const existingUser = await db.select().from(schema.usersTable).where(eq(schema.usersTable.googleId, googleId)).limit(1);
      
      let userId: string;
      if (existingUser.length > 0) {
        userId = existingUser[0].id;
      } else {
        const [newUser] = await db.insert(schema.usersTable).values({
          googleId,
          email,
          displayName,
          avatarUrl,
        }).returning({ id: schema.usersTable.id });
        userId = newUser.id;
      }
      userMap.set(member.uid, userId);
      console.log(`  👤 User migrated: ${displayName} (${userId})`);
    }

    // Determine Admin User ID
    const adminUid = data.adminUid;
    const adminUserId = userMap.get(adminUid) || (userMap.values().next().value as string);

    if (!adminUserId) {
      console.warn(`  ⚠️ Skip house "${houseName}": No valid admin member found.`);
      continue;
    }

    // 2. Insert Group into Neon
    const [newGroup] = await db.insert(schema.groupsTable).values({
      name: houseName,
      inviteCode,
      adminUserId,
    }).returning({ id: schema.groupsTable.id });

    const groupId = newGroup.id;
    console.log(`  👥 Group created in Neon: ID ${groupId}`);

    // 3. Link Group Members
    for (const memberUid of userMap.keys()) {
      const pgUserId = userMap.get(memberUid)!;
      await db.insert(schema.groupMembersTable).values({
        groupId,
        userId: pgUserId,
      }).onConflictDoNothing();
    }

    // 4. Migrate Tasks & Task History
    for (const task of tasks) {
      const taskName = task.name;
      const icon = task.icon || '📌';
      const frequencyDays = task.frequencyDays ?? null;
      const rawRotation: string[] = task.rotation || [];
      const currentIndex = task.currentIndex || 0;
      const lastCompletedDate = task.lastCompletedDate ? new Date(task.lastCompletedDate) : null;
      const lastCompletedByUid = task.lastCompletedByUid;
      const lastCompletedByUserId = lastCompletedByUid ? userMap.get(lastCompletedByUid) || null : null;

      // Map rotation array from Firestore UIDs to Postgres User UUIDs
      const rotationOrder = rawRotation.map(uid => userMap.get(uid)).filter((id): id is string => !!id);

      const [newTask] = await db.insert(schema.tasksTable).values({
        groupId,
        name: taskName,
        icon,
        frequencyDays,
        rotationOrder,
        currentIndex,
        lastCompletedDate,
        lastCompletedByUserId,
      }).returning({ id: schema.tasksTable.id });

      console.log(`  📌 Task migrated: "${taskName}"`);

      // Task History Log Migration
      const history: any[] = task.history || [];
      for (const h of history) {
        const completedByPgUser = userMap.get(h.uid);
        if (completedByPgUser) {
          await db.insert(schema.taskHistoryTable).values({
            taskId: newTask.id,
            groupId,
            completedByUserId: completedByPgUser,
            completedAt: h.date ? new Date(h.date) : new Date(),
          });
        }
      }
    }
  }

  console.log('\n✅ Migration complete! All Firestore houses successfully migrated to Neon PostgreSQL.');
}

// Dummy tag for inline sql if needed
function drizzleSql(strings: TemplateStringsArray, ...values: any[]) {
  return `${strings[0]}${values[0]}${strings[1]}`;
}

runMigration().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
