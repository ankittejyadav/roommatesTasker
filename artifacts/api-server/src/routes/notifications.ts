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

router.post("/notifications/trigger", async (req, res) => {
  const { targetTokens, title, message } = req.body as {
    targetTokens: string[];
    title: string;
    message: string;
  };

  if (!targetTokens?.length || !title || !message) {
    res.status(400).json({ error: "Missing targetTokens, title, or message" });
    return;
  }

  try {
    const adminSdk = getAdmin();
    if (!adminSdk.apps.length) {
      res.status(503).json({ error: "Firebase Admin not initialized" });
      return;
    }

    const results = await Promise.allSettled(
      targetTokens.map((token) =>
        adminSdk.messaging().send({
          token,
          notification: { title, body: message },
          android: { priority: "high" },
          apns: { payload: { aps: { sound: "default" } } },
        })
      )
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;
    logger.info({ sent, failed }, "Notifications sent");
    res.json({ sent, failed });
  } catch (err) {
    logger.error({ err }, "Error sending notifications");
    res.status(500).json({ error: "Failed to send notifications" });
  }
});

router.get("/cron/reminders", async (req, res) => {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers["authorization"];
    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
  }

  try {
    const adminSdk = getAdmin();
    if (!adminSdk.apps.length) {
      res.status(503).json({ error: "Firebase Admin not initialized" });
      return;
    }

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
