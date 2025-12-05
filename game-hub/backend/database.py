from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# MySQL Connection URL
# Format: mysql+pymysql://<username>:<password>@<host>:<port>/<database_name>
# Please update this with your actual MySQL credentials
# Railway DB URL provided by user (converted to mysql+pymysql)
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:tVuSvzaxeocrXhpypVIMjdIZCLyHfsnA@metro.proxy.rlwy.net:46721/railway")

# Ensure we use pymysql driver if the URL starts with mysql://
if SQLALCHEMY_DATABASE_URL.startswith("mysql://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("mysql://", "mysql+pymysql://", 1)

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
