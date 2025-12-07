import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, TrendingUp, UserPlus, FileText, Settings, Loader2, Activity } from "lucide-react";
import api from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

interface AdminStats {
    total_users: number;
    total_trades: number;
    active_users: number;
    new_users_24h: number;
    trades_24h: number;
}

interface ActivityData {
    date: string;
    trades: number;
}

const AdminDashboard = () => {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [activityData, setActivityData] = useState<ActivityData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
        fetchActivityData();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get("/api/admin/system/stats");
            setStats(response.data);
        } catch (error) {
            console.error("Failed to fetch stats", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchActivityData = async () => {
        try {
            const response = await api.get("/api/admin/analytics/activity");
            console.log("Activity data received:", response.data);
            setActivityData(response.data);
        } catch (error) {
            console.error("Failed to fetch activity data", error);
            setActivityData([]);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex h-[50vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card className="bg-primary/5 border-primary/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.total_users}</div>
                        <p className="text-xs text-muted-foreground">{stats?.new_users_24h} new in last 24h</p>
                    </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        <Activity className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.active_users}</div>
                        <p className="text-xs text-muted-foreground">Currently active accounts</p>
                    </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.total_trades}</div>
                        <p className="text-xs text-muted-foreground">{stats?.trades_24h} trades in last 24h</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Activity Chart with 3D Effect */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>System Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        {activityData.length === 0 ? (
                            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                                <p>Loading activity data...</p>
                            </div>
                        ) : (
                            <div
                                className="h-[200px]"
                                style={{
                                    perspective: '1000px',
                                    transformStyle: 'preserve-3d'
                                }}
                            >
                                <div style={{
                                    transform: 'rotateX(5deg)',
                                    boxShadow: '0 10px 30px rgba(139, 92, 246, 0.3)',
                                    borderRadius: '8px',
                                    height: '100%'
                                }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart
                                            data={activityData}
                                            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                                        >
                                            <defs>
                                                <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                                                </linearGradient>
                                                <filter id="shadow">
                                                    <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#8b5cf6" floodOpacity="0.5" />
                                                </filter>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
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
                                                labelStyle={{
                                                    color: '#ffffff'
                                                }}
                                                itemStyle={{
                                                    color: '#ffffff'
                                                }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="trades"
                                                stroke="#8b5cf6"
                                                strokeWidth={4}
                                                fill="url(#activityGradient)"
                                                dot={{
                                                    fill: '#8b5cf6',
                                                    strokeWidth: 2,
                                                    r: 5,
                                                    filter: 'url(#shadow)'
                                                }}
                                                activeDot={{
                                                    r: 8,
                                                    fill: '#a78bfa',
                                                    stroke: '#8b5cf6',
                                                    strokeWidth: 3
                                                }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                            <UserPlus className="h-8 w-8 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Invite User</p>
                                <p className="text-xs text-muted-foreground">Send an invitation email</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
