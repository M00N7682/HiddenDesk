from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Optional
from datetime import datetime, timedelta
import database, models, schemas

router = APIRouter(prefix="/api/leaderboard", tags=["leaderboard"])

# Valid game IDs
VALID_GAME_IDS = [
    "vscode-stealth", "neon-racer", "pixel-quest", 
    "cell-invaders", "paper-reader", "git-merge", "network-flow"
]

@router.post("/scores", response_model=schemas.Score)
def submit_score(score: schemas.ScoreCreate, db: Session = Depends(database.get_db)):
    """Submit a new score for a game"""
    # Validate game_id
    if score.game_id not in VALID_GAME_IDS:
        raise HTTPException(status_code=400, detail=f"Invalid game_id. Must be one of: {VALID_GAME_IDS}")
    
    # Validate player_name
    if not score.player_name or len(score.player_name.strip()) < 1:
        raise HTTPException(status_code=400, detail="Player name is required")
    if len(score.player_name) > 50:
        raise HTTPException(status_code=400, detail="Player name must be 50 characters or less")
    
    # Validate score
    if score.score < 0:
        raise HTTPException(status_code=400, detail="Score must be non-negative")
    
    db_score = models.Score(
        game_id=score.game_id,
        player_name=score.player_name.strip(),
        score=score.score
    )
    db.add(db_score)
    db.commit()
    db.refresh(db_score)
    return db_score

@router.get("/games/{game_id}", response_model=List[schemas.LeaderboardEntry])
def get_game_leaderboard(
    game_id: str,
    period: Optional[str] = Query("all", regex="^(all|weekly|monthly)$"),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(database.get_db)
):
    """Get leaderboard for a specific game"""
    if game_id not in VALID_GAME_IDS:
        raise HTTPException(status_code=400, detail=f"Invalid game_id. Must be one of: {VALID_GAME_IDS}")
    
    query = db.query(models.Score).filter(models.Score.game_id == game_id)
    
    # Apply time filter
    if period == "weekly":
        week_ago = datetime.utcnow() - timedelta(days=7)
        query = query.filter(models.Score.created_at >= week_ago)
    elif period == "monthly":
        month_ago = datetime.utcnow() - timedelta(days=30)
        query = query.filter(models.Score.created_at >= month_ago)
    
    scores = query.order_by(desc(models.Score.score)).limit(limit).all()
    
    # Add rank to each entry
    return [
        schemas.LeaderboardEntry(
            rank=idx + 1,
            player_name=score.player_name,
            score=score.score,
            created_at=score.created_at
        )
        for idx, score in enumerate(scores)
    ]

@router.get("/global", response_model=dict)
def get_global_leaderboard(
    period: Optional[str] = Query("all", regex="^(all|weekly|monthly)$"),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(database.get_db)
):
    """Get global leaderboard across all games (top players by total score)"""
    query = db.query(
        models.Score.player_name,
        func.sum(models.Score.score).label('total_score'),
        func.count(models.Score.id).label('games_played')
    )
    
    # Apply time filter
    if period == "weekly":
        week_ago = datetime.utcnow() - timedelta(days=7)
        query = query.filter(models.Score.created_at >= week_ago)
    elif period == "monthly":
        month_ago = datetime.utcnow() - timedelta(days=30)
        query = query.filter(models.Score.created_at >= month_ago)
    
    results = query.group_by(models.Score.player_name)\
                   .order_by(desc('total_score'))\
                   .limit(limit)\
                   .all()
    
    return {
        "period": period,
        "rankings": [
            {
                "rank": idx + 1,
                "player_name": row.player_name,
                "total_score": row.total_score,
                "games_played": row.games_played
            }
            for idx, row in enumerate(results)
        ]
    }

@router.get("/player/{player_name}", response_model=dict)
def get_player_stats(player_name: str, db: Session = Depends(database.get_db)):
    """Get stats for a specific player"""
    scores = db.query(models.Score).filter(models.Score.player_name == player_name).all()
    
    if not scores:
        raise HTTPException(status_code=404, detail="Player not found")
    
    # Group by game
    game_stats = {}
    for score in scores:
        if score.game_id not in game_stats:
            game_stats[score.game_id] = {
                "best_score": score.score,
                "plays": 1,
                "last_played": score.created_at
            }
        else:
            game_stats[score.game_id]["plays"] += 1
            if score.score > game_stats[score.game_id]["best_score"]:
                game_stats[score.game_id]["best_score"] = score.score
            if score.created_at > game_stats[score.game_id]["last_played"]:
                game_stats[score.game_id]["last_played"] = score.created_at
    
    total_score = sum(s.score for s in scores)
    
    return {
        "player_name": player_name,
        "total_score": total_score,
        "total_plays": len(scores),
        "games": game_stats
    }

@router.get("/games/{game_id}/rank/{player_name}", response_model=dict)
def get_player_rank(
    game_id: str,
    player_name: str,
    db: Session = Depends(database.get_db)
):
    """Get a player's best rank for a specific game"""
    if game_id not in VALID_GAME_IDS:
        raise HTTPException(status_code=400, detail=f"Invalid game_id")
    
    # Get player's best score
    player_best = db.query(models.Score)\
        .filter(models.Score.game_id == game_id, models.Score.player_name == player_name)\
        .order_by(desc(models.Score.score))\
        .first()
    
    if not player_best:
        raise HTTPException(status_code=404, detail="No scores found for this player in this game")
    
    # Count how many unique players have a higher score
    higher_count = db.query(func.count(func.distinct(models.Score.player_name)))\
        .filter(
            models.Score.game_id == game_id,
            models.Score.score > player_best.score
        ).scalar()
    
    rank = higher_count + 1
    
    return {
        "game_id": game_id,
        "player_name": player_name,
        "best_score": player_best.score,
        "rank": rank
    }




