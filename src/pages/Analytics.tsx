import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, MessageSquare, ThumbsUp, Film, Users, BarChart3 } from 'lucide-react';
import { useReviews, useLanguages } from '@/hooks/useReviews';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
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

  return (
    <div className="min-h-screen cinema-bg">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full safe-area-inset-top">
        <div className="glass-card border-b border-border/50">
          <div className="container flex items-center justify-between h-14 px-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
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
              {/* Stats Cards */}
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
                  <p className="text-2xl font-bold text-primary">
                    {reviews.filter(r => r.tags && r.tags.length > 0).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Tagged Reviews</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </ScrollArea>
    </div>
  );
}
