import { flaskFetch } from "@/lib"

export type Site = {
    id: number
    name: string
    created_at: string
    updated_at: string
}

type GetSitesResponse = {
    sites: Site[]
}
export async function getSites() {
    const response = await flaskFetch('/api/site', { method: 'GET' });
    const data: GetSitesResponse = await response.json();
    return data;
}