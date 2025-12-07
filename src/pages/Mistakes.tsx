import { Header } from "@/components/layout/Header";
import { AlertTriangle, TrendingDown, Calendar, Tag, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

const Mistakes = () => {
  const { user } = useAuth();
  const [mistakes, setMistakes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMistakes = async () => {
      if (user?.user_id) {
        try {
          const response = await api.get(`/trades/user/${user.user_id}`);
          // Filter trades that have a mistake recorded
          const mistakeTrades = response.data.filter((t: any) => t.mistake && t.mistake.trim() !== "");
          setMistakes(mistakeTrades);
        } catch (error) {
          console.error("Error fetching mistakes:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchMistakes();
  }, [user?.user_id]);

  // Calculate categories dynamically
  const mistakeCategories = mistakes.reduce((acc: any[], trade) => {
    const type = trade.mistake; // In real app, might want to categorize better
    const existing = acc.find(c => c.name === type);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ name: type, count: 1, color: "bg-primary/10 text-primary" });
    }
    return acc;
  }, []);

  const totalLoss = mistakes.reduce((sum, t) => sum + (t.loss_amount || 0), 0);
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 lg:px-6 py-8">
        {/* Page Header */}
        <div className="space-y-2 mb-8 opacity-0 animate-fade-up">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-warning" />
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground">Trading Mistakes</h1>
          </div>
          <p className="text-muted-foreground">Learn from your mistakes to become a better trader</p>
        </div>

        {loading ? (
          <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
        ) : mistakes.length === 0 ? (
          <div className="text-center p-12 text-muted-foreground">No mistakes recorded yet. Good job!</div>
        ) : (
          <>
            {/* Mistake Categories */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              {mistakeCategories.map((cat, i) => (
                <div
                  key={cat.name}
                  className="stat-card cursor-pointer hover:border-primary/50 opacity-0 animate-fade-up"
                  style={{ animationDelay: `${0.1 + i * 0.05}s` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className={cat.color}>{cat.name}</Badge>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{cat.count}</p>
                  <p className="text-xs text-muted-foreground mt-1">occurrences</p>
                </div>
              ))}
            </div>

            {/* Total Loss from Mistakes */}
            <div className="glass-card p-6 mb-8 border-l-4 border-l-destructive opacity-0 animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Loss from Mistakes</p>
                  <p className="text-4xl font-bold text-destructive">-${totalLoss.toFixed(2)}</p>
                </div>
                <div className="p-4 rounded-xl bg-destructive/10">
                  <TrendingDown className="w-8 h-8 text-destructive" />
                </div>
              </div>
            </div>

            {/* Recent Mistakes */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Recent Mistakes
              </h2>

              <div className="space-y-4">
                {mistakes.map((mistake, i) => (
                  <div
                    key={mistake.ticket || i}
                    className="glass-card p-6 cursor-pointer hover:border-primary/30 opacity-0 animate-fade-up"
                    style={{ animationDelay: `${0.35 + i * 0.05}s` }}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <Badge variant="secondary" className="bg-destructive/10 text-destructive">
                            <Tag className="w-3 h-3 mr-1" />
                            {mistake.mistake}
                          </Badge>
                          <span className="text-sm font-semibold">{mistake.symbol}</span>
                          <span className="text-sm text-muted-foreground">{new Date(mistake.close_time).toLocaleDateString()}</span>
                        </div>
                        <p className="text-foreground">{mistake.reason}</p>
                        <div className="p-3 rounded-lg bg-muted/50 border-l-4 border-l-primary">
                          <p className="text-sm">
                            <span className="font-semibold text-primary">Mistake Detail: </span>
                            {mistake.mistake}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Loss</p>
                          <p className="text-xl font-bold text-destructive">${mistake.loss_amount?.toFixed(2) || "0.00"}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Mistakes;
