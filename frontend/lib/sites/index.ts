import { flaskFetch } from "@/lib"

import { cache } from "react";

type SourceType = "webpage" | "input"

export type Site = {
  id: number
  name: string
  created_at: string
  updated_at: string
  favicon_url?: string | null
}

type GetSitesResponse = {
  sites: Site[]
}
export async function getSitesUncached() {
  const response = await flaskFetch('/api/site', { method: 'GET' });
  const data: GetSitesResponse = await response.json();
  return data;
}

export const getSites = cache(getSitesUncached);

export type CreateSiteResponse = Site;
export async function createSite({ name }: { name: string }) {
  const response = await flaskFetch('/api/site', {
    method: 'POST',
    body: JSON.stringify({
      name
    })
  });
  const data: CreateSiteResponse = await response.json();
  return data;
}

export type ScannedUrl = {
  id: number
  source: string
  source_type: SourceType
  type: string | null
  site_id: number
  is_used: boolean;
  created_at: string;
  updated_at: string;
}

type GetSitesAddedSourcesResponse = ScannedUrl[];

export async function getSitesAddedSources(site_id: number, options?: RequestInit) {
  const response = await flaskFetch(`/api/site/${site_id}/added-sources`, { method: 'GET', ...options });
  const data: GetSitesAddedSourcesResponse = await response.json();
  return data;
}

export async function addSiteAddedWebpage({
  site_id,
  url
}: {
  site_id: number
  url: string
}) {
  const response = await flaskFetch(`/api/site/${site_id}/added-sources/webpage`, {
    method: 'POST',
    body: JSON.stringify({
      url
    })
  });
  const data = await response.json();
  return data;
}

export async function addSiteScan({
  site_id,
  url,
  max_depth = 2
}: {
  site_id: number
  url: string
  max_depth?: number
}) {
  const response = await flaskFetch(`/api/site/${site_id}/added-sources/scan`, {
    method: 'POST',
    body: JSON.stringify({
      url,
      max_depth
    })
  });
  const data = await response.json();
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
  source_type: SourceType
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
  const response = await flaskFetch(`/api/site/${site_id}/used-sources/${added_source_id}`, { method: 'POST' });
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
  source_type: SourceType
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

/*
* Edit a user imput to the Vector DB
*/
export async function editUsedSourcesTextInput({
  site_id,
  current_title,
  title,
  content
}: {
  site_id: number
  current_title: string
  title: string
  content: string
}) {
  const response = await flaskFetch(`/api/site/${site_id}/used-sources/text-input`, {
    method: 'PATCH',
    body: JSON.stringify({
      current_title,
      title,
      content
    }),
  });
  const data = await response.json();
  return data;
}

type PlaygroundType = "chat" | "sources";

type GetPlaygroundWsDetailsResponse = {
  ws_url: string
  ws_token: string
}
export async function getPlaygroundWsDetails({
  site_id,
  type
}: {
  site_id: number
  type: PlaygroundType
}) {
  console.log("fetching ws details")
  const response = await flaskFetch(`/api/site/${site_id}/playground/ws-details/${type}`, { method: 'GET' });
  const data: GetPlaygroundWsDetailsResponse = await response.json();
  return data;
}