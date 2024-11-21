const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
};

export const config = {
  baseUrl: getBaseUrl(),
};
