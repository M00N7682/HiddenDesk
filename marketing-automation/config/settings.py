"""
HiddenDesk Marketing Automation - 설정
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# .env 파일 로드
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

# ============================================
# 플랫폼 API 설정
# ============================================

REDDIT = {
    "client_id": os.getenv("REDDIT_CLIENT_ID"),
    "client_secret": os.getenv("REDDIT_CLIENT_SECRET"),
    "username": os.getenv("REDDIT_USERNAME"),
    "password": os.getenv("REDDIT_PASSWORD"),
    "user_agent": os.getenv("REDDIT_USER_AGENT", "HiddenDesk Bot v1.0"),
}

DISCORD_WEBHOOKS = {
    "webgames": os.getenv("DISCORD_WEBHOOK_WEBGAMES"),
    "indiegames": os.getenv("DISCORD_WEBHOOK_INDIEGAMES"),
}

TELEGRAM = {
    "bot_token": os.getenv("TELEGRAM_BOT_TOKEN"),
    "channel_id": os.getenv("TELEGRAM_CHANNEL_ID"),
}

TWITTER = {
    "api_key": os.getenv("TWITTER_API_KEY"),
    "api_secret": os.getenv("TWITTER_API_SECRET"),
    "access_token": os.getenv("TWITTER_ACCESS_TOKEN"),
    "access_secret": os.getenv("TWITTER_ACCESS_SECRET"),
}

# ============================================
# HiddenDesk 콘텐츠
# ============================================

HIDDENDESK_URL = "https://hiddendesk.ddstudio.co.kr"

GAMES = [
    {
        "name": "Cell Invaders",
        "disguise": "Excel",
        "url": f"{HIDDENDESK_URL}/cell-invaders",
        "description": "Excel 스프레드시트로 위장한 슈팅 게임. #ERROR! 셀들을 처치하세요!",
        "tags": ["excel", "shooter", "office", "stealth"],
    },
    {
        "name": "Code Dash",
        "disguise": "VS Code",
        "url": f"{HIDDENDESK_URL}/code-dash",
        "description": "VS Code 에디터로 위장한 러너 게임. 버그를 피하고 코드를 모으세요!",
        "tags": ["vscode", "runner", "programming", "stealth"],
    },
    {
        "name": "Neon Racer",
        "disguise": "Terminal",
        "url": f"{HIDDENDESK_URL}/neon-racer",
        "description": "터미널 콘솔로 위장한 레이싱 게임. ASCII 아트로 달리세요!",
        "tags": ["terminal", "racing", "ascii", "stealth"],
    },
    {
        "name": "Git Merge",
        "disguise": "Git Client",
        "url": f"{HIDDENDESK_URL}/git-merge",
        "description": "Git 클라이언트로 위장한 퍼즐 게임. 브랜치를 연결하세요!",
        "tags": ["git", "puzzle", "programming", "stealth"],
    },
    {
        "name": "Paper Reader",
        "disguise": "PDF Viewer",
        "url": f"{HIDDENDESK_URL}/paper-reader",
        "description": "PDF 뷰어로 위장한 스네이크 게임. 형광펜으로 먹이를 모으세요!",
        "tags": ["pdf", "snake", "document", "stealth"],
    },
    {
        "name": "Network Flow",
        "disguise": "Network Monitor",
        "url": f"{HIDDENDESK_URL}/network-flow",
        "description": "네트워크 모니터로 위장한 파이프 퍼즐 게임!",
        "tags": ["network", "puzzle", "pipes", "stealth"],
    },
    {
        "name": "Pixel Quest",
        "disguise": "Paint",
        "url": f"{HIDDENDESK_URL}/pixel-quest",
        "description": "그림판으로 위장한 슈팅 게임. 색깔 브러시로 적을 처치하세요!",
        "tags": ["paint", "shooter", "art", "stealth"],
    },
]

# ============================================
# 타겟 서브레딧
# ============================================

TARGET_SUBREDDITS = [
    "WebGames",
    "IndieGaming",
    "playmygame",
    "incremental_games",
    "BrowserGames",
    # "gaming",  # 대형 서브레딧은 규칙 엄격
]

# ============================================
# 메시지 템플릿
# ============================================

TEMPLATES = {
    "reddit_launch": {
        "title": "I made browser games disguised as work apps - play games at work without getting caught!",
        "body": """Hey everyone!

I built **HiddenDesk** - a collection of browser games that look exactly like productivity apps.

**The games:**
- **Cell Invaders** - Looks like Excel, plays like Space Invaders
- **Code Dash** - Looks like VS Code, plays like a runner game
- **Neon Racer** - Looks like Terminal, ASCII racing game
- **Git Merge** - Looks like a Git client, puzzle game
- And more...

**The twist:** Press ESC anytime and it instantly switches to a real-looking work screen!

Play here: {url}

Would love to hear your feedback! What other "work apps" should I disguise games as?
""",
    },
    "discord_announce": {
        "title": "HiddenDesk - Games Disguised as Work Apps",
        "description": "Play browser games that look like Excel, VS Code, and Terminal. Press ESC to instantly switch to a fake work screen!",
        "color": 0x00FF88,  # HiddenDesk green
    },
    "telegram_post": """
*HiddenDesk* - 회사에서 몰래 즐기는 게임

Excel, VS Code, Terminal로 위장한 브라우저 게임!
ESC 누르면 진짜 업무화면으로 변신

{url}

#게임 #웹게임 #직장인 #HiddenDesk
""",
}
