import { Router } from "express";
import * as admin from "firebase-admin";
import { logger } from "../lib/logger";

const router = Router();

function getAdmin() {
  if (!admin.apps.length) {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;

    if (serviceAccountKey && projectId) {
      try {
        const serviceAccount = JSON.parse(serviceAccountKey);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId,
        });
        logger.info("Firebase Admin initialized");
      } catch (err) {
        logger.error({ err }, "Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY");
      }
    } else {
      logger.warn("Firebase Admin skipped: missing env vars");
    }
  }
  return admin;
}

async function verifyFirebaseToken(authHeader: string | undefined): Promise<admin.auth.DecodedIdToken | null> {
  const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return null;
  const adminSdk = getAdmin();
  if (!adminSdk.apps.length) return null;
  try {
    return await adminSdk.auth().verifyIdToken(idToken);
  } catch {
    return null;
  }
}

/**
 * POST /api/notifications/trigger
 * Body: { houseId: string, taskId: string }
 * Auth: Firebase ID token (Bearer)
 *
 * Derives FCM tokens server-side from Firestore. The caller only supplies
 * house + task context; the server validates membership and resolves tokens.
 */
router.post("/notifications/trigger", async (req, res) => {
  const decoded = await verifyFirebaseToken(req.headers["authorization"]);
  if (!decoded) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { houseId, taskId } = req.body as { houseId?: string; taskId?: string };
  if (!houseId || !taskId) {
    res.status(400).json({ error: "Missing houseId or taskId" });
    return;
  }

  const adminSdk = getAdmin();
  if (!adminSdk.apps.length) {
    res.status(503).json({ error: "Firebase Admin not initialized" });
    return;
  }

  try {
    const db = adminSdk.firestore();
    const houseDoc = await db.collection("houses").doc(houseId).get();
    if (!houseDoc.exists) {
      res.status(404).json({ error: "House not found" });
      return;
    }

    const house = houseDoc.data()!;
    const members: Array<{ uid: string; fcmTokens?: string[] }> = house.members || [];

    // Verify caller is a member of the house
    const callerUid = decoded.uid;
    const isMember = members.some((m) => m.uid === callerUid);
    if (!isMember) {
      res.status(403).json({ error: "Forbidden: not a member of this house" });
      return;
    }

    const tasks: Array<{ id: string; name: string; rotation: string[]; currentIndex: number }> = house.tasks || [];
    const task = tasks.find((t) => t.id === taskId);
    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    // Derive current assignee from server-side rotation
    const rotation = task.rotation || [];
    if (rotation.length === 0) {
      res.status(422).json({ error: "Task has no rotation members" });
      return;
    }
    const assigneeUid = rotation[task.currentIndex % rotation.length];
    const assignee = members.find((m) => m.uid === assigneeUid);
    const targetTokens = assignee?.fcmTokens ?? [];

    if (targetTokens.length === 0) {
      res.json({ sent: 0, failed: 0, reason: "Assignee has no FCM tokens" });
      return;
    }

    const title = `🔔 Reminder: ${task.name}`;
    const body = `It's your turn to do the ${task.name}. Open the app to mark it done.`;

    const results = await Promise.allSettled(
      targetTokens.map((token) =>
        adminSdk.messaging().send({
          token,
          notification: { title, body },
          android: { priority: "high" },
          apns: { payload: { aps: { sound: "default" } } },
        })
      )
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;
    logger.info({ sent, failed, houseId, taskId }, "Notifications sent");
    res.json({ sent, failed });
  } catch (err) {
    logger.error({ err }, "Error sending notifications");
    res.status(500).json({ error: "Failed to send notifications" });
  }
});

/**
 * GET /api/cron/reminders
 * Auth: Bearer CRON_SECRET (fails closed in production if secret not set)
 */
router.get("/cron/reminders", async (req, res) => {
  const cronSecret = process.env.CRON_SECRET;
  if (process.env.NODE_ENV === "production" && !cronSecret) {
    res.status(503).json({ error: "CRON_SECRET is not configured" });
    return;
  }
  if (cronSecret) {
    const authHeader = req.headers["authorization"];
    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
  }

  const adminSdk = getAdmin();
  if (!adminSdk.apps.length) {
    res.status(503).json({ error: "Firebase Admin not initialized" });
    return;
  }

  try {
    const db = adminSdk.firestore();
    const snapshot = await db.collection("houses").get();
    let sent = 0;

    const now = new Date();

    for (const docSnap of snapshot.docs) {
      const house = docSnap.data();
      const tasks = house.tasks || [];

      for (const task of tasks) {
        if (!task.frequencyDays || !task.lastCompletedDate) continue;
        const last = new Date(task.lastCompletedDate);
        const daysSince = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSince < task.frequencyDays) continue;

        const rotation = task.rotation || [];
        const assigneeUid = rotation[task.currentIndex % rotation.length];
        const members = house.members || [];
        const assignee = members.find((m: { uid: string; fcmTokens?: string[] }) => m.uid === assigneeUid);
        if (!assignee?.fcmTokens?.length) continue;

        await Promise.allSettled(
          assignee.fcmTokens.map((token: string) =>
            adminSdk.messaging().send({
              token,
              notification: {
                title: `🔔 ${task.name} is due`,
                body: `It's your turn! Open the app to mark it done.`,
              },
            })
          )
        );
        sent++;
      }
    }

    res.json({ ok: true, remindersSent: sent });
  } catch (err) {
    logger.error({ err }, "Cron reminders error");
    res.status(500).json({ error: "Cron failed" });
  }
});

export default router;
