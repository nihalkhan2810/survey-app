import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getSurveyUrl(surveyId: string): string {
  const baseUrl = appUrl;
  return `${baseUrl}/survey/${surveyId}`;
}

export function getSubmitUrl(surveyId: string): string {
  const baseUrl = appUrl;
  return `${baseUrl}/api/submit`;
}

export function getBaseUrl(): string {
  return appUrl;
}