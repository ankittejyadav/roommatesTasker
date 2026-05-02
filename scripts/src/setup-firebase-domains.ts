import { GoogleAuth } from 'google-auth-library';

const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID?.replace(/^[^=]+=/, '') ?? 'roommatestasker';

const DEV_DOMAIN = process.env.REPLIT_DEV_DOMAIN ?? '';
const PRODUCTION_DOMAIN = process.env.REPLIT_APP_DOMAIN ?? '';

const ALWAYS_ALLOWED = [
    'localhost',
    'roommatestasker.firebaseapp.com',
    'roommatestasker.web.app',
];

async function getAccessToken(): Promise<string> {
    const keyEnv = process.env.FIREBASE_SERVICE_ACCOUNT_KEY ?? '';
    const jsonStart = keyEnv.indexOf('{');
    if (jsonStart === -1 || keyEnv.length - jsonStart < 10) {
        throw new Error(
            'FIREBASE_SERVICE_ACCOUNT_KEY is not configured. ' +
            'Please set this secret to the full JSON of a Firebase service account ' +
            'with Identity Platform Admin permissions.'
        );
    }
    const serviceAccountJson = keyEnv.slice(jsonStart);
    const credentials = JSON.parse(serviceAccountJson);

    const auth = new GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    if (!tokenResponse.token) {
        throw new Error('Failed to obtain access token from service account.');
    }
    return tokenResponse.token;
}

async function getCurrentDomains(token: string): Promise<string[]> {
    const url = `https://identitytoolkit.googleapis.com/admin/v2/projects/${PROJECT_ID}/config`;
    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        const body = await res.text();
        throw new Error(`getProjectConfig failed (${res.status}): ${body}`);
    }
    const data = await res.json() as { authorizedDomains?: string[] };
    return data.authorizedDomains ?? [];
}

async function updateDomains(token: string, domains: string[]): Promise<void> {
    const url =
        `https://identitytoolkit.googleapis.com/admin/v2/projects/${PROJECT_ID}/config` +
        `?updateMask=authorizedDomains`;
    const res = await fetch(url, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ authorizedDomains: domains }),
    });
    if (!res.ok) {
        const body = await res.text();
        throw new Error(`updateProjectConfig failed (${res.status}): ${body}`);
    }
}

async function main() {
    console.log(`Firebase project: ${PROJECT_ID}`);

    const domainsToAdd: string[] = [...ALWAYS_ALLOWED];
    if (DEV_DOMAIN) {
        domainsToAdd.push(DEV_DOMAIN);
        console.log(`Dev domain to add:        ${DEV_DOMAIN}`);
    } else {
        console.warn('REPLIT_DEV_DOMAIN not set — skipping dev domain.');
    }
    if (PRODUCTION_DOMAIN) {
        domainsToAdd.push(PRODUCTION_DOMAIN);
        console.log(`Production domain to add: ${PRODUCTION_DOMAIN}`);
    } else {
        console.log('REPLIT_APP_DOMAIN not set — no production domain to add (set after first deploy).');
    }

    let token: string;
    try {
        token = await getAccessToken();
    } catch (err) {
        console.warn('\n[SKIP] setup-firebase-domains:', (err as Error).message);
        console.warn('Configure FIREBASE_SERVICE_ACCOUNT_KEY in Replit Secrets (full service-account JSON)');
        console.warn('with the "Firebase Authentication Admin" role, then re-run:');
        console.warn('  pnpm --filter @workspace/scripts run setup-firebase-domains\n');
        process.exit(0);
    }

    const current = await getCurrentDomains(token);
    console.log('\nCurrent authorized domains:', current);

    const merged = Array.from(new Set([...current, ...domainsToAdd]));
    const newOnes = merged.filter(d => !current.includes(d));

    if (newOnes.length === 0) {
        console.log('\nAll required domains are already authorized. Nothing to do.');
        return;
    }

    console.log('\nAdding domains:', newOnes);
    await updateDomains(token, merged);
    console.log('\nDone! Updated authorized domains:', merged);
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
