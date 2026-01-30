"""
Telegram 봇 포스팅 모듈
"""
import requests
from typing import Optional
from rich.console import Console

import sys
sys.path.append('..')
from config.settings import TELEGRAM, TEMPLATES, HIDDENDESK_URL, GAMES

console = Console()


class TelegramPoster:
    def __init__(self):
        self.bot_token = TELEGRAM["bot_token"]
        self.channel_id = TELEGRAM["channel_id"]
        self.base_url = f"https://api.telegram.org/bot{self.bot_token}"

    def send_message(
        self,
        text: str,
        chat_id: Optional[str] = None,
        parse_mode: str = "Markdown",
        disable_preview: bool = False,
        dry_run: bool = True,
    ) -> dict:
        """
        Telegram 메시지 전송

        Args:
            text: 메시지 내용
            chat_id: 채널/그룹 ID (기본: 설정된 채널)
            parse_mode: 파싱 모드 (Markdown, HTML)
            disable_preview: 링크 미리보기 비활성화
            dry_run: True면 실제 전송 안함
        """
        target_chat = chat_id or self.channel_id

        result = {
            "chat_id": target_chat,
            "text_preview": text[:100],
            "dry_run": dry_run,
        }

        if dry_run:
            console.print(f"\n[yellow]== DRY RUN (실제 전송 안함) ==[/yellow]")
            console.print(f"[cyan]Chat ID:[/cyan] {target_chat}")
            console.print(f"[cyan]Message:[/cyan]\n{text}")
            result["success"] = True
            result["message"] = "Dry run completed"
            return result

        if not self.bot_token:
            return {"success": False, "error": "Bot token not configured"}

        try:
            response = requests.post(
                f"{self.base_url}/sendMessage",
                json={
                    "chat_id": target_chat,
                    "text": text,
                    "parse_mode": parse_mode,
                    "disable_web_page_preview": disable_preview,
                },
            )

            data = response.json()

            if data.get("ok"):
                result["success"] = True
                result["message_id"] = data["result"]["message_id"]
                console.print(f"[green]Telegram 전송 성공[/green]")
            else:
                result["success"] = False
                result["error"] = data.get("description", "Unknown error")
                console.print(f"[red]Telegram 에러: {result['error']}[/red]")

        except Exception as e:
            result["success"] = False
            result["error"] = str(e)
            console.print(f"[red]에러: {e}[/red]")

        return result

    def send_photo(
        self,
        photo_url: str,
        caption: str,
        chat_id: Optional[str] = None,
        parse_mode: str = "Markdown",
        dry_run: bool = True,
    ) -> dict:
        """이미지와 함께 메시지 전송"""
        target_chat = chat_id or self.channel_id

        result = {
            "chat_id": target_chat,
            "photo_url": photo_url,
            "dry_run": dry_run,
        }

        if dry_run:
            console.print(f"\n[yellow]== DRY RUN (실제 전송 안함) ==[/yellow]")
            console.print(f"[cyan]Chat ID:[/cyan] {target_chat}")
            console.print(f"[cyan]Photo:[/cyan] {photo_url}")
            console.print(f"[cyan]Caption:[/cyan]\n{caption}")
            result["success"] = True
            return result

        if not self.bot_token:
            return {"success": False, "error": "Bot token not configured"}

        try:
            response = requests.post(
                f"{self.base_url}/sendPhoto",
                json={
                    "chat_id": target_chat,
                    "photo": photo_url,
                    "caption": caption,
                    "parse_mode": parse_mode,
                },
            )

            data = response.json()

            if data.get("ok"):
                result["success"] = True
                result["message_id"] = data["result"]["message_id"]
                console.print(f"[green]Telegram 사진 전송 성공[/green]")
            else:
                result["success"] = False
                result["error"] = data.get("description", "Unknown error")

        except Exception as e:
            result["success"] = False
            result["error"] = str(e)

        return result

    def post_hiddendesk_launch(self, dry_run: bool = True) -> dict:
        """HiddenDesk 런칭 포스트"""
        text = TEMPLATES["telegram_post"].format(url=HIDDENDESK_URL)
        return self.send_message(text=text, dry_run=dry_run)

    def post_game_spotlight(self, game_index: int = 0, dry_run: bool = True) -> dict:
        """특정 게임 스포트라이트"""
        game = GAMES[game_index % len(GAMES)]

        text = f"""
*{game['name']}* - {game['disguise']}로 위장!

{game['description']}

Play now: {game['url']}

#{game['name'].replace(' ', '')} #HiddenDesk #웹게임
"""
        return self.send_message(text=text, dry_run=dry_run)

    def get_bot_info(self) -> dict:
        """봇 정보 확인"""
        if not self.bot_token:
            return {"error": "Bot token not configured"}

        try:
            response = requests.get(f"{self.base_url}/getMe")
            return response.json()
        except Exception as e:
            return {"error": str(e)}


def generate_bot_guide():
    """Telegram 봇 생성 가이드"""
    guide = """
[bold cyan]Telegram 봇 생성 방법[/bold cyan]

1. Telegram에서 @BotFather 검색
2. /newbot 명령어 입력
3. 봇 이름 입력 (예: HiddenDesk News)
4. 봇 username 입력 (예: hiddendesk_bot)
5. 토큰 복사 → .env의 TELEGRAM_BOT_TOKEN에 입력

[bold]채널 설정:[/bold]
1. Telegram 채널 생성 (공개 채널 추천)
2. 채널 username 설정 (예: @hiddendesk_channel)
3. 봇을 채널 관리자로 추가
4. .env의 TELEGRAM_CHANNEL_ID에 @username 입력

[dim]토큰 형식: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz[/dim]
"""
    console.print(guide)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Telegram Poster for HiddenDesk")
    parser.add_argument("--guide", action="store_true", help="봇 생성 가이드")
    parser.add_argument("--info", action="store_true", help="봇 정보 확인")
    parser.add_argument("--post", action="store_true", help="포스팅 실행")
    parser.add_argument("--live", action="store_true", help="실제 전송 (기본: dry-run)")

    args = parser.parse_args()

    if args.guide:
        generate_bot_guide()
    elif args.info:
        poster = TelegramPoster()
        info = poster.get_bot_info()
        console.print(info)
    elif args.post:
        poster = TelegramPoster()
        poster.post_hiddendesk_launch(dry_run=not args.live)
    else:
        parser.print_help()
