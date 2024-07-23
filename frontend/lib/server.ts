import "server-only";

export const getIp = (headers: Headers) => {
  // So long as we proxy through Cloudflare, we can trust the "cf-connecting-ip" header, but fall back to x-real-ip and the first "x-forwarded-for" value (typically for dev)
  return (
    headers.get("cf-connecting-ip") ?? headers.get("x-real-ip") ?? headers.get("x-forwarded-for")?.split(",")[0] ?? ""
  );
};
