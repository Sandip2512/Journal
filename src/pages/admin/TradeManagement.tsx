import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import api from "@/lib/api";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Trade {
    id: number;
    ticket: number;
    symbol: string;
    type: string;
    volume: number;
    net_profit: number;
    close_time: string;
    mistake?: string;
    user_id: string;
}

const TradeManagement = () => {
    const [trades, setTrades] = useState<Trade[]>([]);
    const [users, setUsers] = useState<{ user_id: string; email: string; first_name: string; last_name: string; role: string }[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>("all");
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchTrades();
    }, [selectedUserId]);

    const fetchInitialData = async () => {
        try {
            const [usersResponse] = await Promise.all([
                api.get("/api/admin/users"),
            ]);
            // Filter out admin users
            const filteredUsers = usersResponse.data.filter((user: any) => user.role !== 'admin');
            setUsers(filteredUsers);
        } catch (error) {
            console.error("Failed to fetch initial data", error);
        }
    };

    const fetchTrades = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (selectedUserId && selectedUserId !== "all") {
                params.user_id = selectedUserId;
            }

            const response = await api.get("/api/admin/trades", { params });
            setTrades(response.data.trades);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to fetch trades",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this trade?")) return;

        try {
            await api.delete(`/api/admin/trades/${id}`);
            toast({ title: "Deleted", description: "Trade deleted successfully" });
            setTrades(trades.filter(t => t.id !== id));
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to delete trade" });
        }
    }

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Trade Management</h1>
                <div className="flex items-center gap-2">
                    <select
                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                    >
                        <option value="all">All Users</option>
                        {users.map((user) => (
                            <option key={user.user_id} value={user.user_id}>
                                {user.first_name} {user.last_name} ({user.email})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Ticket</TableHead>
                            <TableHead>Symbol</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Volume</TableHead>
                            <TableHead className="text-right">Profit</TableHead>
                            <TableHead className="text-right">Closed</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : trades.map((trade) => (
                            <TableRow key={trade.id}>
                                <TableCell className="font-mono text-xs">{trade.ticket}</TableCell>
                                <TableCell className="font-bold">{trade.symbol}</TableCell>
                                <TableCell>
                                    <Badge variant={trade.type === 'buy' ? "default" : "destructive"}>
                                        {trade.type.toUpperCase()}
                                    </Badge>
                                </TableCell>
                                <TableCell>{trade.volume}</TableCell>
                                <TableCell className={`text-right font-medium ${trade.net_profit >= 0 ? "text-green-500" : "text-red-500"}`}>
                                    ${trade.net_profit.toFixed(2)}
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground text-xs">
                                    {new Date(trade.close_time).toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive/90"
                                        onClick={() => handleDelete(trade.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {!loading && trades.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    No trades found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </AdminLayout>
    );
};

export default TradeManagement;
