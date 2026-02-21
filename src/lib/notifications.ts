export function isNotificationSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
}

export async function requestNotificationPermission(): Promise<boolean> {
    if (!isNotificationSupported()) return false;
    const result = await Notification.requestPermission();
    return result === 'granted';
}

export function sendBrowserNotification(title: string, body: string): void {
    if (!isNotificationSupported()) return;
    if (Notification.permission !== 'granted') return;
    new Notification(title, { body, icon: '/icon-192.png' });
}

export function notifyIfAssigned(
    currentUserUid: string,
    assignedUid: string,
    taskName: string,
    assigneeName: string
): void {
    if (currentUserUid !== assignedUid) return;
    sendBrowserNotification(
        `🎯 Your turn: ${taskName}`,
        `Hey ${assigneeName}, it's your turn! Open the app to mark it done.`
    );
}
