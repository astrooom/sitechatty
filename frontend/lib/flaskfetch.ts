import { cookies, headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { getIp } from './server';

export async function flaskFetch(path: string, options?: RequestInit): Promise<NextResponse> {
  const headersList = headers();
  const ip = getIp(headersList);
  if (!ip) {
    throw new Error("No IP available in request.");
  }

  // Get cookies from client
  const accessToken = cookies().get('access_token')?.value;

  const requestHeaders = new Headers(options?.headers);

  // Set a custom header for the clients ip
  requestHeaders.set('Real-Client-Ip', ip);

  const hasContentTypeHeader = requestHeaders.has("Content-Type");
  if (!hasContentTypeHeader) {
    requestHeaders.set("Content-Type", "application/json");
  }

  // Add auth headers if access token exists
  if (accessToken) {
    requestHeaders.set('Authorization', `Bearer ${accessToken}`);
  } else {
    throw new Error("No access token available.");
  }

  let response = await fetch(`http://flask:3001${path}`, { ...options, headers: requestHeaders });

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
    headers: requestHeaders,
  });
}


