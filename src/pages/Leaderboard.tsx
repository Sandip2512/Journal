import { Header } from "@/components/layout/Header";
import { Trophy, Medal, TrendingUp, Crown, Star, Flame, ArrowUp, ArrowDown, RefreshCw, Filter } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { leaderboardApi } from "@/lib/api";
import { LeaderboardEntry, SortByMetric, TimePeriod } from "@/types/leaderboard-types";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortByMetric>('net_profit');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all_time');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await leaderboardApi.getLeaderboard(sortBy, 100, timePeriod);
      setLeaderboardData(response.data);
    } catch (error: any) {
      console.error('Error fetching leaderboard:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch leaderboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [sortBy, timePeriod]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchLeaderboard();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, sortBy, timePeriod]);

  const getInitials = (username: string) => {
    const names = username.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
  };

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return null;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const topThree = leaderboardData.slice(0, 3);
  const restOfLeaderboard = leaderboardData.slice(3);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 lg:px-6 py-8">
        {/* Page Header */}
        <div className="space-y-2 mb-8 opacity-0 animate-fade-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground">Leaderboard</h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLeaderboard}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <p className="text-muted-foreground">See how you rank against other traders</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 opacity-0 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Sort by:</span>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortByMetric)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="net_profit">Net Profit</SelectItem>
                <SelectItem value="win_rate">Win Rate</SelectItem>
                <SelectItem value="total_trades">Total Trades</SelectItem>
                <SelectItem value="profit_factor">Profit Factor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Time Period:</span>
            <Select value={timePeriod} onValueChange={(value) => setTimePeriod(value as TimePeriod)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_time">All Time</SelectItem>
                <SelectItem value="monthly">This Month</SelectItem>
                <SelectItem value="weekly">This Week</SelectItem>
                <SelectItem value="daily">Today</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <input
              type="checkbox"
              id="auto-refresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="auto-refresh" className="text-sm text-muted-foreground cursor-pointer">
              Auto-refresh (30s)
            </label>
          </div>
        </div>

        {loading && leaderboardData.length === 0 ? (
          <div className="flex items-center justify-center p-12 glass-card">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : leaderboardData.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 glass-card text-center">
            <div className="p-6 rounded-full bg-primary/10 mb-6">
              <Trophy className="w-16 h-16 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-3">No Data Available</h2>
            <p className="text-muted-foreground max-w-md">
              No traders have recorded any trades yet. Start trading to appear on the leaderboard!
            </p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {topThree.length > 0 && (
              <div className="mb-12 opacity-0 animate-fade-up" style={{ animationDelay: "0.2s" }}>
                <h2 className="text-2xl font-bold mb-6 text-center">Top Performers</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  {/* 2nd Place */}
                  {topThree[1] && (
                    <div className={`glass-card p-6 text-center transform md:translate-y-8 ${topThree[1].user_id === user?.user_id ? 'ring-2 ring-primary' : ''}`}>
                      <div className="flex justify-center mb-4">
                        {getMedalIcon(2)}
                      </div>
                      <Avatar className="w-20 h-20 mx-auto mb-4 ring-4 ring-gray-400">
                        <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-gray-300 to-gray-500 text-white">
                          {getInitials(topThree[1].username)}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-bold text-lg mb-1">{topThree[1].username}</h3>
                      <p className="text-sm text-muted-foreground mb-4">Rank #{topThree[1].rank}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Net Profit:</span>
                          <span className={`font-semibold ${topThree[1].net_profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {formatCurrency(topThree[1].net_profit)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Win Rate:</span>
                          <span className="font-semibold">{topThree[1].win_rate.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Trades:</span>
                          <span className="font-semibold">{topThree[1].total_trades}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 1st Place */}
                  {topThree[0] && (
                    <div className={`glass-card p-6 text-center ${topThree[0].user_id === user?.user_id ? 'ring-2 ring-primary' : ''}`}>
                      <div className="flex justify-center mb-4">
                        {getMedalIcon(1)}
                      </div>
                      <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-yellow-500">
                        <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-yellow-400 to-yellow-600 text-white">
                          {getInitials(topThree[0].username)}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-bold text-xl mb-1">{topThree[0].username}</h3>
                      <p className="text-sm text-muted-foreground mb-4">🏆 Champion</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Net Profit:</span>
                          <span className={`font-semibold ${topThree[0].net_profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {formatCurrency(topThree[0].net_profit)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Win Rate:</span>
                          <span className="font-semibold">{topThree[0].win_rate.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Trades:</span>
                          <span className="font-semibold">{topThree[0].total_trades}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3rd Place */}
                  {topThree[2] && (
                    <div className={`glass-card p-6 text-center transform md:translate-y-8 ${topThree[2].user_id === user?.user_id ? 'ring-2 ring-primary' : ''}`}>
                      <div className="flex justify-center mb-4">
                        {getMedalIcon(3)}
                      </div>
                      <Avatar className="w-20 h-20 mx-auto mb-4 ring-4 ring-amber-600">
                        <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-amber-500 to-amber-700 text-white">
                          {getInitials(topThree[2].username)}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-bold text-lg mb-1">{topThree[2].username}</h3>
                      <p className="text-sm text-muted-foreground mb-4">Rank #{topThree[2].rank}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Net Profit:</span>
                          <span className={`font-semibold ${topThree[2].net_profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {formatCurrency(topThree[2].net_profit)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Win Rate:</span>
                          <span className="font-semibold">{topThree[2].win_rate.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Trades:</span>
                          <span className="font-semibold">{topThree[2].total_trades}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Full Leaderboard Table */}
            <div className="glass-card overflow-hidden opacity-0 animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Rank</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Trader</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold">Net Profit</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold">Win Rate</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold">Total Trades</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold">Profit Factor</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold">Best Trade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {leaderboardData.map((entry, index) => (
                      <tr
                        key={entry.user_id}
                        className={`hover:bg-muted/30 transition-colors ${entry.user_id === user?.user_id ? 'bg-primary/10 ring-1 ring-primary' : ''
                          }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {entry.rank <= 3 && getMedalIcon(entry.rank)}
                            <span className="font-semibold">#{entry.rank}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="text-sm font-semibold">
                                {getInitials(entry.username)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {entry.username}
                                {entry.user_id === user?.user_id && (
                                  <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {entry.winning_trades}W / {entry.losing_trades}L
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`font-semibold ${entry.net_profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {formatCurrency(entry.net_profit)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <span className="font-medium">{entry.win_rate.toFixed(1)}%</span>
                            {entry.win_rate >= 50 ? (
                              <ArrowUp className="w-4 h-4 text-green-500" />
                            ) : (
                              <ArrowDown className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-medium">{entry.total_trades}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`font-medium ${entry.profit_factor >= 1 ? 'text-green-500' : 'text-red-500'}`}>
                            {entry.profit_factor.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-medium text-green-500">
                            {formatCurrency(entry.best_trade)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="mt-8 text-center text-sm text-muted-foreground opacity-0 animate-fade-up" style={{ animationDelay: "0.4s" }}>
              <p>Showing {leaderboardData.length} trader{leaderboardData.length !== 1 ? 's' : ''}</p>
              {autoRefresh && <p className="mt-1">Auto-refreshing every 30 seconds</p>}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Leaderboard;

