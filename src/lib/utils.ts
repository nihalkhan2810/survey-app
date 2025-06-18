export function getSurveyUrl(surveyId: string): string {
  // Check if we're in production or have a custom domain set
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  
  return `${baseUrl}/survey/${surveyId}`;
}

export function getBaseUrl(): string {
  // Production URL from environment variable
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  
  // For Vercel deployments
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Fallback to localhost for development
  return typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
}

export function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}