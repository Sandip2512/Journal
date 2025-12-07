import { Header } from "@/components/layout/Header";
import { Plug, Plus, RefreshCw, Trash2, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

const connectedBrokers = [
  {
    id: 1,
    name: "MetaTrader 5",
    server: "FundedNext-Server2",
    account: "13849903",
    status: "connected",
    lastSync: "2 minutes ago",
    trades: 35,
  },
];

const availableBrokers = [
  { id: "mt4", name: "MetaTrader 4", description: "Connect your MT4 trading account", icon: "📊" },
  { id: "mt5", name: "MetaTrader 5", description: "Connect your MT5 trading account", icon: "📈" },
  { id: "ctrader", name: "cTrader", description: "Connect your cTrader account", icon: "💹" },
  { id: "tradingview", name: "TradingView", description: "Import trades from TradingView", icon: "📉" },
];

const BrokerConnections = () => {
  const handleSync = () => {
    toast({
      title: "Syncing...",
      description: "Fetching latest trades from your broker.",
    });
  };

  const handleDisconnect = () => {
    toast({
      title: "Disconnected",
      description: "Broker connection has been removed.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 lg:px-6 py-8 max-w-4xl">
        {/* Page Header */}
        <div className="space-y-2 mb-8 opacity-0 animate-fade-up">
          <div className="flex items-center gap-3">
            <Plug className="w-8 h-8 text-primary" />
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground">Broker Connections</h1>
          </div>
          <p className="text-muted-foreground">Connect your trading accounts to automatically sync trades</p>
        </div>

        {/* Connected Brokers */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success" />
            Connected Accounts
          </h2>
          <div className="space-y-4">
            {connectedBrokers.map((broker, i) => (
              <div
                key={broker.id}
                className="glass-card p-6 border-l-4 border-l-success opacity-0 animate-fade-up"
                style={{ animationDelay: `${0.1 + i * 0.05}s` }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📈</span>
                      <div>
                        <h3 className="font-semibold text-lg">{broker.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Account: {broker.account} | Server: {broker.server}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge className="status-connected gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Connected
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Last sync: {broker.lastSync}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {broker.trades} trades synced
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="success" size="sm" className="gap-2" onClick={handleSync}>
                      <RefreshCw className="w-4 h-4" />
                      Sync Now
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={handleDisconnect}>
                      <Trash2 className="w-4 h-4" />
                      Disconnect
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Available Brokers */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Add New Connection
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableBrokers.map((broker, i) => (
              <div
                key={broker.id}
                className="glass-card p-6 cursor-pointer hover:border-primary/50 transition-all opacity-0 animate-fade-up"
                style={{ animationDelay: `${0.2 + i * 0.05}s` }}
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{broker.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{broker.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{broker.description}</p>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Plug className="w-4 h-4" />
                      Connect
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* API Key Section */}
        <div className="mt-8 glass-card p-6 opacity-0 animate-fade-up" style={{ animationDelay: "0.4s" }}>
          <h3 className="font-semibold mb-4">Manual API Connection</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Can't find your broker? You can manually connect using API credentials.
          </p>
          <Button variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Custom API
          </Button>
        </div>
      </main>
    </div>
  );
};

export default BrokerConnections;
