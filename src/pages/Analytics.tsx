import { Header } from "@/components/layout/Header";
import { BarChart3, TrendingUp, TrendingDown, Target, Percent, DollarSign, Calendar } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

const Analytics = () => {
  const { user } = useAuth();
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrades = async () => {
      if (user?.user_id) {
        try {
          const response = await api.get(`/trades/user/${user.user_id}`);
          setTrades(response.data);
        } catch (error) {
          console.error("Error fetching trades for analytics:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchTrades();
  }, [user?.user_id]);

  // Derived Analytics using Real Data
  // 1. Equity Curve
  let runningEquity = 0; // Assume starting at 0 or base balance. Showing relative growth.
  const equityData = trades
    .sort((a, b) => new Date(a.close_time).getTime() - new Date(b.close_time).getTime())
    .map(t => {
      runningEquity += t.net_profit;
      return {
        date: new Date(t.close_time).toLocaleDateString(),
        equity: parseFloat(runningEquity.toFixed(2))
      };
    });

  // 2. Win/Loss
  const winningTrades = trades.filter(t => t.net_profit > 0).length;
  const losingTrades = trades.filter(t => t.net_profit <= 0).length;
  const winLossData = [
    { name: "Wins", value: winningTrades, color: "hsl(142, 76%, 36%)" },
    { name: "Losses", value: losingTrades, color: "hsl(0, 84%, 60%)" }
  ];

  // 3. Performance by Pair
  const pairPerfMap = new Map();
  trades.forEach(t => {
    const symbol = t.symbol;
    if (!pairPerfMap.has(symbol)) {
      pairPerfMap.set(symbol, { pair: symbol, profit: 0, trades: 0 });
    }
    const data = pairPerfMap.get(symbol);
    data.profit += t.net_profit;
    data.trades += 1;
  });
  const pairPerformance = Array.from(pairPerfMap.values());

  // 4. Summary Stats
  const totalPL = trades.reduce((sum, t) => sum + t.net_profit, 0);
  const winRate = trades.length > 0 ? ((winningTrades / trades.length) * 100).toFixed(1) : "0";
  const bestTrade = Math.max(...trades.map(t => t.net_profit), 0);
  const worstTrade = Math.min(...trades.map(t => t.net_profit), 0);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 lg:px-6 py-8">
        {/* Page Header */}
        <div className="space-y-2 mb-8 opacity-0 animate-fade-up">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground">Analytics</h1>
          </div>
          <p className="text-muted-foreground">Deep insights into your trading performance</p>
        </div>

        {/* Summary Cards */}
        {loading ? (
          <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
        ) : trades.length === 0 ? (
          <div className="text-center p-12 text-muted-foreground">No trades available for analytics yet.</div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
              {[
                { label: "Total P/L", value: `$${totalPL.toFixed(2)}`, icon: DollarSign, color: totalPL >= 0 ? "text-success" : "text-destructive", bg: totalPL >= 0 ? "bg-success/10" : "bg-destructive/10" },
                { label: "Win Rate", value: `${winRate}%`, icon: Target, color: "text-primary", bg: "bg-primary/10" },
                { label: "Best Trade", value: `+$${bestTrade.toFixed(2)}`, icon: TrendingUp, color: "text-success", bg: "bg-success/10" },
                { label: "Worst Trade", value: `$${worstTrade.toFixed(2)}`, icon: TrendingDown, color: "text-destructive", bg: "bg-destructive/10" },
              ].map((stat, i) => (
                <div key={stat.label} className="stat-card opacity-0 animate-fade-up" style={{ animationDelay: `${0.1 + i * 0.05}s` }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${stat.bg}`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
                  </div>
                  <p className={`text-2xl lg:text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Equity Curve with 3D Effect */}
              <div className="lg:col-span-2 glass-card p-6 opacity-0 animate-fade-up" style={{ animationDelay: "0.3s" }}>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Equity Curve
                </h3>
                <div
                  className="h-[300px]"
                  style={{
                    perspective: '1000px',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <div style={{
                    transform: 'rotateX(5deg)',
                    boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
                    borderRadius: '12px',
                    height: '100%',
                    padding: '10px'
                  }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={equityData}>
                        <defs>
                          <linearGradient id="colorEquityPositive" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(142, 76%, 46%)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="hsl(142, 76%, 46%)" stopOpacity={0.1} />
                          </linearGradient>
                          <linearGradient id="colorEquityNegative" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.1} />
                          </linearGradient>
                          <filter id="equityShadow">
                            <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.5" />
                          </filter>
                        </defs>
                        <XAxis dataKey="date" hide={true} />
                        <YAxis hide={true} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                            color: '#ffffff'
                          }}
                          labelStyle={{ color: '#ffffff' }}
                          itemStyle={{ color: '#ffffff' }}
                          formatter={(value: any) => `$${parseFloat(value).toFixed(2)}`}
                        />
                        <Area
                          type="monotone"
                          dataKey="equity"
                          stroke="hsl(142, 76%, 46%)"
                          strokeWidth={3}
                          fill="url(#colorEquityPositive)"
                          dot={(props: any) => {
                            const isNegative = props.payload.equity < 0;
                            return (
                              <circle
                                cx={props.cx}
                                cy={props.cy}
                                r={4}
                                fill={isNegative ? 'hsl(0, 84%, 60%)' : 'hsl(142, 76%, 46%)'}
                                strokeWidth={2}
                                filter="url(#equityShadow)"
                              />
                            );
                          }}
                          activeDot={(props: any) => {
                            const isNegative = props.payload.equity < 0;
                            return (
                              <circle
                                cx={props.cx}
                                cy={props.cy}
                                r={7}
                                fill={isNegative ? 'hsl(0, 84%, 70%)' : 'hsl(142, 76%, 56%)'}
                                stroke={isNegative ? 'hsl(0, 84%, 60%)' : 'hsl(142, 76%, 46%)'}
                                strokeWidth={3}
                              />
                            );
                          }}
                        />
                        {/* Add negative area overlay */}
                        <Area
                          type="monotone"
                          dataKey={(entry: any) => entry.equity < 0 ? entry.equity : null}
                          stroke="hsl(0, 84%, 60%)"
                          strokeWidth={3}
                          fill="url(#colorEquityNegative)"
                          connectNulls={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Win/Loss Ratio with 3D Pizza Style */}
              <div className="glass-card p-6 opacity-0 animate-fade-up" style={{ animationDelay: "0.35s" }}>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Percent className="w-5 h-5 text-primary" />
                  Winning vs Losing Percentage
                </h3>
                <div className="h-[250px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        <filter id="pizzaShadow" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur in="SourceAlpha" stdDeviation="8" />
                          <feOffset dx="0" dy="8" result="offsetblur" />
                          <feComponentTransfer>
                            <feFuncA type="linear" slope="0.5" />
                          </feComponentTransfer>
                          <feMerge>
                            <feMergeNode />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                        <radialGradient id="winGradient">
                          <stop offset="0%" stopColor="hsl(142, 76%, 46%)" />
                          <stop offset="100%" stopColor="hsl(142, 76%, 36%)" />
                        </radialGradient>
                        <radialGradient id="lossGradient">
                          <stop offset="0%" stopColor="hsl(0, 84%, 70%)" />
                          <stop offset="100%" stopColor="hsl(0, 84%, 60%)" />
                        </radialGradient>
                      </defs>
                      <Pie
                        data={winLossData}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        paddingAngle={8}
                        dataKey="value"
                        filter="url(#pizzaShadow)"
                      >
                        <Cell fill="url(#winGradient)" stroke="hsl(142, 76%, 36%)" strokeWidth={3} />
                        <Cell fill="url(#lossGradient)" stroke="hsl(0, 84%, 60%)" strokeWidth={3} />
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          color: '#ffffff'
                        }}
                        labelStyle={{ color: '#ffffff' }}
                        itemStyle={{ color: '#ffffff' }}
                        formatter={(value: any, name: any, props: any) => {
                          const total = winLossData.reduce((sum, entry) => sum + entry.value, 0);
                          const percent = ((value / total) * 100).toFixed(1);
                          return [`${value} trades (${percent}%)`, name];
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  {winLossData.map((item) => {
                    const total = winLossData.reduce((sum, entry) => sum + entry.value, 0);
                    const percent = ((item.value / total) * 100).toFixed(1);
                    return (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-sm" style={{
                          background: item.name === "Wins" ? "linear-gradient(135deg, hsl(142, 76%, 46%), hsl(142, 76%, 36%))" : "linear-gradient(135deg, hsl(0, 84%, 70%), hsl(0, 84%, 60%))",
                          boxShadow: `0 2px 8px ${item.color}80`
                        }} />
                        <span className="text-sm font-medium">{item.name}: {item.value} ({percent}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Performance by Symbol with Enhanced Styling */}
            <div className="glass-card p-6 opacity-0 animate-fade-up" style={{ animationDelay: "0.4s" }}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Performance by Symbol
              </h3>
              <div
                className="h-[300px]"
                style={{
                  perspective: '1200px',
                  transformStyle: 'preserve-3d'
                }}
              >
                <div style={{
                  transform: 'rotateX(5deg)',
                  boxShadow: '0 15px 40px rgba(0, 0, 0, 0.3)',
                  borderRadius: '12px',
                  height: '100%',
                  padding: '10px',
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(30, 41, 59, 0.3))'
                }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pairPerformance} layout="vertical">
                      <defs>
                        {/* Custom gradients for each trading pair */}
                        <linearGradient id="colorUSOIL" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#D35400" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#E67E22" stopOpacity={1} />
                        </linearGradient>
                        <linearGradient id="colorEURUSD" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#2980B9" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#3498DB" stopOpacity={1} />
                        </linearGradient>
                        <linearGradient id="colorGBPUSD" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#8E44AD" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#9B59B6" stopOpacity={1} />
                        </linearGradient>
                        <linearGradient id="colorUSDJPY" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#27AE60" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#2ECC71" stopOpacity={1} />
                        </linearGradient>
                        <linearGradient id="colorUSDCHF" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#C0392B" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#E74C3C" stopOpacity={1} />
                        </linearGradient>
                        <linearGradient id="colorUSDCAD" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#16A085" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#1ABC9C" stopOpacity={1} />
                        </linearGradient>
                        <linearGradient id="colorAUDUSD" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#F39C12" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#F1C40F" stopOpacity={1} />
                        </linearGradient>
                        <linearGradient id="colorNZDUSD" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#2ECC71" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#27AE60" stopOpacity={1} />
                        </linearGradient>
                        <linearGradient id="colorEURGBP" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#3498DB" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#5DADE2" stopOpacity={1} />
                        </linearGradient>
                        <linearGradient id="colorEURJPY" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#9B59B6" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#BB8FCE" stopOpacity={1} />
                        </linearGradient>
                        <linearGradient id="colorGBPJPY" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#1ABC9C" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#48C9B0" stopOpacity={1} />
                        </linearGradient>
                        <linearGradient id="colorBTCUSD" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#F7931A" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#FFA94D" stopOpacity={1} />
                        </linearGradient>
                        <linearGradient id="colorXAUUSD" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#FFD700" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#FFED4E" stopOpacity={1} />
                        </linearGradient>
                        <filter id="barGlow">
                          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                          <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                        <filter id="bar3DShadow">
                          <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.5" />
                        </filter>
                      </defs>
                      <XAxis
                        type="number"
                        stroke="hsl(220, 9%, 46%)"
                        fontSize={12}
                        tickFormatter={(value) => `$${value.toFixed(0)}`}
                      />
                      <YAxis
                        type="category"
                        dataKey="pair"
                        stroke="hsl(220, 9%, 46%)"
                        fontSize={12}
                        width={100}
                      />
                      <Tooltip
                        content={({ active, payload }: any) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div style={{
                                backgroundColor: '#0f172a',
                                border: '1px solid #334155',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                                padding: '12px',
                                color: '#ffffff'
                              }}>
                                <p style={{ fontWeight: 'bold', marginBottom: '4px', color: '#ffffff' }}>
                                  {data.pair}
                                </p>
                                <p style={{ color: '#ffffff' }}>
                                  Profit/Loss: ${parseFloat(data.profit).toFixed(2)}
                                </p>
                                <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>
                                  Trades: {data.trades}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar
                        dataKey="profit"
                        radius={[0, 8, 8, 0]}
                        filter="url(#bar3DShadow)"
                        barSize={35}
                      >
                        {pairPerformance.map((entry, index) => {
                          // Map each symbol to its specific color
                          const symbolColorMap: { [key: string]: string } = {
                            'USOIL/USD': 'colorUSOIL',
                            'EUR/USD': 'colorEURUSD',
                            'GBP/USD': 'colorGBPUSD',
                            'USD/JPY': 'colorUSDJPY',
                            'USD/CHF': 'colorUSDCHF',
                            'USD/CAD': 'colorUSDCAD',
                            'AUD/USD': 'colorAUDUSD',
                            'NZD/USD': 'colorNZDUSD',
                            'EUR/GBP': 'colorEURGBP',
                            'EUR/JPY': 'colorEURJPY',
                            'GBP/JPY': 'colorGBPJPY',
                            'BTC/USD': 'colorBTCUSD',
                            'XAU/USD': 'colorXAUUSD',
                          };

                          const colorId = symbolColorMap[entry.pair] || 'colorEURUSD'; // Default to EUR/USD blue

                          return (
                            <Cell
                              key={`cell-${index}`}
                              fill={`url(#${colorId})`}
                            />
                          );
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Analytics;
