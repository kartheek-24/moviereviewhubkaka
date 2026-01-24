import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const days = parseInt(url.searchParams.get("days") || "30");
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const formatDate = (d: Date) => d.toISOString().split('T')[0];
    
    const projectId = Deno.env.get("SUPABASE_PROJECT_ID") || "4a69c56c-483f-4cd9-89cb-a01d7493307c";
    
    // For now, return the analytics data structure
    // In production, this would fetch from Lovable's analytics API
    const analyticsData = {
      totalVisitors: 812,
      totalPageviews: 2182,
      avgPageviewsPerVisit: 2.69,
      avgSessionDuration: 126, // seconds
      bounceRate: 56,
      visitorsTimeline: [
        { date: "Jan 11", visitors: 10, pageviews: 26 },
        { date: "Jan 12", visitors: 96, pageviews: 363 },
        { date: "Jan 13", visitors: 256, pageviews: 688 },
        { date: "Jan 14", visitors: 155, pageviews: 343 },
        { date: "Jan 15", visitors: 132, pageviews: 339 },
        { date: "Jan 16", visitors: 33, pageviews: 66 },
        { date: "Jan 17", visitors: 70, pageviews: 224 },
        { date: "Jan 18", visitors: 60, pageviews: 133 },
      ],
      deviceTypes: [
        { device: "Mobile", visitors: 793, fill: "hsl(38, 92%, 50%)" },
        { device: "Desktop", visitors: 19, fill: "hsl(220, 70%, 50%)" },
      ],
      topPages: [
        { page: "/", views: 414 },
        { page: "/review/44f1e515-9b8b-490e-928a-7e60f9179268", views: 256 },
        { page: "/review/b3068959-11f8-4264-9e31-7fa7e9b6be9d", views: 182 },
        { page: "/review/5faa68ff-1750-444e-a642-de2e1fff71aa", views: 167 },
        { page: "/review/0ee22b07-6da7-4ab9-ab7f-14ba080e05bc", views: 121 },
      ],
      sources: [
        { source: "Direct", visitors: 810 },
        { source: "google.com", visitors: 1 },
        { source: "Google Search", visitors: 1 },
      ],
      countries: [
        { country: "US", visitors: 686 },
        { country: "IN", visitors: 117 },
        { country: "CA", visitors: 8 },
        { country: "SE", visitors: 1 },
      ],
      lastUpdated: new Date().toISOString(),
    };

    return new Response(JSON.stringify(analyticsData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch analytics" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
