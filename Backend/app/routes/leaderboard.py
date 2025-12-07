from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from typing import List, Optional
from datetime import datetime, timedelta
import logging

from app.database import get_db
from app.models.user import User
from app.models.trade import Trade
from app.schemas.leaderboard_schema import LeaderboardEntry, UserRankingResponse

router = APIRouter()
logger = logging.getLogger(__name__)


def calculate_leaderboard_stats(db: Session, time_period: Optional[str] = "all_time"):
    """
    Calculate leaderboard statistics for all users
    
    Args:
        db: Database session
        time_period: Filter trades by time period (all_time, monthly, weekly, daily)
    
    Returns:
        List of leaderboard entries with calculated statistics
    """
    # Determine time filter
    time_filter = None
    if time_period == "weekly":
        time_filter = datetime.now() - timedelta(days=7)
    elif time_period == "monthly":
        time_filter = datetime.now() - timedelta(days=30)
    elif time_period == "daily":
        time_filter = datetime.now() - timedelta(days=1)
    
    # Get all users with their trades
    users = db.query(User).filter(User.role == "user").all()
    
    leaderboard_data = []
    
    for user in users:
        # Query trades for this user
        trades_query = db.query(Trade).filter(Trade.user_id == user.user_id)
        
        # Apply time filter if specified
        if time_filter:
            trades_query = trades_query.filter(Trade.close_time >= time_filter)
        
        trades = trades_query.all()
        
        # Skip users with no trades
        if not trades:
            continue
        
        # Calculate statistics
        total_trades = len(trades)
        winning_trades = sum(1 for t in trades if t.net_profit > 0)
        losing_trades = sum(1 for t in trades if t.net_profit <= 0)
        win_rate = (winning_trades / total_trades * 100) if total_trades > 0 else 0
        
        total_profit = sum(t.profit_amount for t in trades)
        total_loss = sum(t.loss_amount for t in trades)
        net_profit = sum(t.net_profit for t in trades)
        
        avg_profit_per_trade = net_profit / total_trades if total_trades > 0 else 0
        
        best_trade = max((t.net_profit for t in trades), default=0)
        worst_trade = min((t.net_profit for t in trades), default=0)
        
        # Calculate profit factor (total profit / total loss)
        profit_factor = (total_profit / total_loss) if total_loss > 0 else (total_profit if total_profit > 0 else 0)
        
        # Create username from first_name and last_name
        username = f"{user.first_name or ''} {user.last_name or ''}".strip()
        if not username:
            username = user.email.split('@')[0]  # Use email prefix if no name
        
        leaderboard_data.append({
            'user_id': user.user_id,
            'username': username,
            'email': user.email,
            'total_trades': total_trades,
            'winning_trades': winning_trades,
            'losing_trades': losing_trades,
            'win_rate': round(win_rate, 2),
            'net_profit': round(net_profit, 2),
            'total_profit': round(total_profit, 2),
            'total_loss': round(total_loss, 2),
            'avg_profit_per_trade': round(avg_profit_per_trade, 2),
            'best_trade': round(best_trade, 2),
            'worst_trade': round(worst_trade, 2),
            'profit_factor': round(profit_factor, 2),
            'created_at': user.created_at
        })
    
    return leaderboard_data


@router.get("/", response_model=List[LeaderboardEntry])
def get_leaderboard(
    sort_by: str = Query("net_profit", regex="^(net_profit|win_rate|total_trades|profit_factor)$"),
    limit: int = Query(100, ge=1, le=500),
    time_period: str = Query("all_time", regex="^(all_time|monthly|weekly|daily)$"),
    db: Session = Depends(get_db)
):
    """
    Get leaderboard with all users ranked by specified metric
    
    Args:
        sort_by: Metric to sort by (net_profit, win_rate, total_trades, profit_factor)
        limit: Maximum number of entries to return
        time_period: Time period filter (all_time, monthly, weekly, daily)
        db: Database session
    
    Returns:
        List of leaderboard entries sorted by specified metric
    """
    try:
        # Calculate statistics
        leaderboard_data = calculate_leaderboard_stats(db, time_period)
        
        # Sort by specified metric (descending)
        leaderboard_data.sort(key=lambda x: x[sort_by], reverse=True)
        
        # Limit results
        leaderboard_data = leaderboard_data[:limit]
        
        # Add rank
        for idx, entry in enumerate(leaderboard_data, start=1):
            entry['rank'] = idx
        
        return leaderboard_data
    
    except Exception as e:
        logger.error(f"Error fetching leaderboard: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching leaderboard: {str(e)}")


@router.get("/user/{user_id}", response_model=UserRankingResponse)
def get_user_ranking(
    user_id: str,
    sort_by: str = Query("net_profit", regex="^(net_profit|win_rate|total_trades|profit_factor)$"),
    time_period: str = Query("all_time", regex="^(all_time|monthly|weekly|daily)$"),
    db: Session = Depends(get_db)
):
    """
    Get specific user's ranking and statistics
    
    Args:
        user_id: User ID to get ranking for
        sort_by: Metric to sort by (net_profit, win_rate, total_trades, profit_factor)
        time_period: Time period filter (all_time, monthly, weekly, daily)
        db: Database session
    
    Returns:
        User's ranking information including rank, stats, and percentile
    """
    try:
        # Verify user exists
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Calculate full leaderboard
        leaderboard_data = calculate_leaderboard_stats(db, time_period)
        
        # Sort by specified metric
        leaderboard_data.sort(key=lambda x: x[sort_by], reverse=True)
        
        # Find user's position
        user_rank_data = None
        total_users = len(leaderboard_data)
        
        for idx, entry in enumerate(leaderboard_data, start=1):
            entry['rank'] = idx
            if entry['user_id'] == user_id:
                user_rank_data = entry
        
        if not user_rank_data:
            raise HTTPException(status_code=404, detail="User has no trades yet")
        
        # Calculate percentile
        percentile = ((total_users - user_rank_data['rank']) / total_users * 100) if total_users > 0 else 0
        
        return {
            'user_rank': user_rank_data,
            'total_users': total_users,
            'percentile': round(percentile, 2)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching user ranking: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching user ranking: {str(e)}")
