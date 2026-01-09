from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import Optional
import models, schemas

def get_posts(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    category: Optional[str] = None,
    sort_by: str = "latest",
    search: Optional[str] = None
):
    query = db.query(models.Post)
    
    # Category filter
    if category and category != "all":
        query = query.filter(models.Post.category == category)
    
    # Search filter
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (models.Post.title.ilike(search_term)) | 
            (models.Post.content.ilike(search_term))
        )
    
    # Sorting
    if sort_by == "popular":
        query = query.order_by(desc(models.Post.likes), desc(models.Post.created_at))
    elif sort_by == "views":
        query = query.order_by(desc(models.Post.views), desc(models.Post.created_at))
    elif sort_by == "comments":
        # Sort by comment count (subquery)
        query = query.outerjoin(models.Comment).group_by(models.Post.id)\
            .order_by(desc(func.count(models.Comment.id)), desc(models.Post.created_at))
    else:  # latest
        query = query.order_by(desc(models.Post.created_at))
    
    return query.offset(skip).limit(limit).all()

def get_post(db: Session, post_id: int):
    return db.query(models.Post).filter(models.Post.id == post_id).first()

def create_post(db: Session, post: schemas.PostCreate):
    db_post = models.Post(**post.dict())
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

def increment_views(db: Session, post_id: int):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if post:
        post.views += 1
        db.commit()
        db.refresh(post)
    return post

def toggle_like(db: Session, post_id: int):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if post:
        post.likes += 1
        db.commit()
        db.refresh(post)
    return post

def create_comment(db: Session, comment: schemas.CommentCreate, post_id: int):
    db_comment = models.Comment(**comment.dict(), post_id=post_id)
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

def get_post_stats(db: Session):
    """Get community statistics"""
    total_posts = db.query(func.count(models.Post.id)).scalar()
    total_comments = db.query(func.count(models.Comment.id)).scalar()
    
    # Category breakdown
    categories = db.query(
        models.Post.category,
        func.count(models.Post.id).label('count')
    ).group_by(models.Post.category).all()
    
    return {
        "total_posts": total_posts or 0,
        "total_comments": total_comments or 0,
        "categories": {cat: count for cat, count in categories}
    }
