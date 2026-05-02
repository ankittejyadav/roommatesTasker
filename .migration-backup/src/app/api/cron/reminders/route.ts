import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebaseAdmin';
import { HouseData } from '@/lib/types';
import { getUrgency, getCurrentAssigneeUid } from '@/lib/schedule';

// Vercel Cron Job Endpoint (called automatically by Vercel every day)

export async function GET(req: Request) {
    try {
        // Simple security: in production, verify Vercel authorization header
        // For testing/setup, we'll allow standard requests or check a CRON_SECRET if set
        const authHeader = req.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const admin = getFirebaseAdmin();
        if (!admin.apps.length) return NextResponse.json({ success: false, error: 'Admin not initialized' }, { status: 500 });
        const db = admin.firestore();
        const messaging = admin.messaging();

        let notificationsSent = 0;
        const housesSnapshot = await db.collection('houses').get();

        for (const houseDoc of housesSnapshot.docs) {
            const houseData = houseDoc.data() as HouseData;

            // Loop over all tasks
            for (const task of houseData.tasks || []) {
                if (!task.frequencyDays || task.rotation.length === 0) continue; // Skip manual tasks (like Trash)

                // Check if the scheduled task (like Bathroom) is Due Today or Overdue
                const urgency = getUrgency(task);
                if (urgency === 'due-today' || urgency === 'overdue') {
                    // Find who is assigned
                    const assigneeUid = getCurrentAssigneeUid(task);
                    if (!assigneeUid) continue;

                    const assignedMember = houseData.members.find(m => m.uid === assigneeUid);
                    if (!assignedMember || !assignedMember.fcmTokens || assignedMember.fcmTokens.length === 0) continue;

                    // It's their turn, and it's due today or overdue. Send standard push.
                    const title = `🧹 Reminder: ${task.name}`;
                    let body = `It's your turn to do the ${task.name} today.`;
                    if (urgency === 'overdue') body = `Friendly reminder: The ${task.name} is overdue and it's your turn.`;

                    // Send to all their devices
                    await messaging.sendEachForMulticast({
                        tokens: assignedMember.fcmTokens,
                        notification: { title, body },
                        data: { url: '/' },
                    });
                    notificationsSent++;
                }

                // Reset manualReminderSent to false for ALL tasks (manual like Trash and scheduled ones)
                // so the '🔔 Remind' button is available again the next day
                if (task.manualReminderSent) {
                    await db.collection('houses').doc(houseDoc.id).update({
                        tasks: houseData.tasks.map(t =>
                            t.id === task.id ? { ...t, manualReminderSent: false } : t
                        )
                    });
                }
            }
        }

        return NextResponse.json({ success: true, notificationsSent });

    } catch (err: any) {
        console.error('Cron Job Error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
