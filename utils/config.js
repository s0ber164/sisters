const getBaseUrl = () => {
  // In the browser, use the current window location
  if (typeof window !== 'undefined') {
    return '';  // Use relative URLs in the browser
  }
  
  // In Node.js (API routes)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
};

export const config = {
  baseUrl: getBaseUrl(),
};
