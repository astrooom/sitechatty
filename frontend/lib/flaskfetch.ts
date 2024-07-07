import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function flaskFetch(path: string, options?: RequestInit): Promise<NextResponse> {

  // Get cookies from client
  const accessToken = cookies().get('access_token')?.value;

  const headers = new Headers(options?.headers);
  const hasContentTypeHeader = headers.has("Content-Type");
  if (!hasContentTypeHeader) {
    headers.set("Content-Type", "application/json");
  }

  // Add auth headers if access token exists
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  } else {
    throw new Error("No access token available.");
  }

  let response = await fetch(`http://flask:3001${path}`, { ...options, headers });

  const contentType = response.headers.get('Content-Type');
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();

    // // If error contains error key, throw error
    // if (data.error) {
    //   throw new Error(data.error);
    // }

  } else {
    data = { error: 'Unexpected response format' };
  }

  return NextResponse.json(data, {
    status: response.status,
    headers,
  });
}


