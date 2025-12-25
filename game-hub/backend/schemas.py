from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Score/Leaderboard Schemas
class ScoreBase(BaseModel):
    game_id: str
    player_name: str
    score: int

class ScoreCreate(ScoreBase):
    pass

class Score(ScoreBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

class LeaderboardEntry(BaseModel):
    rank: int
    player_name: str
    score: int
    created_at: datetime

    class Config:
        orm_mode = True

# Comment Schemas
class CommentBase(BaseModel):
    author_name: str
    content: str

class CommentCreate(CommentBase):
    pass

class Comment(CommentBase):
    id: int
    post_id: int
    created_at: datetime

    class Config:
        orm_mode = True

class PostBase(BaseModel):
    title: str
    content: str
    category: str
    author_name: str

class PostCreate(PostBase):
    pass

class Post(PostBase):
    id: int
    created_at: datetime
    views: int
    likes: int
    comments: List[Comment] = []

    class Config:
        orm_mode = True
