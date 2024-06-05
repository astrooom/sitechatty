import { NextResponse } from 'next/server'
import type { NextFetchEvent, NextMiddleware, NextRequest } from 'next/server'
import { getRefreshedAuthToken } from './lib/middleware';

async function middlewareSettings(request: NextRequest) {


  const { pathname, origin, basePath } = request.nextUrl;

  if (`${basePath}${pathname}`.startsWith("/api/auth")) return;

  const response = NextResponse.next()

  const refreshToken = request.cookies.get('refresh_token')
  let accessToken = request.cookies.get('access_token')

  /*
  * If refresh token is available and access token is expired, refresh access token and set refresh token cookie
  */
  if (refreshToken?.value && !accessToken?.value) {
    console.log("Access token expired, refreshing...")
    const { access_token: newAuthToken } = await getRefreshedAuthToken(refreshToken.value);
    response.cookies.set({
      name: 'access_token',
      value: newAuthToken.value,
      maxAge: newAuthToken.max_age,
      path: '/',
      sameSite: 'strict',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    })

    // Update access token directly to avoid below logic to trigger redirect.
    accessToken = {
      name: 'access_token', value: newAuthToken.value
    };
  }

  /*
  * If user tries to access the dashboard and access token does not exist, redirect user to login page
  */
  if (pathname?.startsWith("/dashboard") && !accessToken?.value) {
    console.log("Access token missing, redirecting to login...")
    const loginUrl = new URL('/auth/login', origin);
    return NextResponse.redirect(loginUrl);
  }

  return response
}

function withHostFromHeaders(middleware: NextMiddleware) {
  return (...args: [NextRequest, NextFetchEvent]) => {
    const [request] = args;

    const hostHeader = request.headers.get("Host");

    if (hostHeader) {
      const [host, port = ""] = hostHeader.split(":");
      if (host) {
        request.nextUrl.host = host;
        request.nextUrl.port = port;
      }
    }

    return middleware(...args);
  };
}


export default withHostFromHeaders(middlewareSettings);