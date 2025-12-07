import React, { useState, useEffect } from "react";
import { TrendingUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "./StatCard";
import { ConnectionStatus } from "./ConnectionStatus";
import { TradesSummaryCard } from "./TradesSummaryCard";
import { TradeEntryForm } from "./TradeEntryForm";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { AnnouncementBanner } from "./AnnouncementBanner";

export function Dashboard() {
  const [showTradeForm, setShowTradeForm] = useState(false);
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [mt5Status, setMt5Status] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.user_id) {
        setLoading(true);
        try {
          const statsRes = await api.get(`/trades/stats/user/${user.user_id}`);
          setStats(statsRes.data);

          const mt5Res = await api.get(`/users/${user.user_id}/mt5-status`);
          setMt5Status(mt5Res.data);
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [user?.user_id]);

  const profitFactor = (stats?.total_loss !== 0 && stats?.total_loss !== undefined) ? Math.abs((stats?.total_profit || 0) / stats?.total_loss).toFixed(2) : "∞";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 lg:px-6 py-8">
      {/* Announcement Banner */}
      <div className="mb-6">
        <AnnouncementBanner />
      </div>

      {/* Dashboard Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8 opacity-0 animate-fade-up">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-primary" />
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
              Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground">
            Welcome back, <span className="font-semibold text-foreground">{user?.first_name} {user?.last_name}</span>! Here's your trading performance.
          </p>
        </div>

        <Button variant="hero" size="xl" className="gap-2 w-full lg:w-auto" onClick={() => setShowTradeForm(true)}>
          <Plus className="w-5 h-5" />
          New Trade
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatCard
          label="Total Trades"
          value={stats?.total_trades?.toString() || "0"}
          animationDelay="0.1s"
        />
        <StatCard
          label="Net Profit"
          value={`$${stats?.net_profit?.toFixed(2) || "0.00"}`}
          animationDelay="0.15s"
        />
        <StatCard
          label="Win Rate"
          value={`${stats?.win_rate?.toFixed(1) || "0.0"}%`}
          animationDelay="0.2s"
        />
        <StatCard
          label="Profit Factor"
          value={profitFactor?.toString() || "0.00"}
          animationDelay="0.25s"
        />
      </div>

      {/* Connection Status */}
      <div className="mb-8">
        <ConnectionStatus
          isConnected={mt5Status?.connected || false}
          accountId={mt5Status?.account || "Not Connected"}
          server={mt5Status?.server || "—"}
          lastFetch={mt5Status?.last_fetch ? new Date(mt5Status.last_fetch).toLocaleString() : "Never"}
        />
      </div>

      {/* Trades Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TradesSummaryCard
          type="winning"
          count={stats?.winning_trades || 0}
          amount={stats?.total_profit || 0}
          animationDelay="0.4s"
        />
        <TradesSummaryCard
          type="losing"
          count={stats?.losing_trades || 0}
          amount={Math.abs(stats?.total_loss || 0)}
          animationDelay="0.45s"
        />
      </div>

      {/* Trade Entry Form Modal */}
      <TradeEntryForm open={showTradeForm} onOpenChange={setShowTradeForm} />
    </main>
  );
}
