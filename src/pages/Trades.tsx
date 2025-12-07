import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRightLeft, Search, Filter, Download, Plus, ArrowUpDown, TrendingUp, TrendingDown } from "lucide-react";
import { TradeEntryForm } from "@/components/dashboard/TradeEntryForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

const Trades = () => {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [symbolFilter, setSymbolFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const { user } = useAuth();
  const [trades, setTrades] = useState<any[]>([]);

  useEffect(() => {
    const fetchTrades = async () => {
      if (user?.user_id) {
        try {
          const response = await api.get(`/trades/user/${user.user_id}`);
          setTrades(response.data);
        } catch (error) {
          console.error("Error fetching trades:", error);
        }
      }
    };
    fetchTrades();
  }, [user?.user_id]);

  // Filter trades based on search query, symbol, and type
  const filteredTrades = trades.filter((trade) => {
    // Search filter (trade_no, symbol)
    const matchesSearch = searchQuery === "" ||
      trade.trade_no?.toString().includes(searchQuery) ||
      trade.symbol?.toLowerCase().includes(searchQuery.toLowerCase());

    // Symbol filter
    const matchesSymbol = symbolFilter === "all" || trade.symbol === symbolFilter;

    // Type filter
    const matchesType = typeFilter === "all" ||
      trade.type?.toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesSymbol && matchesType;
  });

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 lg:px-6 py-8">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8 opacity-0 animate-fade-up">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <ArrowRightLeft className="w-8 h-8 text-primary" />
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground">Trades</h1>
            </div>
            <p className="text-muted-foreground">View and manage all your trading history</p>
          </div>
          <Button variant="hero" size="xl" className="gap-2" onClick={() => setShowForm(true)}>
            <Plus className="w-5 h-5" />
            New Trade
          </Button>
        </div>

        {/* Filters */}
        <div className="glass-card p-4 mb-6 opacity-0 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by trade number, symbol..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/50"
              />
            </div>
            <Select value={symbolFilter} onValueChange={setSymbolFilter}>
              <SelectTrigger className="w-full lg:w-40 bg-muted/50">
                <SelectValue placeholder="Symbol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Symbols</SelectItem>
                {Array.from(new Set(trades.map(t => t.symbol))).map((symbol) => (
                  <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full lg:w-32 bg-muted/50">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="buy">BUY</SelectItem>
                <SelectItem value="sell">SELL</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              More Filters
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Trades Table */}
        <div className="glass-card overflow-hidden opacity-0 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-semibold">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                    Trade No <ArrowUpDown className="w-3 h-3" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold">Symbol</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Volume</TableHead>
                <TableHead className="font-semibold">Entry</TableHead>
                <TableHead className="font-semibold">Exit</TableHead>
                <TableHead className="font-semibold">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                    P/L <ArrowUpDown className="w-3 h-3" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    {trades.length === 0 ? "No trades found" : "No trades match your filters"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTrades.map((trade) => (
                  <TableRow key={trade.trade_no} className="cursor-pointer hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-sm">{trade.trade_no}</TableCell>
                    <TableCell className="font-semibold">{trade.symbol}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${trade.type?.toString().toUpperCase().includes("BUY") ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                        }`}>
                        {trade.type?.toString().toUpperCase().includes("BUY") ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {trade.type}
                      </span>
                    </TableCell>
                    <TableCell>{trade.volume}</TableCell>
                    <TableCell className="font-mono text-sm">{trade.price_open}</TableCell>
                    <TableCell className="font-mono text-sm">{trade.price_close}</TableCell>
                    <TableCell className={`font-semibold ${trade.net_profit >= 0 ? "text-success" : "text-destructive"}`}>
                      {trade.net_profit >= 0 ? "+" : ""}${trade.net_profit?.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{new Date(trade.open_time).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {filteredTrades.length > 0 && (
            <div className="p-4 border-t text-sm text-muted-foreground">
              Showing {filteredTrades.length} of {trades.length} trades
            </div>
          )}
        </div>

        <TradeEntryForm open={showForm} onOpenChange={setShowForm} />
      </main>
    </div>
  );
};

export default Trades;
