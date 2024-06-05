import { NextResponse } from "next/server"
import { cache } from "react";
import { cookies } from "next/headers";
export type LoginProps = {
  email: string
  password: string
}

type LoginResponseData = {
  access_token: {
    value: string
    max_age: number
  },
  refresh_token: {
    value: string
    max_age: number
  }
}

export async function login({ email, password }: LoginProps) {

  console.log("Logging in...")

  const response = await fetch('http://flask:3001' + '/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password
    })
  })

  const { error, data }: { error: string, data: LoginResponseData } = await response.json()

  if (error) {
    throw new Error(error)
  }

  const { access_token, refresh_token } = data

  if (!access_token.value || !refresh_token.value) {
    throw new Error('Response missing tokens')
  }

  const headers = new Headers();

  headers.set(
    'Set-Cookie',
    `access_token=${access_token.value}; Max-Age=${access_token.max_age}; Path=/; SameSite=strict; HttpOnly;${process.env.NODE_ENV === "production" ? ' Secure' : ''}`);

  headers.append(
    'Set-Cookie',
    `refresh_token=${refresh_token.value}; Max-Age=${refresh_token.max_age}; Path=/; SameSite=strict; HttpOnly;${process.env.NODE_ENV === "production" ? ' Secure' : ''}`);

  return NextResponse.json({ "success": true }, {
    status: response.status,
    headers
  })
}

export async function logout(): Promise<NextResponse> {
  console.log("Logging out...")
  const headers = new Headers();

  // Max-Age=0 removes the cookie
  headers.set(
    'Set-Cookie',
    `access_token=; Max-Age=0; Path=/; SameSite=strict; HttpOnly;${process.env.NODE_ENV === 'production' ? ' Secure' : ''
    }`
  );
  headers.append(
    'Set-Cookie',
    `refresh_token=; Max-Age=0; Path=/; SameSite=strict; HttpOnly;${process.env.NODE_ENV === 'production' ? ' Secure' : ''
    }`
  );

  return NextResponse.json({ "success": true }, {
    status: 200,
    headers,
  });
}

export type User = {
  username: string;
  email: string;
}

export const getCurrentUser = cache(async () => {
  const accessToken = cookies().get('access_token')?.value;
  if (!accessToken) return undefined
  const response = await fetch('http://flask:3001/api/auth/me', {
    method: 'GET',
    headers: { "Authorization": `Bearer ${accessToken}` }
  })
  const data: User = await response.json()
  return data
})