import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebaseAdmin';
import { Message } from 'firebase-admin/messaging';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { targetTokens, title, message, data } = body;

        if (!targetTokens || !Array.isArray(targetTokens) || targetTokens.length === 0) {
            return NextResponse.json({ success: true, message: 'No target tokens provided' });
        }

        const admin = getFirebaseAdmin();
        if (!admin.apps.length) {
            return NextResponse.json({ success: false, error: 'Firebase Admin not initialized' }, { status: 500 });
        }

        const messaging = admin.messaging();

        // Send multicast (send to all devices for this user)
        const response = await messaging.sendEachForMulticast({
            tokens: targetTokens,
            notification: {
                title,
                body: message,
            },
            data: data || { url: '/' },
        });

        // Clean up invalid tokens if needed
        const failedTokens: string[] = [];
        response.responses.forEach((res, idx) => {
            if (!res.success) {
                failedTokens.push(targetTokens[idx]);
                console.warn(`Failed to send to token ${targetTokens[idx]}:`, res.error);
            }
        });

        return NextResponse.json({
            success: true,
            successCount: response.successCount,
            failedTokens,
        });

    } catch (err: any) {
        console.error('Trigger Push Notification Error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
