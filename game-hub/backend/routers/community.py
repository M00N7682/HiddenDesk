from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, models, schemas, database

router = APIRouter(
    prefix="/api/community",
    tags=["community"]
)

@router.get("/posts", response_model=List[schemas.Post])
def read_posts(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    posts = crud.get_posts(db, skip=skip, limit=limit)
    return posts

@router.post("/posts", response_model=schemas.Post)
def create_post(post: schemas.PostCreate, db: Session = Depends(database.get_db)):
    return crud.create_post(db=db, post=post)

@router.get("/posts/{post_id}", response_model=schemas.Post)
def read_post(post_id: int, db: Session = Depends(database.get_db)):
    db_post = crud.get_post(db, post_id=post_id)
    if db_post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return db_post

@router.post("/posts/{post_id}/comments", response_model=schemas.Comment)
def create_comment(post_id: int, comment: schemas.CommentCreate, db: Session = Depends(database.get_db)):
    # Verify post exists
    db_post = crud.get_post(db, post_id=post_id)
    if db_post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return crud.create_comment(db=db, comment=comment, post_id=post_id) 
