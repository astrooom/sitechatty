import { flaskFetch } from "../flaskfetch";

type TestScanUrlResponse = {
  error?: string
  questions?: Record<string, string>
}
export async function testScanUrl({
  url
}: {
  url: string
}) {
  const response = await flaskFetch(`/api/landing/scan`, {
    method: 'POST',
    body: JSON.stringify({
      url
    })
  });
  const data: TestScanUrlResponse = await response.json();
  return data;
}