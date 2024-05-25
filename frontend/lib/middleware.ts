
type RefreshTokenResponseData = {
  access_token: {
    value: string
    max_age: number
  }
}

export async function getRefreshedAuthToken(refreshToken: string): Promise<RefreshTokenResponseData> {
  const response = await fetch('http://flask:3001/api/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${refreshToken}`
    }
  });

  const { error, data }: { error: string, data: RefreshTokenResponseData } = await response.json();

  if (error) {
    throw new Error("An error occurred while refreshing token");
  }

  return data
}
