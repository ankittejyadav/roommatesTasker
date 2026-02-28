import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    onSnapshot,
    collection,
    query,
    where,
    getDocs,
    Unsubscribe,
    orderBy,
    limit,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import { HouseData, MemberProfile, Task, DEFAULT_TASKS, FeedbackItem, ShoppingItem } from './types';

const HOUSES = 'houses';

function generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ───────────────────────── House CRUD ─────────────────────────

export async function createHouse(
    adminUid: string,
    adminName: string,
    adminEmail: string,
    adminPhoto: string | null,
    houseName: string
): Promise<string> {
    const inviteCode = generateInviteCode();
    const houseId = inviteCode.toLowerCase();

    const houseData: HouseData = {
        name: houseName || 'Our Place',
        members: [{
            uid: adminUid,
            displayName: adminName,
            email: adminEmail,
            photoURL: adminPhoto,
        }],
        tasks: DEFAULT_TASKS.map((t) => ({ ...t, rotation: [adminUid] })),
        inviteCode,
        adminUid,
        createdAt: new Date().toISOString(),
        feedback: [],
        shoppingList: [],
    };

    await setDoc(doc(getFirebaseDb(), HOUSES, houseId), houseData);
    return houseId;
}

export async function joinHouse(
    inviteCode: string,
    uid: string,
    displayName: string,
    email: string,
    photoURL: string | null
): Promise<string | null> {
    const houseId = inviteCode.toLowerCase();
    const docRef = doc(getFirebaseDb(), HOUSES, houseId);
    const snapshot = await getDoc(docRef);

    const newMember: MemberProfile = { uid, displayName, email, photoURL };

    if (!snapshot.exists()) {
        const q = query(
            collection(getFirebaseDb(), HOUSES),
            where('inviteCode', '==', inviteCode.toUpperCase())
        );
        const results = await getDocs(q);
        if (results.empty) return null;

        const matchDoc = results.docs[0];
        const data = normalizeHouseData(matchDoc.data());
        if (data.members.some((m) => m.uid === uid)) return matchDoc.id;

        await updateDoc(matchDoc.ref, { members: [...data.members, newMember] });
        return matchDoc.id;
    }

    const data = normalizeHouseData(snapshot.data());
    if (data.members.some((m) => m.uid === uid)) return houseId;

    await updateDoc(docRef, { members: [...data.members, newMember] });
    return houseId;
}

// ───────────────────────── Helpers ─────────────────────────

/** Normalize house data from Firestore — ensures all arrays exist */
function normalizeHouseData(raw: Record<string, unknown>): HouseData {
    return {
        name: (raw.name as string) || 'Unnamed House',
        members: Array.isArray(raw.members) ? raw.members : [],
        tasks: Array.isArray(raw.tasks) ? raw.tasks : [],
        inviteCode: (raw.inviteCode as string) || '',
        adminUid: (raw.adminUid as string) || '',
        createdAt: (raw.createdAt as string) || new Date().toISOString(),
        feedback: Array.isArray(raw.feedback) ? raw.feedback : [],
        shoppingList: Array.isArray(raw.shoppingList) ? raw.shoppingList : [],
    };
}

// ───────────────────────── Query ─────────────────────────

export async function findHouseByUser(uid: string): Promise<{ id: string; data: HouseData } | null> {
    const q = query(collection(getFirebaseDb(), HOUSES));
    const snapshot = await getDocs(q);

    for (const docSnap of snapshot.docs) {
        const data = normalizeHouseData(docSnap.data());
        if (data.members.some((m) => m.uid === uid)) {
            return { id: docSnap.id, data };
        }
    }
    return null;
}

export async function findAllHousesByUser(uid: string): Promise<{ id: string; data: HouseData }[]> {
    const q = query(collection(getFirebaseDb(), HOUSES));
    const snapshot = await getDocs(q);
    const results: { id: string; data: HouseData }[] = [];

    for (const docSnap of snapshot.docs) {
        const data = normalizeHouseData(docSnap.data());
        if (data.members.some((m) => m.uid === uid)) {
            results.push({ id: docSnap.id, data });
        }
    }
    return results;
}

