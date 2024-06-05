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


export type ScannedUrl = {
    id: number
    url: string
    type: string
    is_main: boolean
    site_id: number
    is_used: boolean;
}

type GetSitesAddedSourcesResponse = ScannedUrl[];

export async function getSitesAddedSources(site_id: number) {
    const response = await flaskFetch(`/api/site/${site_id}/added-sources`, { method: 'GET' });
    const data: GetSitesAddedSourcesResponse = await response.json();
    return data;
}

export async function deleteAddedSource(site_id: number, added_source_id: number) {
    const response = await flaskFetch(`/api/site/${site_id}/added-sources/${added_source_id}`, { method: 'DELETE' });
    const data = await response.json();
    return data;
}

/*
* Recieves the sites used sources from the vector db.
* Does not include the contents of these sources, but only the metadata.
*/
export type UsedSource = {
    id: string;
    page_date: number;
    source: string;
    title: string;
    type: string;
    updated_at_datetime: string;
}

type GetSitesUsedSourcesResponse = UsedSource[];
export async function getSitesUsedSources(id: number, options?: RequestInit) {
    const response = await flaskFetch(`/api/site/${id}/used-sources`, {
        method: 'GET',
        ...options
    });
    const data: GetSitesUsedSourcesResponse = await response.json();
    return data;
}

/*
* Add a source (url) to the Vector DB so that the bot can use it.
*/
export async function useSiteSource({
    site_id,
    added_source_id
}: {
    site_id: number
    added_source_id: number
}) {
    const response = await flaskFetch(`/api/site/${site_id}/added-sources/${added_source_id}`, { method: 'POST' });
    const data = await response.json();
    return data;
}

/*
* Remove a source (url) from the Vector DB so that the bot can no longer use it.
*/
export async function unuseSiteSource({
    site_id,
    source
}: {
    site_id: number
    source: string
}) {
    const response = await flaskFetch(`/api/site/${site_id}/used-sources/${source}`, { method: 'DELETE' });
    const data = await response.json();
    return data;
}

/*
* Get the contents of a source
*/
type GetUsedSiteSourceContentsResponse = {
    contents: string
}
export async function getUsedSiteSourceContents({
    site_id,
    source
}: {
    site_id: number
    source: string
}) {
    const response = await flaskFetch(`/api/site/${site_id}/used-sources/${source}`, { method: 'GET' });
    const data: GetUsedSiteSourceContentsResponse = await response.json();
    return data;
}

/*
* Add a user imput to the Vector DB
*/
export async function addUsedSourcesTextInput({
    site_id,
    title,
    content
}: {
    site_id: number
    title: string
    content: string
}) {
    const response = await flaskFetch(`/api/site/${site_id}/used-sources/text-input`, {
        method: 'POST',
        body: JSON.stringify({
            title,
            content
        }),
    });
    const data = await response.json();
    return data;
}