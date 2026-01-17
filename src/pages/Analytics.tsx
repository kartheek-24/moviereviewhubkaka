import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, MessageSquare, ThumbsUp, Film, Users, BarChart3, Eye, MousePointerClick, Clock, Smartphone, Monitor, Download } from 'lucide-react';
import { useReviews, useLanguages } from '@/hooks/useReviews';
import { usePWAInstallCount, usePWAInstallsByPlatform } from '@/hooks/usePWAInstall';
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

// Mock visitor analytics data (in a real app, this would come from an analytics service)
const visitorAnalytics = {
  totalVisitors: 444,
  totalPageviews: 1273,
  avgPageviewsPerVisit: 2.87,
  avgSessionDuration: 100, // seconds
  bounceRate: 52,
  visitorsTimeline: [
    { date: 'Jan 11', visitors: 10, pageviews: 26 },
    { date: 'Jan 12', visitors: 96, pageviews: 363 },
    { date: 'Jan 13', visitors: 256, pageviews: 688 },
    { date: 'Jan 14', visitors: 82, pageviews: 196 },
  ],
  deviceTypes: [
    { device: 'Mobile', visitors: 434, fill: 'hsl(38, 92%, 50%)' },
    { device: 'Desktop', visitors: 10, fill: 'hsl(220, 70%, 50%)' },
  ],
};

export default function Analytics() {
  const navigate = useNavigate();
  const { data: reviews = [], isLoading } = useReviews();
  const { data: languages = [] } = useLanguages();
  const { count: pwaInstallCount, isLoading: pwaLoading } = usePWAInstallCount();
  const { data: pwaByPlatform, isLoading: pwaByPlatformLoading } = usePWAInstallsByPlatform();
  const [activeTab, setActiveTab] = useState('visitors');

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
    const rate = visitorAnalytics.totalVisitors > 0 
      ? ((totalInteractions / visitorAnalytics.totalVisitors) * 100).toFixed(1)
      : '0';
    return rate;
  }, [stats]);

  // Radial data for engagement overview
  const engagementRadialData = [
    { name: 'Bounce Rate', value: visitorAnalytics.bounceRate, fill: 'hsl(340, 65%, 50%)' },
    { name: 'Engagement', value: 100 - visitorAnalytics.bounceRate, fill: 'hsl(160, 60%, 45%)' },
  ];

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
    <div className="min-h-screen cinema-bg">
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
          {isLoading ? (
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
                  {/* Visitor Stats Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-primary/30 flex items-center justify-center">
                            <Users className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="text-3xl font-bold text-foreground">{visitorAnalytics.totalVisitors}</p>
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
                            <p className="text-3xl font-bold text-foreground">{visitorAnalytics.totalPageviews}</p>
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
                            <p className="text-3xl font-bold text-foreground">{formatDuration(visitorAnalytics.avgSessionDuration)}</p>
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
                            <p className="text-3xl font-bold text-foreground">{visitorAnalytics.avgPageviewsPerVisit}</p>
                            <p className="text-xs text-muted-foreground">Pages/Visit</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-teal-500/20 to-teal-500/5 border-teal-500/30">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-teal-500/30 flex items-center justify-center">
                            <Download className="w-6 h-6 text-teal-500" />
                          </div>
                          <div>
                            <p className="text-3xl font-bold text-foreground">
                              {pwaLoading ? '...' : pwaInstallCount ?? 0}
                            </p>
                            <p className="text-xs text-muted-foreground">App Installs</p>
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
                          <AreaChart data={visitorAnalytics.visitorsTimeline}>
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
                                data={visitorAnalytics.deviceTypes}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={70}
                                paddingAngle={4}
                                dataKey="visitors"
                              >
                                {visitorAnalytics.deviceTypes.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                              </Pie>
                              <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-6 mt-2">
                          {visitorAnalytics.deviceTypes.map((device, i) => (
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
                                strokeDasharray={`${(100 - visitorAnalytics.bounceRate) * 3.27} 327`}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r="52"
                                cx="64"
                                cy="64"
                                style={{ transform: 'rotate(-90deg)', transformOrigin: '64px 64px' }}
                              />
                            </svg>
                            <span className="absolute text-2xl font-bold">{100 - visitorAnalytics.bounceRate}%</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">Engaged Visitors</p>
                          <p className="text-xs text-muted-foreground">(Bounce rate: {visitorAnalytics.bounceRate}%)</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Top Pages and Countries */}
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
                  </div>

                  {/* PWA Installs by Platform */}
                  <Card className="bg-card/50 border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Download className="w-5 h-5 text-primary" />
                        App Installs by Platform
                      </CardTitle>
                      <CardDescription>PWA installations breakdown</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {pwaByPlatformLoading ? (
                        <div className="h-48 flex items-center justify-center">
                          <div className="animate-pulse text-muted-foreground">Loading...</div>
                        </div>
                      ) : pwaByPlatform.length === 0 ? (
                        <div className="h-48 flex items-center justify-center">
                          <p className="text-muted-foreground text-sm">No installations yet</p>
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-6 items-center">
                          <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={pwaByPlatform}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={40}
                                  outerRadius={70}
                                  paddingAngle={4}
                                  dataKey="count"
                                  nameKey="platform"
                                >
                                  {pwaByPlatform.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                  ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="space-y-4">
                            {pwaByPlatform.map((platform, i) => (
                              <div key={i} className="flex items-center gap-4">
                                <div 
                                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                                  style={{ backgroundColor: `${platform.fill}20` }}
                                >
                                  {platform.platform === 'Android' ? (
                                    <Smartphone className="w-5 h-5" style={{ color: platform.fill }} />
                                  ) : platform.platform === 'iOS' ? (
                                    <Smartphone className="w-5 h-5" style={{ color: platform.fill }} />
                                  ) : (
                                    <Monitor className="w-5 h-5" style={{ color: platform.fill }} />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between mb-1">
                                    <span className="text-sm text-foreground">{platform.platform}</span>
                                    <span className="text-sm font-medium text-foreground">{platform.count}</span>
                                  </div>
                                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                    <div 
                                      className="h-full rounded-full transition-all duration-500"
                                      style={{ 
                                        width: `${(platform.count / (pwaInstallCount || 1)) * 100}%`,
                                        backgroundColor: platform.fill
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
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