export async function getPublicHouses(): Promise<{ id: string; data: HouseData }[]> {
    const q = query(collection(getFirebaseDb(), HOUSES));
    const snapshot = await getDocs(q);
    const results: { id: string; data: HouseData }[] = [];

    for (const docSnap of snapshot.docs) {
        const data = normalizeHouseData(docSnap.data());
        if (data.members.length >= 2) {
            results.push({ id: docSnap.id, data });
        }
    }
    return results.sort((a, b) => b.data.members.length - a.data.members.length).slice(0, 10);
}

export function subscribeToHouse(
    houseId: string,
    callback: (data: HouseData | null) => void
): Unsubscribe {
    return onSnapshot(doc(getFirebaseDb(), HOUSES, houseId), (snapshot) => {
        if (snapshot.exists()) {
            callback(normalizeHouseData(snapshot.data()));
        } else {
            callback(null);
        }
    });
}

// ───────────────────────── Members ─────────────────────────

export async function removeMemberFromHouse(
    houseId: string,
    currentData: HouseData,
    uidToRemove: string
): Promise<void> {
    const updatedMembers = currentData.members.filter((m) => m.uid !== uidToRemove);
    const updatedTasks = currentData.tasks.map((task) => {
        const newRotation = task.rotation.filter((uid) => uid !== uidToRemove);
        return {
            ...task,
            rotation: newRotation,
            currentIndex: newRotation.length > 0 ? task.currentIndex % newRotation.length : 0,
            temporarySwap: task.temporarySwap?.originalUid === uidToRemove || task.temporarySwap?.swappedUid === uidToRemove
                ? null
                : task.temporarySwap,
        };
    });

    await updateDoc(doc(getFirebaseDb(), HOUSES, houseId), {
        members: updatedMembers,
        tasks: updatedTasks,
    });
}

export async function updateMemberProfile(
    houseId: string,
    currentData: HouseData,
    uid: string,
    updates: Partial<MemberProfile>
): Promise<void> {
    const updatedMembers = currentData.members.map((m) =>
        m.uid !== uid ? m : { ...m, ...updates }
    );
    await updateDoc(doc(getFirebaseDb(), HOUSES, houseId), { members: updatedMembers });
}

export async function saveFcmToken(
    houseId: string,
    currentData: HouseData,
    uid: string,
    token: string
): Promise<void> {
    const member = currentData.members.find((m) => m.uid === uid);
    if (!member) return;

    const currentTokens = member.fcmTokens || [];
    if (currentTokens.includes(token)) return; // Already saved

    // Keep only the last 5 tokens to prevent Bloat (in case they login from many devices)
    const newTokens = [...currentTokens, token].slice(-5);

    await updateMemberProfile(houseId, currentData, uid, { fcmTokens: newTokens });
}

// ───────────────────────── Tasks ─────────────────────────

export async function completeTaskInFirestore(
    houseId: string,
    taskId: string,
    currentData: HouseData,
    completedByUid: string,
    completedByName: string
): Promise<void> {
    const updatedTasks = currentData.tasks.map((task) => {
        if (task.id !== taskId) return task;

        const now = new Date().toISOString();
        const nextIndex = (task.currentIndex + 1) % task.rotation.length;

        return {
            ...task,
            currentIndex: nextIndex,
            lastCompletedDate: now,
            lastCompletedBy: completedByName,
            temporarySwap: null, // clear one-time swap
            manualReminderSent: false, // reset manual reminder
            history: [
                { uid: completedByUid, name: completedByName, date: now },
                ...task.history.slice(0, 49),
            ],
        };
    });

    await updateDoc(doc(getFirebaseDb(), HOUSES, houseId), { tasks: updatedTasks });
}

export async function updateTaskRotation(
    houseId: string,
    taskId: string,
    currentData: HouseData,
    newRotation: string[]
): Promise<void> {
    const updatedTasks = currentData.tasks.map((task) => {
        if (task.id !== taskId) return task;
        return {
            ...task,
            rotation: newRotation,
            currentIndex: task.currentIndex % Math.max(newRotation.length, 1),
        };
    });
    await updateDoc(doc(getFirebaseDb(), HOUSES, houseId), { tasks: updatedTasks });
}

export async function updateTaskFrequency(
    houseId: string,
    taskId: string,
    currentData: HouseData,
    frequencyDays: number | null
): Promise<void> {
    const updatedTasks = currentData.tasks.map((task) => {
        if (task.id !== taskId) return task;
        return { ...task, frequencyDays };
    });
    await updateDoc(doc(getFirebaseDb(), HOUSES, houseId), { tasks: updatedTasks });
}

