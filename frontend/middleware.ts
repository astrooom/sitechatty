// import { NextResponse } from 'next/server'
import type { NextFetchEvent, NextMiddleware, NextRequest } from 'next/server'

async function middlewareSettings(request: NextRequest) {
  return;

  // const {
  //   pathname,
  //   // origin,
  //   basePath
  // } = request.nextUrl;

  // if (`${basePath}${pathname}`.startsWith("/api/auth")) return;

  // const response = NextResponse.next()

  // return response


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