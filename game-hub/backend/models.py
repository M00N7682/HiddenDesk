from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import database

class Post(database.Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), index=True)
    content = Column(Text)
    category = Column(String(50)) # e.g., 'Discussion', 'Idea', 'Bug'
    author_name = Column(String(50)) # Anonymous name
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)

    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")

class Comment(database.Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"))
    author_name = Column(String(50))
    content = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    post = relationship("Post", back_populates="comments")
