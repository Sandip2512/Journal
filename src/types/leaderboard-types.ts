export interface LeaderboardEntry {
    rank: number;
    user_id: string;
    username: string;
    email: string;
    total_trades: number;
    winning_trades: number;
    losing_trades: number;
    win_rate: number;
    net_profit: number;
    total_profit: number;
    total_loss: number;
    avg_profit_per_trade: number;
    best_trade: number;
    worst_trade: number;
    profit_factor: number;
    created_at?: string;
}

export interface UserRankingResponse {
    user_rank: LeaderboardEntry;
    total_users: number;
    percentile: number;
}

export type SortByMetric = 'net_profit' | 'win_rate' | 'total_trades' | 'profit_factor';
export type TimePeriod = 'all_time' | 'monthly' | 'weekly' | 'daily';
