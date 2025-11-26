from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for easier deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Game(BaseModel):
    id: str
    title: str
    description: str
    thumbnail: str
    url: str
    category: str

# Mock Database
games_db = [
    {
        "id": "Code-dash",
        "title": "Code-dash",
        "description": "A stealth game disguised as a code editor. Avoid errors and fix bugs!",
        "thumbnail": "/thumbnails/codedash.png", 
        "url": "https://game1-xi-snowy.vercel.app/", 
        "category": "Action"
    },
    {
        "id": "neon-racer",
        "title": "Neon Racer",
        "description": "Navigate data streams and avoid firewalls in this terminal-based racer. Press ESC for stealth mode.",
        "thumbnail": "/thumbnails/neon-racer.png",
        "url": "https://hidden-desk-ptvg.vercel.app",
        "category": "Racing"
    },
    {
        "id": "pixel-quest",
        "title": "Pixel Quest",
        "description": "Defend your canvas from glitch pixels in this paint-tool disguised RPG. Press ESC to switch to work mode.",
        "thumbnail": "/thumbnails/pixel-quest.png",
        "url": "https://hidden-desk-9hye.vercel.app/",
        "category": "RPG"
    },
    {
        "id": "cell-invaders",
        "title": "Cell Invaders",
        "description": "Eliminate error codes in this spreadsheet shooter. Looks exactly like work. Press ESC for chart mode.",
        "thumbnail": "/thumbnails/cell-invaders.png",
        "url": "https://cellinvader.vercel.app/",
        "category": "Shooter"
    },
    {
        "id": "paper-reader",
        "title": "Paper Reader",
        "description": "Highlight key terms and avoid typos in this PDF-themed runner. Press ESC for abstract view.",
        "thumbnail": "/thumbnails/paper-reader.png",
        "url": "https://paperreader.vercel.app/",
        "category": "Runner"
    },
    {
        "id": "git-merge",
        "title": "Git Merge",
        "description": "Resolve merge conflicts by connecting commit nodes. Looks like a Git GUI. Press ESC for terminal mode.",
        "thumbnail": "/thumbnails/git-merge.png",
        "url": "https://gitmerge.vercel.app/",
        "category": "Puzzle"
    }
]

@app.get("/")
def read_root():
    return {"message": "Welcome to the Game Hub API"}

@app.get("/api/games", response_model=List[Game])
def get_games():
    return games_db

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
