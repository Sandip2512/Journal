import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface OverviewData {
    total_profit: number;
    total_loss: number;
    net_profit: number;
}

interface UserPerformance {
    user_id: string;
    name: string;
    email: string;
    trade_count: number;
    avg_profit: number;
    avg_loss: number;
    avg_net: number;
}

const COLORS = {
    profit: "#10b981",
    loss: "#ef4444",
    profitGradient: ["#10b981", "#059669"],
    lossGradient: ["#ef4444", "#dc2626"]
};

const AdminAnalytics = () => {
    const [overview, setOverview] = useState<OverviewData | null>(null);
    const [userPerformance, setUserPerformance] = useState<UserPerformance[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const [overviewRes, performanceRes] = await Promise.all([
                api.get("/api/admin/analytics/overview"),
                api.get("/api/admin/analytics/user-performance")
            ]);

            setOverview(overviewRes.data);
            setUserPerformance(performanceRes.data);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to fetch analytics data"
            });
        } finally {
            setLoading(false);
        }
    };

    const pieData = overview ? [
        { name: "Total Profit", value: overview.total_profit },
        { name: "Total Loss", value: overview.total_loss }
    ] : [];

    const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                className="font-bold text-sm drop-shadow-lg"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    const CustomBarTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                }}>
                    <p style={{ color: '#ffffff', fontWeight: 'bold', marginBottom: '8px' }}>
                        Trader: {label}
                    </p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ color: '#ffffff', margin: '4px 0' }}>
                            <span style={{ color: entry.color }}>{entry.name}</span>: ${entry.value.toFixed(2)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            Analytics Dashboard
                        </h1>
                        <p className="text-muted-foreground mt-1">Platform-wide performance metrics and user analytics</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                        Live Data
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center space-y-4">
                            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                            <p className="text-muted-foreground">Loading analytics...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="relative overflow-hidden border-green-500/20 bg-gradient-to-br from-green-500/10 via-background to-background">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl"></div>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Profit</CardTitle>
                                    <TrendingUp className="h-5 w-5 text-green-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-green-500">
                                        ${overview?.total_profit.toFixed(2)}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">Platform-wide earnings</p>
                                </CardContent>
                            </Card>

                            <Card className="relative overflow-hidden border-red-500/20 bg-gradient-to-br from-red-500/10 via-background to-background">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl"></div>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Loss</CardTitle>
                                    <TrendingDown className="h-5 w-5 text-red-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-red-500">
                                        ${overview?.total_loss.toFixed(2)}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">Platform-wide losses</p>
                                </CardContent>
                            </Card>

                            <Card className={`relative overflow-hidden ${overview && overview.net_profit >= 0 ? 'border-green-500/20 bg-gradient-to-br from-green-500/10' : 'border-red-500/20 bg-gradient-to-br from-red-500/10'} via-background to-background`}>
                                <div className={`absolute top-0 right-0 w-32 h-32 ${overview && overview.net_profit >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'} rounded-full blur-3xl`}></div>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
                                    <DollarSign className={`h-5 w-5 ${overview && overview.net_profit >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                                </CardHeader>
                                <CardContent>
                                    <div className={`text-3xl font-bold ${overview && overview.net_profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        ${overview?.net_profit.toFixed(2)}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">Overall balance</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Overall P&L Pie Chart */}
                        <Card className="relative overflow-hidden border-primary/20 shadow-2xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
                            <CardHeader>
                                <CardTitle className="text-2xl">Overall Profit & Loss Distribution</CardTitle>
                                <CardDescription>
                                    Platform-wide profitability breakdown with visual representation
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-96 relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent rounded-lg"></div>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <defs>
                                                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                                                    <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
                                                </linearGradient>
                                                <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
                                                    <stop offset="100%" stopColor="#dc2626" stopOpacity={0.8} />
                                                </linearGradient>
                                                <filter id="shadow" height="200%">
                                                    <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.3" />
                                                </filter>
                                            </defs>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={CustomPieLabel}
                                                outerRadius={140}
                                                innerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                                paddingAngle={5}
                                                filter="url(#shadow)"
                                            >
                                                <Cell fill="url(#profitGradient)" stroke="#10b981" strokeWidth={2} />
                                                <Cell fill="url(#lossGradient)" stroke="#ef4444" strokeWidth={2} />
                                            </Pie>
                                            <Tooltip
                                                formatter={(value: number) => `$${value.toFixed(2)}`}
                                                contentStyle={{
                                                    backgroundColor: '#0f172a',
                                                    border: '1px solid #334155',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                                                    color: '#ffffff'
                                                }}
                                                labelStyle={{
                                                    color: '#ffffff'
                                                }}
                                                itemStyle={{
                                                    color: '#ffffff'
                                                }}
                                            />
                                            <Legend
                                                verticalAlign="bottom"
                                                height={36}
                                                iconType="circle"
                                                wrapperStyle={{
                                                    paddingTop: '20px'
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* User Performance Bar Chart */}
                        <Card className="relative overflow-hidden border-primary/20 shadow-2xl">
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
                            <CardHeader>
                                <CardTitle className="text-2xl">User Performance Comparison</CardTitle>
                                <CardDescription>
                                    Average profit and loss metrics across all active traders
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {userPerformance.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-muted-foreground">No user data available</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="h-96 relative mb-8">
                                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent rounded-lg"></div>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    data={userPerformance}
                                                    layout="vertical"
                                                    margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                                                >
                                                    <defs>
                                                        <linearGradient id="barProfitGradient" x1="0" y1="0" x2="1" y2="0">
                                                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                                                            <stop offset="100%" stopColor="#10b981" stopOpacity={1} />
                                                        </linearGradient>
                                                        <linearGradient id="barLossGradient" x1="0" y1="0" x2="1" y2="0">
                                                            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                                                            <stop offset="100%" stopColor="#ef4444" stopOpacity={1} />
                                                        </linearGradient>
                                                        <filter id="barShadow">
                                                            <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.2" />
                                                        </filter>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                                                    <XAxis
                                                        type="number"
                                                        stroke="hsl(var(--muted-foreground))"
                                                        style={{ fontSize: '12px' }}
                                                    />
                                                    <YAxis
                                                        dataKey="name"
                                                        type="category"
                                                        width={110}
                                                        stroke="hsl(var(--muted-foreground))"
                                                        style={{ fontSize: '12px' }}
                                                    />
                                                    <Tooltip content={<CustomBarTooltip />} />
                                                    <Legend
                                                        wrapperStyle={{
                                                            paddingTop: '10px'
                                                        }}
                                                    />
                                                    <Bar
                                                        dataKey="avg_profit"
                                                        fill="url(#barProfitGradient)"
                                                        name="Avg Profit"
                                                        radius={[0, 8, 8, 0]}
                                                        filter="url(#barShadow)"
                                                    />
                                                    <Bar
                                                        dataKey="avg_loss"
                                                        fill="url(#barLossGradient)"
                                                        name="Avg Loss"
                                                        radius={[0, 8, 8, 0]}
                                                        filter="url(#barShadow)"
                                                    />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>

                                        {/* Enhanced User Stats Table */}
                                        <div className="overflow-x-auto rounded-lg border border-border/50 bg-card/50 backdrop-blur">
                                            <table className="w-full text-sm">
                                                <thead className="border-b bg-muted/50">
                                                    <tr className="text-left">
                                                        <th className="p-4 font-semibold">Trader</th>
                                                        <th className="p-4 font-semibold text-right">Total Trades</th>
                                                        <th className="p-4 font-semibold text-right">Avg Profit</th>
                                                        <th className="p-4 font-semibold text-right">Avg Loss</th>
                                                        <th className="p-4 font-semibold text-right">Avg Net</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {userPerformance.map((user, index) => (
                                                        <tr
                                                            key={user.user_id}
                                                            className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                                                        >
                                                            <td className="p-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center font-semibold text-primary">
                                                                        {index + 1}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium">{user.name}</p>
                                                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="p-4 text-right">
                                                                <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                                                                    {user.trade_count}
                                                                </span>
                                                            </td>
                                                            <td className="p-4 text-right">
                                                                <span className="font-semibold text-green-500">
                                                                    ${user.avg_profit.toFixed(2)}
                                                                </span>
                                                            </td>
                                                            <td className="p-4 text-right">
                                                                <span className="font-semibold text-red-500">
                                                                    ${user.avg_loss.toFixed(2)}
                                                                </span>
                                                            </td>
                                                            <td className="p-4 text-right">
                                                                <span className={`font-bold ${user.avg_net >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                                    ${user.avg_net.toFixed(2)}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminAnalytics;