/**
 * One-time override: sets temporarySwap so the next completion is handled
 * by swappedUid, but the underlying rotation order stays the same.
 */
export async function overrideCurrentAssignee(
    houseId: string,
    taskId: string,
    currentData: HouseData,
    swapWithUid: string
): Promise<void> {
    const updatedTasks = currentData.tasks.map((task) => {
        if (task.id !== taskId) return task;
        const originalUid = task.rotation[task.currentIndex % task.rotation.length];
        return {
            ...task,
            temporarySwap: { originalUid, swappedUid: swapWithUid },
        };
    });
    await updateDoc(doc(getFirebaseDb(), HOUSES, houseId), { tasks: updatedTasks });
}

export async function triggerManualReminder(
    houseId: string,
    taskId: string,
    currentData: HouseData
): Promise<void> {
    const updatedTasks = currentData.tasks.map((task) => {
        if (task.id !== taskId) return task;
        return { ...task, manualReminderSent: true };
    });
    await updateDoc(doc(getFirebaseDb(), HOUSES, houseId), { tasks: updatedTasks });
}

export async function updateHouseName(houseId: string, name: string): Promise<void> {
    await updateDoc(doc(getFirebaseDb(), HOUSES, houseId), { name });
}

// ───────────────────────── Feedback ─────────────────────────

export async function addFeedback(
    houseId: string,
    currentData: HouseData,
    text: string,
    authorUid: string,
    authorName: string
): Promise<void> {
    const item: FeedbackItem = {
        id: generateId(),
        text,
        authorUid,
        authorName,
        status: 'new',
        createdAt: new Date().toISOString(),
    };
    await updateDoc(doc(getFirebaseDb(), HOUSES, houseId), {
        feedback: [...(currentData.feedback || []), item],
    });
}

export async function updateFeedbackStatus(
    houseId: string,
    currentData: HouseData,
    itemId: string,
    newStatus: FeedbackItem['status']
): Promise<void> {
    const updated = (currentData.feedback || []).map((f) =>
        f.id !== itemId ? f : { ...f, status: newStatus }
    );
    await updateDoc(doc(getFirebaseDb(), HOUSES, houseId), { feedback: updated });
}

// ───────────────────────── Shopping ─────────────────────────

export async function addShoppingItem(
    houseId: string,
    currentData: HouseData,
    text: string,
    addedByUid: string,
    addedByName: string
): Promise<void> {
    const item: ShoppingItem = {
        id: generateId(),
        text,
        addedByUid,
        addedByName,
        claimedByUid: null,
        claimedByName: null,
        completed: false,
        createdAt: new Date().toISOString(),
    };
    await updateDoc(doc(getFirebaseDb(), HOUSES, houseId), {
        shoppingList: [...(currentData.shoppingList || []), item],
    });
}

export async function claimShoppingItem(
    houseId: string,
    currentData: HouseData,
    itemId: string,
    uid: string,
    name: string
): Promise<void> {
    const updated = (currentData.shoppingList || []).map((s) =>
        s.id !== itemId ? s : { ...s, claimedByUid: uid, claimedByName: name }
    );
    await updateDoc(doc(getFirebaseDb(), HOUSES, houseId), { shoppingList: updated });
}

export async function unclaimShoppingItem(
    houseId: string,
    currentData: HouseData,
    itemId: string
): Promise<void> {
    const updated = (currentData.shoppingList || []).map((s) =>
        s.id !== itemId ? s : { ...s, claimedByUid: null, claimedByName: null }
    );
    await updateDoc(doc(getFirebaseDb(), HOUSES, houseId), { shoppingList: updated });
}

export async function completeShoppingItem(
    houseId: string,
    currentData: HouseData,
    itemId: string
): Promise<void> {
    const updated = (currentData.shoppingList || []).map((s) =>
        s.id !== itemId ? s : { ...s, completed: true }
    );
    await updateDoc(doc(getFirebaseDb(), HOUSES, houseId), { shoppingList: updated });
}

export async function removeShoppingItem(
    houseId: string,
    currentData: HouseData,
    itemId: string
): Promise<void> {
    const updated = (currentData.shoppingList || []).filter((s) => s.id !== itemId);
    await updateDoc(doc(getFirebaseDb(), HOUSES, houseId), { shoppingList: updated });
}
