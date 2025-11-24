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
        "id": "vscode-stealth",
        "title": "VS Code Stealth Runner",
        "description": "A stealth game disguised as a code editor. Avoid errors and fix bugs!",
        "thumbnail": "/thumbnails/vscode-stealth.png", 
        "url": "https://vscode-stealth-game-deploy.vercel.app", 
        "category": "Action"
    },
    {
        "id": "neon-racer",
        "title": "Neon Racer",
        "description": "Navigate data streams and avoid firewalls in this terminal-based racer. Press ESC for stealth mode.",
        "thumbnail": "/thumbnails/neon-racer.png",
        "url": "#",
        "category": "Racing"
    },
    {
        "id": "coming-soon-2",
        "title": "Pixel Quest",
        "description": "An epic 8-bit adventure awaits.",
        "thumbnail": "/thumbnails/pixel-quest.png",
        "url": "#",
        "category": "RPG"
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
