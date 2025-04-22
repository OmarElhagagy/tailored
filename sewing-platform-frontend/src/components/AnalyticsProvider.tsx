'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { analytics } from '../utils/analytics';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

/**
 * Analytics Provider component that initializes Azure Application Insights 
 * and tracks page views as users navigate the site
 */
export default function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Fetch analytics configuration from backend
    const fetchAnalyticsConfig = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/config`);
        const data = await response.json();
        
        // Initialize Azure Application Insights if configuration is available
        if (data.analytics?.azureAppInsights) {
          const { connectionString, instrumentationKey } = data.analytics.azureAppInsights;
          analytics.init(connectionString, instrumentationKey);
        }
      } catch (error) {
        console.error('Failed to load analytics configuration:', error);
      }
    };

    fetchAnalyticsConfig();
  }, []);

  // Track page views when the route changes
  useEffect(() => {
    if (pathname) {
      // Construct the full URL including search parameters
      let url = pathname;
      if (searchParams && searchParams.toString()) {
        url += `?${searchParams.toString()}`;
      }
      
      // Track the page view
      analytics.trackPageView(document.title, url);
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
} 