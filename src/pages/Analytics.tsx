import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, MessageSquare, ThumbsUp, Film, Users, BarChart3, Eye, MousePointerClick, Clock, RefreshCw, Globe } from 'lucide-react';
import { useReviews, useLanguages } from '@/hooks/useReviews';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  Legend,
} from 'recharts';
import { format, subDays, startOfDay, parseISO } from 'date-fns';

const CHART_COLORS = [
  'hsl(38, 92%, 50%)',   // Gold primary
  'hsl(220, 70%, 50%)',  // Blue
  'hsl(160, 60%, 45%)',  // Teal
  'hsl(340, 65%, 50%)',  // Pink
  'hsl(280, 60%, 50%)',  // Purple
  'hsl(20, 80%, 50%)',   // Orange
  'hsl(180, 50%, 45%)',  // Cyan
];

export default function Analytics() {
  const navigate = useNavigate();
  const { data: reviews = [], isLoading } = useReviews();
  const { data: languages = [] } = useLanguages();
  const { data: visitorAnalytics, isLoading: analyticsLoading, refetch: refetchAnalytics } = useAnalytics(30);
  const [activeTab, setActiveTab] = useState('visitors');

  // Default analytics data while loading
  const defaultAnalytics = {
    totalVisitors: 0,
    totalPageviews: 0,
    avgPageviewsPerVisit: 0,
    avgSessionDuration: 0,
    bounceRate: 0,
    visitorsTimeline: [],
    deviceTypes: [],
    countries: [],
    topPages: [],
    sources: [],
  };

  const analytics = visitorAnalytics || defaultAnalytics;

  // Calculate stats
  const stats = useMemo(() => {
    const totalReviews = reviews.length;
    const totalComments = reviews.reduce((sum, r) => sum + (r.comment_count || 0), 0);
    const totalHelpful = reviews.reduce((sum, r) => sum + (r.helpful_count || 0), 0);
    const avgRating = reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0';

    return { totalReviews, totalComments, totalHelpful, avgRating };
  }, [reviews]);

  // Reviews by language for pie chart
  const languageData = useMemo(() => {
    const counts: Record<string, number> = {};
    reviews.forEach(r => {
      counts[r.language] = (counts[r.language] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [reviews]);

  // Reviews over time (last 30 days)
  const timelineData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), 29 - i));
      return {
        date: format(date, 'MMM dd'),
        fullDate: date,
        reviews: 0,
        comments: 0,
      };
    });

    reviews.forEach(r => {
      const reviewDate = startOfDay(parseISO(r.created_at));
      const dayIndex = last30Days.findIndex(d => 
        d.fullDate.getTime() === reviewDate.getTime()
      );
      if (dayIndex >= 0) {
        last30Days[dayIndex].reviews += 1;
        last30Days[dayIndex].comments += r.comment_count || 0;
      }
    });

    return last30Days;
  }, [reviews]);

  // Rating distribution
  const ratingData = useMemo(() => {
    const distribution = [
      { rating: '1 Star', count: 0 },
      { rating: '2 Stars', count: 0 },
      { rating: '3 Stars', count: 0 },
      { rating: '4 Stars', count: 0 },
      { rating: '5 Stars', count: 0 },
    ];

    reviews.forEach(r => {
      const index = Math.min(Math.max(Math.floor(r.rating) - 1, 0), 4);
      distribution[index].count += 1;
    });

    return distribution;
  }, [reviews]);

  // Top reviews by engagement
  const topReviews = useMemo(() => {
    return [...reviews]
      .sort((a, b) => (b.helpful_count + b.comment_count) - (a.helpful_count + a.comment_count))
      .slice(0, 5)
      .map(r => ({
        title: r.title.length > 25 ? r.title.substring(0, 25) + '...' : r.title,
        engagement: r.helpful_count + r.comment_count,
        helpful: r.helpful_count,
        comments: r.comment_count,
      }));
  }, [reviews]);

  // Engagement rate calculation
  const engagementRate = useMemo(() => {
    const totalInteractions = stats.totalComments + stats.totalHelpful;
    const rate = analytics.totalVisitors > 0 
      ? ((totalInteractions / analytics.totalVisitors) * 100).toFixed(1)
      : '0';
    return rate;
  }, [stats, analytics.totalVisitors]);

  // Radial data for engagement overview
  const engagementRadialData = useMemo(() => [
    { name: 'Bounce Rate', value: analytics.bounceRate, fill: 'hsl(340, 65%, 50%)' },
    { name: 'Engagement', value: 100 - analytics.bounceRate, fill: 'hsl(160, 60%, 45%)' },
  ], [analytics.bounceRate]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-muted-foreground">
              {entry.name}: <span className="font-medium text-foreground">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className="min-h-full cinema-bg">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full safe-area-inset-top">
        <div className="glass-card border-b border-border/50">
          <div className="container flex items-center justify-between h-14 px-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="text-foreground hover:bg-muted"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold text-foreground flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Analytics Dashboard
            </h1>
            <div className="w-10" />
          </div>
        </div>
      </header>

      <ScrollArea className="h-[calc(100vh-3.5rem)]">
        <main className="container px-4 py-6 pb-20">
          {isLoading || analyticsLoading ? (
            <div className="animate-pulse space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-24 rounded-xl skeleton-shimmer" />
                ))}
              </div>
              <div className="h-80 rounded-xl skeleton-shimmer" />
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              {/* Tab Navigation */}
              <Tabs defaultValue="visitors" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="visitors" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Visitors
                  </TabsTrigger>
                  <TabsTrigger value="content" className="flex items-center gap-2">
                    <Film className="w-4 h-4" />
                    Content
                  </TabsTrigger>
                </TabsList>

                {/* Visitors Tab */}
                <TabsContent value="visitors" className="space-y-6">
                  {/* Real Data Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span>Live data from published app</span>
                      {visitorAnalytics?.lastUpdated && (
                        <span className="text-xs">
                          • Updated {format(new Date(visitorAnalytics.lastUpdated), 'MMM d, h:mm a')}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => refetchAnalytics()}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Refresh
                    </Button>
                  </div>

                  {/* Visitor Stats Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-primary/30 flex items-center justify-center">
                            <Users className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="text-3xl font-bold text-foreground">{analytics.totalVisitors.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Total Visitors</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-blue-500/30">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-blue-500/30 flex items-center justify-center">
                            <Eye className="w-6 h-6 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-3xl font-bold text-foreground">{analytics.totalPageviews.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Page Views</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/30">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-green-500/30 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-green-500" />
                          </div>
                          <div>
                            <p className="text-3xl font-bold text-foreground">{formatDuration(analytics.avgSessionDuration)}</p>
                            <p className="text-xs text-muted-foreground">Avg Session</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-purple-500/30">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-purple-500/30 flex items-center justify-center">
                            <MousePointerClick className="w-6 h-6 text-purple-500" />
                          </div>
                          <div>
                            <p className="text-3xl font-bold text-foreground">{analytics.avgPageviewsPerVisit.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">Pages/Visit</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                  </div>

                  {/* Visitors Timeline Chart */}
                  <Card className="bg-card/50 border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Visitor Traffic
                      </CardTitle>
                      <CardDescription>Visitors and pageviews over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={analytics.visitorsTimeline}>
                            <defs>
                              <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorPageviews" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(220, 70%, 50%)" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="hsl(220, 70%, 50%)" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 25%)" />
                            <XAxis 
                              dataKey="date" 
                              tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 12 }}
                              tickLine={{ stroke: 'hsl(220, 15%, 25%)' }}
                            />
                            <YAxis 
                              tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 12 }}
                              tickLine={{ stroke: 'hsl(220, 15%, 25%)' }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area 
                              type="monotone" 
                              dataKey="visitors" 
                              stroke="hsl(38, 92%, 50%)" 
                              strokeWidth={2}
                              fillOpacity={1} 
                              fill="url(#colorVisitors)" 
                              name="Visitors"
                            />
                            <Area 
                              type="monotone" 
                              dataKey="pageviews" 
                              stroke="hsl(220, 70%, 50%)" 
                              strokeWidth={2}
                              fillOpacity={1} 
                              fill="url(#colorPageviews)" 
                              name="Pageviews"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Three Column Layout */}
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Device Distribution */}
                    <Card className="bg-card/50 border-border/50">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Smartphone className="w-5 h-5 text-primary" />
                          Devices
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={analytics.deviceTypes}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={70}
                                paddingAngle={4}
                                dataKey="visitors"
                              >
                                {analytics.deviceTypes.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                              </Pie>
                              <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-6 mt-2">
                          {analytics.deviceTypes.map((device, i) => (
                            <div key={i} className="flex items-center gap-2">
                              {device.device === 'Mobile' ? 
                                <Smartphone className="w-4 h-4" style={{ color: device.fill }} /> :
                                <Monitor className="w-4 h-4" style={{ color: device.fill }} />
                              }
                              <span className="text-sm text-muted-foreground">{device.device}</span>
                              <span className="text-sm font-medium">{device.visitors}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Review Activity Summary */}
                    <Card className="bg-card/50 border-border/50">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Film className="w-5 h-5 text-primary" />
                          Content Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-foreground">Total Reviews</span>
                              <span className="text-sm font-medium text-foreground">{stats.totalReviews}</span>
                            </div>
                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all duration-500 bg-primary"
                                style={{ width: '100%' }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-foreground">Total Comments</span>
                              <span className="text-sm font-medium text-foreground">{stats.totalComments}</span>
                            </div>
                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all duration-500"
                                style={{ 
                                  width: `${stats.totalReviews > 0 ? Math.min((stats.totalComments / (stats.totalReviews * 10)) * 100, 100) : 0}%`,
                                  backgroundColor: CHART_COLORS[1]
                                }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-foreground">Helpful Votes</span>
                              <span className="text-sm font-medium text-foreground">{stats.totalHelpful}</span>
                            </div>
                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all duration-500"
                                style={{ 
                                  width: `${stats.totalReviews > 0 ? Math.min((stats.totalHelpful / (stats.totalReviews * 10)) * 100, 100) : 0}%`,
                                  backgroundColor: CHART_COLORS[2]
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Engagement Rate */}
                    <Card className="bg-card/50 border-border/50">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <MousePointerClick className="w-5 h-5 text-primary" />
                          Engagement
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <div className="relative inline-flex items-center justify-center">
                            <svg className="w-32 h-32">
                              <circle
                                className="text-muted"
                                strokeWidth="8"
                                stroke="currentColor"
                                fill="transparent"
                                r="52"
                                cx="64"
                                cy="64"
                              />
                              <circle
                                className="text-primary"
                                strokeWidth="8"
                                strokeDasharray={`${(100 - analytics.bounceRate) * 3.27} 327`}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r="52"
                                cx="64"
                                cy="64"
                                style={{ transform: 'rotate(-90deg)', transformOrigin: '64px 64px' }}
                              />
                            </svg>
                            <span className="absolute text-2xl font-bold">{100 - analytics.bounceRate}%</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">Engaged Visitors</p>
                          <p className="text-xs text-muted-foreground">(Bounce rate: {analytics.bounceRate}%)</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Top Reviews and Countries */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Top Reviews by Engagement */}
                    <Card className="bg-card/50 border-border/50">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Eye className="w-5 h-5 text-primary" />
                          Top Reviews
                        </CardTitle>
                        <CardDescription>Most engaging reviews</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          {topReviews.length === 0 ? (
                            <div className="h-full flex items-center justify-center">
                              <p className="text-muted-foreground text-sm">No reviews yet</p>
                            </div>
                          ) : (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={topReviews} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 25%)" />
                                <XAxis 
                                  type="number"
                                  tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 11 }}
                                  tickLine={{ stroke: 'hsl(220, 15%, 25%)' }}
                                />
                                <YAxis 
                                  type="category"
                                  dataKey="title"
                                  tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 11 }}
                                  tickLine={{ stroke: 'hsl(220, 15%, 25%)' }}
                                  width={100}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar 
                                  dataKey="engagement" 
                                  fill="hsl(38, 92%, 50%)" 
                                  radius={[0, 4, 4, 0]}
                                  name="Engagement"
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Country Breakdown */}
                    <Card className="bg-card/50 border-border/50">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Globe className="w-5 h-5 text-primary" />
                          Visitors by Country
                        </CardTitle>
                        <CardDescription>Geographic distribution of visitors</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          {(!analytics.countries || analytics.countries.length === 0) ? (
                            <div className="h-full flex items-center justify-center">
                              <p className="text-muted-foreground text-sm">No country data yet</p>
                            </div>
                          ) : (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart 
                                data={analytics.countries.map((c, i) => ({
                                  ...c,
                                  fill: CHART_COLORS[i % CHART_COLORS.length]
                                }))} 
                                layout="vertical"
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 25%)" />
                                <XAxis 
                                  type="number"
                                  tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 11 }}
                                  tickLine={{ stroke: 'hsl(220, 15%, 25%)' }}
                                />
                                <YAxis 
                                  type="category"
                                  dataKey="country"
                                  tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 11 }}
                                  tickLine={{ stroke: 'hsl(220, 15%, 25%)' }}
                                  width={50}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar 
                                  dataKey="visitors" 
                                  radius={[0, 4, 4, 0]}
                                  name="Visitors"
                                >
                                  {analytics.countries.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                </TabsContent>

                {/* Content Tab */}
                <TabsContent value="content" className="space-y-6">
                  {/* Content Stats Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-card/50 border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                            <Film className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-foreground">{stats.totalReviews}</p>
                            <p className="text-xs text-muted-foreground">Total Reviews</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-card/50 border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-foreground">{stats.totalComments}</p>
                            <p className="text-xs text-muted-foreground">Comments</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-card/50 border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <ThumbsUp className="w-5 h-5 text-green-500" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-foreground">{stats.totalHelpful}</p>
                            <p className="text-xs text-muted-foreground">Helpful Votes</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-card/50 border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-amber-500" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-foreground">{stats.avgRating}</p>
                            <p className="text-xs text-muted-foreground">Avg Rating</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Activity Timeline */}
                  <Card className="bg-card/50 border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Activity (Last 30 Days)
                      </CardTitle>
                      <CardDescription>Reviews and comments over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={timelineData}>
                            <defs>
                              <linearGradient id="colorReviews" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(220, 70%, 50%)" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="hsl(220, 70%, 50%)" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 25%)" />
                            <XAxis 
                              dataKey="date" 
                              tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 11 }}
                              tickLine={{ stroke: 'hsl(220, 15%, 25%)' }}
                              interval="preserveStartEnd"
                            />
                            <YAxis 
                              tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 11 }}
                              tickLine={{ stroke: 'hsl(220, 15%, 25%)' }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area 
                              type="monotone" 
                              dataKey="reviews" 
                              stroke="hsl(38, 92%, 50%)" 
                              fillOpacity={1} 
                              fill="url(#colorReviews)" 
                              name="Reviews"
                            />
                            <Area 
                              type="monotone" 
                              dataKey="comments" 
                              stroke="hsl(220, 70%, 50%)" 
                              fillOpacity={1} 
                              fill="url(#colorComments)" 
                              name="Comments"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Two Column Layout */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Reviews by Language */}
                    <Card className="bg-card/50 border-border/50">
                      <CardHeader>
                        <CardTitle className="text-lg">Reviews by Language</CardTitle>
                        <CardDescription>Distribution across languages</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={languageData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                                label={({ name, percent }) => 
                                  `${name} ${(percent * 100).toFixed(0)}%`
                                }
                                labelLine={{ stroke: 'hsl(220, 10%, 55%)' }}
                              >
                                {languageData.map((_, index) => (
                                  <Cell 
                                    key={`cell-${index}`} 
                                    fill={CHART_COLORS[index % CHART_COLORS.length]} 
                                  />
                                ))}
                              </Pie>
                              <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Rating Distribution */}
                    <Card className="bg-card/50 border-border/50">
                      <CardHeader>
                        <CardTitle className="text-lg">Rating Distribution</CardTitle>
                        <CardDescription>How reviews are rated</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ratingData} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 25%)" />
                              <XAxis 
                                type="number"
                                tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 11 }}
                                tickLine={{ stroke: 'hsl(220, 15%, 25%)' }}
                              />
                              <YAxis 
                                type="category"
                                dataKey="rating"
                                tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 11 }}
                                tickLine={{ stroke: 'hsl(220, 15%, 25%)' }}
                                width={60}
                              />
                              <Tooltip content={<CustomTooltip />} />
                              <Bar 
                                dataKey="count" 
                                fill="hsl(38, 92%, 50%)" 
                                radius={[0, 4, 4, 0]}
                                name="Reviews"
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Top Engaging Reviews */}
                  <Card className="bg-card/50 border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        Most Engaging Reviews
                      </CardTitle>
                      <CardDescription>Reviews with highest interaction</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={topReviews}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 25%)" />
                            <XAxis 
                              dataKey="title"
                              tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 10 }}
                              tickLine={{ stroke: 'hsl(220, 15%, 25%)' }}
                              interval={0}
                              angle={-15}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis 
                              tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 11 }}
                              tickLine={{ stroke: 'hsl(220, 15%, 25%)' }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar 
                              dataKey="helpful" 
                              stackId="a" 
                              fill="hsl(160, 60%, 45%)" 
                              name="Helpful Votes"
                              radius={[0, 0, 0, 0]}
                            />
                            <Bar 
                              dataKey="comments" 
                              stackId="a" 
                              fill="hsl(220, 70%, 50%)" 
                              name="Comments"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Stats Footer */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-4 rounded-lg bg-muted/30">
                      <p className="text-2xl font-bold text-primary">{languages.length}</p>
                      <p className="text-xs text-muted-foreground">Languages</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30">
                      <p className="text-2xl font-bold text-primary">
                        {reviews.filter(r => r.rating >= 4).length}
                      </p>
                      <p className="text-xs text-muted-foreground">Highly Rated (4+)</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30">
                      <p className="text-2xl font-bold text-primary">
                        {reviews.filter(r => r.comment_count > 0).length}
                      </p>
                      <p className="text-xs text-muted-foreground">With Comments</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30">
                      <p className="text-2xl font-bold text-primary">{engagementRate}%</p>
                      <p className="text-xs text-muted-foreground">Engagement Rate</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </main>
      </ScrollArea>
    </div>
  );
}
