import type { PageServerLoad } from './$types';
import type Page from './+page.svelte';

export const load: PageServerLoad = async () => {
    //fetch from database to generate
    const cleaningData = [...]; //data logic
    return {
        cleaningData;
    };
};