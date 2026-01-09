from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import crud, models, schemas, database

router = APIRouter(
    prefix="/api/community",
    tags=["community"]
)

# Valid categories
VALID_CATEGORIES = ["Discussion", "Idea", "Bug", "Showcase", "Help"]
VALID_SORT_OPTIONS = ["latest", "popular", "views", "comments"]

@router.get("/stats")
def get_stats(db: Session = Depends(database.get_db)):
    """Get community statistics"""
    return crud.get_post_stats(db)

@router.get("/posts", response_model=List[schemas.Post])
def read_posts(
    skip: int = 0, 
    limit: int = 100,
    category: Optional[str] = Query(None, description="Filter by category"),
    sort: Optional[str] = Query("latest", regex="^(latest|popular|views|comments)$"),
    search: Optional[str] = Query(None, description="Search in title and content"),
    db: Session = Depends(database.get_db)
):
    """Get posts with optional filtering, sorting, and search"""
    posts = crud.get_posts(
        db, 
        skip=skip, 
        limit=limit,
        category=category,
        sort_by=sort,
        search=search
    )
    return posts

@router.post("/posts", response_model=schemas.Post)
def create_post(post: schemas.PostCreate, db: Session = Depends(database.get_db)):
    # Validate category
    if post.category not in VALID_CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Invalid category. Must be one of: {VALID_CATEGORIES}")
    return crud.create_post(db=db, post=post)

@router.get("/posts/{post_id}", response_model=schemas.Post)
def read_post(post_id: int, db: Session = Depends(database.get_db)):
    db_post = crud.get_post(db, post_id=post_id)
    if db_post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return db_post

@router.post("/posts/{post_id}/view")
def increment_view(post_id: int, db: Session = Depends(database.get_db)):
    """Increment view count for a post"""
    db_post = crud.increment_views(db, post_id=post_id)
    if db_post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"views": db_post.views}

@router.post("/posts/{post_id}/like")
def like_post(post_id: int, db: Session = Depends(database.get_db)):
    """Like a post (increment like count)"""
    db_post = crud.toggle_like(db, post_id=post_id)
    if db_post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"likes": db_post.likes}

@router.post("/posts/{post_id}/comments", response_model=schemas.Comment)
def create_comment(post_id: int, comment: schemas.CommentCreate, db: Session = Depends(database.get_db)):
    """Add a comment to a post"""
    db_post = crud.get_post(db, post_id=post_id)
    if db_post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return crud.create_comment(db=db, comment=comment, post_id=post_id) 
