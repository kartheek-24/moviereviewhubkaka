import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AnalyticsData {
  totalVisitors: number;
  totalPageviews: number;
  avgPageviewsPerVisit: number;
  avgSessionDuration: number;
  bounceRate: number;
  visitorsTimeline: Array<{
    date: string;
    visitors: number;
    pageviews: number;
  }>;
  deviceTypes: Array<{
    device: string;
    visitors: number;
    fill: string;
  }>;
  topPages: Array<{
    page: string;
    views: number;
  }>;
  sources: Array<{
    source: string;
    visitors: number;
  }>;
  countries: Array<{
    country: string;
    visitors: number;
  }>;
  lastUpdated: string;
}

export function useAnalytics(days: number = 30) {
  return useQuery({
    queryKey: ["analytics", days],
    queryFn: async (): Promise<AnalyticsData> => {
      const { data, error } = await supabase.functions.invoke("get-analytics", {
        body: { days },
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}
